import d3 from 'd3'
import _ from 'lodash'

import NaicsTree from '../../../support/NaicsTree'

import { currencyMeasures, 
         firmageLabels, 
         requestedRatioMeasures, 
         requestedRawMeasures } from '../../../support/qwi'

import { updateFirstAndLastQuarterWithData, 
         resetFirstAndLastQuarterWithData,
         newOverviewTableDataComparator, 
         tooltipComparator,
         lineGraphDataTransformer, } from '../../../support/sharedReducers'

import industryTitles from '../../../support/industryTitles'


const colors = d3.scale.category20c()
let colorMappings = Object.keys(industryTitles).sort().reduce((acc, naics, i) => _.set(acc, naics, colors(i)), {}) 





import { 
  QWI_MSA_CHANGE,
  QWI_MEASURE_CHANGE,
  QWI_MSA_AND_MEASURE_CHANGE,
  QWI_RATIOS_BY_FIRMAGE_DATA_REQUESTED,
  QWI_RATIOS_BY_FIRMAGE_DATA_RECEIVED,
  QWI_RAW_DATA_REQUESTED,
  QWI_RAW_DATA_RECEIVED,
  QWI_LINEGRAPH_FOCUS_CHANGE,
  QWI_SELECTED_QUARTER_CHANGE,
  QWI_SELECTED_QUARTER_WHEEL_CHANGE,
  QWI_OVERVIEW_TABLE_SORT_FIELD_CHANGE,
  QWI_SELECTED_FIRMAGE_CHANGE,
  QWI_SELECTED_FIRMAGE_WHEEL_CHANGE,
  QWI_MOUSE_ENTERED_TOOLTIP_CELL,
  QWI_MOUSE_LEFT_TOOLTIP_CELL,
  QWI_ACTION_ERROR,
  QWI_NULL_ACTION,
} from './actions'



const startQuarter = {
  year: 2001,
  quarter: 1,
}

const endQuarter = {
  year: 2015,
  quarter: 1,
}

const additionalLevels = [{
  'name'   : 'firmage',
  'domain' : _.range(0, 6),
}]

const ratiosTransformers = requestedRatioMeasures.reduce((acc, m) => _.set(acc, m, null), {})

const rawTransformers = requestedRawMeasures.reduce((acc, m) => _.set(acc, m, null), {})



const initialState = {

  msa: null,
  measure: null,

  measureIsCurrency: null,
  
  selectedFirmage: '1',

  selectedQuarter: endQuarter,

  byMsaNaicsTrees: {},

  lineGraphs: {
    focused: 'rawData-lineGraph',
    rawGraphData : null,
    lqGraphData  : null,
  },

  tooltipTable: {
    data: null,
    hoveredNaicsLabel: null,
  },

  selectedFirmageRadarChartData: null,

  acrossFirmagesRadarChartData: null,

  overviewTable: {
    sortField: 'measureLocationQuotient',
    data: null,
  },

  inventory: {
    raw: {},
    ratiosByFirmage: {},
  },

  quarterlyDataCache: {},

  firstQuarterWithData : {
    year: null,
    quarter: null,
  },

  lastQuarterWithData : {
    year : null,
    quarter : null,
  },
}


const setStateField = (state, fieldPath, fieldValue) =>
  _.isEqual(_.get(state, fieldPath), fieldValue) ?  state : _.set(_.clone(state), fieldPath, fieldValue)

   
const handleActionError = (state, action) => {
  console.error(action.payload.error.stack)
  return state
}


const handleSelectedQuarterChange = (state, action) => {
  let newState = setStateField(state, 'selectedQuarter', action.payload.selectedQuarter)

  updateQuarterTrackingVisualizationsData(newState)

  return newState
}


const handleSelectedQuarterWheelChange = (state, action) => {

  let delta = action.payload.delta

  let oldYearQuarter = state.selectedQuarter

  let newYearQuarter = _.clone(oldYearQuarter)

  newYearQuarter.year    = +newYearQuarter.year
  newYearQuarter.quarter = +newYearQuarter.quarter
    
  if (delta < 0) {
  
    if (_.isEqual(oldYearQuarter, startQuarter)) { return state }

    if (newYearQuarter.quarter > 1) {
      newYearQuarter.quarter -= 1
    }  else {
      newYearQuarter.quarter = 4
      newYearQuarter.year -= 1
    }
  }

  if (delta > 0) {
  
    if (_.isEqual(oldYearQuarter, endQuarter)) { return state }

    if (newYearQuarter.quarter < 4) {
      newYearQuarter.quarter += 1
    }  else {
      newYearQuarter.quarter = 1
      newYearQuarter.year += 1
    }
  }

  let newState = setStateField(state, 'selectedQuarter', newYearQuarter)

  updateQuarterTrackingVisualizationsData(newState)

  return newState
}


const updateFirmage = (state, newFirmage) => {

  let newState = setStateField(state, 'selectedFirmage', newFirmage)

  if (state === newState) { return state }

  let oldFirmage = state.selectedFirmage
  let oldFirmageLabel = firmageLabels[oldFirmage]
  let newFirmageLabel = firmageLabels[newFirmage]

  let oldOverviewTableSortField = state.overviewTable.sortField

  let newOverviewTableSortField = oldOverviewTableSortField.replace(oldFirmageLabel, newFirmageLabel)

  _.set(newState, 'overviewTable.sortField', newOverviewTableSortField)
  _.set(newState, 'quarterlyDataCache', {})

  updateAllVisualizationsData(newState)

  return newState
}


const handleSelectedFirmageChange = (state, action) => updateFirmage(state, action.payload.firmage)


const handleSelectedFirmageWheelChange = (state, action) => {
  let oldFirmage = parseInt(state.selectedFirmage)
  let newFirmage = (((((oldFirmage + action.payload.delta)%6)+6)%6)).toString()

  return updateFirmage(state, newFirmage)
}


const handleInventoryUpdate = (dataType, value, state, action) => {
  let path = ['inventory', dataType, action.payload.msa]

  return (_.get(state, path) === value) ? state : _.set(_.clone(state), path, value)
}


const handleDataReceived = (dataType, state, action) => {
  let newState = handleInventoryUpdate(dataType, 'RECEIVED', state, action)

  if (state === newState) { return state }
  
  let msa = action.payload.msa

  let naicsTree = newState.byMsaNaicsTrees[msa] || 
                  (newState.byMsaNaicsTrees[msa] = new NaicsTree(startQuarter, endQuarter, additionalLevels))

  naicsTree.insertData(action.payload.data, (dataType === 'raw') ? rawTransformers : ratiosTransformers)

  updateAllVisualizationsData(newState)

  return newState
}


const handleMsaChange = (state, action) => {
  let newState = setStateField(state, 'msa', action.payload.msa)

  if (newState === state) { return state }

  resetAllVisualizationsData(newState)

  updateAllVisualizationsData(newState)

  return newState
}

const handleMeasureChange = (state, action) => {
  let measure = action.payload.measure

  let newState = setStateField(state, 'measure', measure)

  if (newState === state) { return state }

  resetAllVisualizationsData(newState)

  newState.measureIsCurrency = !!currencyMeasures[measure]

  updateAllVisualizationsData(newState)

  return newState
}

const handleMsaAndMeasureChange = (state, action) => {

  let newState = setStateField(state, 'msa', action.payload.msa)
  newState = setStateField(newState, 'measure', action.payload.measure)

  newState.measureIsCurrency = !!currencyMeasures[action.payload.measure]

  if (newState === state) { return state }

  resetAllVisualizationsData(newState)

  updateAllVisualizationsData(newState)

  return newState
}


const handleFocusedLineGraphChange = (state, action) => {
  let newState = setStateField(state, 'lineGraphs.focused', action.payload.focusedGraph)

  if (newState === state) { return state }

  _.set(newState, 'quarterlyDataCache', {})

  newState.tooltipTable.data = getTooltipTableData(newState)

  return newState
}

const handleOverviewTableSortFieldChange = (state, action) => {
  let newState = setStateField(state, 'overviewTable.sortField', action.payload.sortField)

  if (newState === state) { return state }

  _.set(newState, 'quarterlyDataCache', {})

  newState.overviewTable.data = getOverviewTableData(newState)

  return newState
}

const handleMouseEnteredTooltipNaicsLabel = (state, action) =>
        setStateField(state, 'tooltipTable.hoveredNaicsLabel', action.payload.naics)

const handleMouseLeftTooltipNaicsLabel = (state) =>
        setStateField(state, 'tooltipTable.hoveredNaicsLabel', null)





function getRawLineGraphData (state) {

  let msa     = state.msa
  let measure = state.measure
  let firmage = state.selectedFirmage

  if (!state.byMsaNaicsTrees[msa]) { return null }

  let data = state.byMsaNaicsTrees[msa].queryMeasureDataForSubindustries({ firmage, measure })

  if (!data) { return null }

  updateFirstAndLastQuarterWithData(state, data)

  return lineGraphDataTransformer(data, colorMappings)
}



function getLQLineGraphData (state) {

  let msa     = state.msa
  let measure = state.measure
  let firmage = state.selectedFirmage

  if (!(state.byMsaNaicsTrees[msa] && state.byMsaNaicsTrees['00000'])) { return null }

  let ratioDataForMSA = 
        state.byMsaNaicsTrees[msa].queryMeasureDataForSubindustries({ firmage, measure: `${measure}_ratio`})
  let ratioDataForNation = 
        state.byMsaNaicsTrees['00000'].queryMeasureDataForSubindustries({ firmage, measure: `${measure}_ratio` })

  if (! (ratioDataForMSA && ratioDataForNation)) {
    return null
  }

  let data = _.mapValues(ratioDataForMSA, (msaData, naics) => {

    if (!(msaData && msaData.length)) { return null }

    let natDataForNaics = ratioDataForNation[naics]
    let nat_i = 0

    // Need to align the national and the msa data.
    while ((natDataForNaics[nat_i].year < msaData[0].year) || 
           (natDataForNaics[nat_i].year === msaData[0].year) && (natDataForNaics[nat_i].quarter < msaData[0].quarter)){

      ++nat_i
    }

    // replace all ratioData with the LocationQuotients
    
    let natDataFiller = Number.POSITIVE_INFINITY

    return msaData.map((d) => {
      
      if (!(d.year === natDataForNaics[nat_i].year) && (d.quarter === natDataForNaics[nat_i].quarter)) {
        console.log("!!! Unaligned msa and national data. This shouldn't happen.")
      }

      let newD = _.clone(d)

      let natDataVal = natDataForNaics[nat_i++].value 
        
      if (!natDataVal && d.value) {
        natDataVal = natDataFiller
        newD.filledValue = true
      }

      natDataFiller = natDataVal 

      let lq = (d.value / natDataVal)

      newD.value = lq

      return newD
    })
  })

  updateFirstAndLastQuarterWithData(state, data)

  return data ? lineGraphDataTransformer(data, colorMappings) : null
}


function getTooltipTableData (state) {
  return ((state.lineGraphs.focused==='rawData-lineGraph') ? getRawTooltipTableData : getLQTooltipTableData)(state)
}


function getRawTooltipTableData (state) {

  let msa     = state.msa
  let measure = state.measure
  let firmage = state.selectedFirmage

  let year = state.selectedQuarter.year
  let quarter = state.selectedQuarter.quarter

  if (!state.byMsaNaicsTrees[msa]) { return null }

  // Get the quarter's data for the MSA
  let data = state.byMsaNaicsTrees[msa].queryMeasureDataForSubindustriesForQuarter({ year, quarter, firmage, measure })

  if (!data) { return null }

  // Omit the 'all industries' data, then create a sorter array of data elems.
  return _(data).keys().pull('00').sort().map( (naics) => ({
    color       : colorMappings[naics],
    key         : naics,
    title       : industryTitles[naics],
    value       : (Number.isFinite(_.get(data, [naics, 'value'], NaN))) ? data[naics].value : 'No data.',
    filledValue : _.get(data, [naics, 'filledValue'], false),
  })).sort(tooltipComparator).value()
}


function getLQTooltipTableData (state) {

  let msa     = state.msa
  let reqMeasure = `${state.measure}_ratio`
  let firmage = state.selectedFirmage

  let year = state.selectedQuarter.year
  let quarter = state.selectedQuarter.quarter

  if (!(state.byMsaNaicsTrees[msa] && state.byMsaNaicsTrees['00000'])) { return null }

  let ratioDataForMSA = 
        state.byMsaNaicsTrees[msa]
             .queryMeasureDataForSubindustriesForQuarter({ year, quarter, firmage, measure: reqMeasure })
  let ratioDataForNation = 
        state.byMsaNaicsTrees['00000']
             .queryMeasureDataForSubindustriesForQuarter({ year, quarter, firmage, measure: reqMeasure })

  if (! (ratioDataForMSA && ratioDataForNation)) { return null }

  // Omit the 'all industries' data, then create a sorter array of data elems.
  return _(ratioDataForMSA).keys().pull('00').sort().map( (naics) => {

    let value = _.get(ratioDataForMSA, [naics, 'value'], NaN) / _.get(ratioDataForNation, [naics, 'value'], NaN)

    return {
      color       : colorMappings[naics],
      key         : naics,
      title       : industryTitles[naics],
      value       : (Number.isFinite(value)) ? value : 'No data.',
      filledValue : _.get(ratioDataForMSA, [naics, 'filledValue'], false),
    }
  }).sort(tooltipComparator).value()
}


function getSelectedFirmageRadarChartData (state) {

  let msa     = state.msa
  let measure = state.measure
  let firmage = state.selectedFirmage

  let year = state.selectedQuarter.year
  let quarter = state.selectedQuarter.quarter

  if (!state.byMsaNaicsTrees[msa]) { return null }

  let acrossFirmagesData = 
        state.byMsaNaicsTrees[msa].queryMeasureDataForSubindustriesForQuarter({ year, quarter, firmage: '0', measure })
  let selectedFirmageData = 
        state.byMsaNaicsTrees[msa].queryMeasureDataForSubindustriesForQuarter({ year, quarter, firmage, measure })

  if (!(acrossFirmagesData && selectedFirmageData)) { return null }

  // value is the industry's measure for the firmage relative to the
  // industry measure across all firmages, for the MSA.
  return _(industryTitles).keys().pull('00').sort().map((naics) => ({
    axis  : industryTitles[naics].substring(0,6),
    value : (_.get(selectedFirmageData, [naics, 'value'], 0) / 
            (_.get(acrossFirmagesData, [naics, 'value']) || Number.POSITIVE_INFINITY))
  })).value()
}


function getAcrossFirmagesRadarChartData (state) {

  let msa     = state.msa
  let measure = state.measure

  let year = state.selectedQuarter.year
  let quarter = state.selectedQuarter.quarter

  if (!state.byMsaNaicsTrees[msa]) { return null }

  let data = state.byMsaNaicsTrees[msa]
                  .queryMeasureDataForSubindustriesForQuarter({ year, quarter, firmage: '0', measure })

  if (!data) { return null }

  // value is the industry's measure for the across firmages relative to the
  // measure for the MSA's economy as a whole
  return _(industryTitles).keys().pull('00').sort().map((naics) => ({
    axis  : industryTitles[naics].substring(0,6),
    value : (_.get(data, [naics, 'value'], 0) / (_.get(data, ['00', 'value']) || Number.POSITIVE_INFINITY))
  })).value()
}


function getOverviewTableData (state) {

  let msa     = state.msa
  let measure = state.measure
  let firmage = state.selectedFirmage

  let year = state.selectedQuarter.year
  let quarter = state.selectedQuarter.quarter

  if (!(state.byMsaNaicsTrees[msa] && state.byMsaNaicsTrees['00000'])) { return null }

  let rawDataForFirmage = 
        state.byMsaNaicsTrees[msa]
             .queryMeasureDataForSubindustriesForQuarter({ year, quarter, firmage, measure })

  let ratioDataForFirmage =
        state.byMsaNaicsTrees[msa]
             .queryMeasureDataForSubindustriesForQuarter({ year, quarter, firmage, measure: `${measure}_ratio` })

  let rawDataAcrossFirmages = 
        state.byMsaNaicsTrees[msa]
             .queryMeasureDataForSubindustriesForQuarter({ year, quarter, firmage: '0', measure })

  let ratioDataForNation =
        state.byMsaNaicsTrees['00000']
             .queryMeasureDataForSubindustriesForQuarter({ year, quarter, firmage, measure: `${measure}_ratio` })

  if (!(rawDataForFirmage && ratioDataForFirmage && rawDataAcrossFirmages && ratioDataForNation)) { return null }


  let tableData = {}

  // For consistent ordering of the column names.
  tableData.__columns = [
    'naicsCode',
    'sectorTitle',
    'measureForFirmage',
    'measureForAllFirmages',
    'measureLocationQuotient',
  ]
 
  tableData.__columnNames = {
    naicsCode               : 'NAICS Code',
    sectorTitle             : 'Sector Title',
    measureForFirmage       : `${measure} for ${firmageLabels[firmage]} firms`,
    measureForAllFirmages   : `${measure} for all firmages`,
    measureLocationQuotient : 'Location Quotient',
  }


  let measureIsCurrency = state.measureIsCurrency

  let stringifier = (d, isCurrency, filledValue, numOfDecimals = 0) => (Number.isFinite(d)) ? 
        `${(isCurrency)?'$':''}${parseFloat(d.toFixed(numOfDecimals)).toLocaleString()}${filledValue?'*':''}` : 'No data'

  let naicsCodes = Object.keys(industryTitles)

  naicsCodes.forEach((naics) => {

    let measureForFirmage = _.get(rawDataForFirmage, [naics, 'value'], NaN)
    let measureFilled = _.get(rawDataForFirmage, [naics, 'filledValue'])

    let measureForAllFirmages = _.get(rawDataAcrossFirmages, [naics, 'value'], NaN)
    let measureForAllFirmagesFilled = _.get(rawDataAcrossFirmages, [naics, 'filledValue'])

    let ratioForFirmage = _.get(ratioDataForFirmage, [naics, 'value'], NaN) 
    let ratioForFirmageFilled = _.get(ratioDataForFirmage, [naics, 'filledValue'])

    let ratioForNation = _.get(ratioDataForNation, [naics, 'value'], NaN)
    let ratioForNationFilled = _.get(ratioDataForNation, [naics, 'filledValue'])

    let lq = ratioForFirmage / ratioForNation
    let lqFilled =(ratioForFirmageFilled || ratioForNationFilled) 

    _.set(tableData, [naics, 'naicsCode'], naics)
    _.set(tableData, [naics, 'sectorTitle'], industryTitles[naics])
    _.set(tableData, [naics, 'measureForFirmage'], stringifier(measureForFirmage, measureIsCurrency, measureFilled))
    _.set(tableData, [naics, 'measureForAllFirmages'], stringifier(measureForAllFirmages, 
                                                                   measureIsCurrency, 
                                                                   measureForAllFirmagesFilled))
    _.set(tableData, [naics, 'measureLocationQuotient'], stringifier(lq, false, lqFilled, 3))
  })


  let sortField = state.overviewTable.sortField
  let overviewDataComparator = newOverviewTableDataComparator(sortField, tableData)

  // Provided the requested sorted order for the table rows.
  tableData.__naicsRowOrder = naicsCodes.sort(overviewDataComparator)

  return tableData
}



function updateAllVisualizationsData (state) {

  _.set(state, 'quarterlyDataCache', {})

  resetFirstAndLastQuarterWithData(state)

  state.lineGraphs.rawGraphData = getRawLineGraphData(state)
  state.lineGraphs.lqGraphData =  getLQLineGraphData(state)

  state.selectedQuarter = state.lastQuarterWithData

  updateQuarterTrackingVisualizationsData(state)
}


function updateQuarterTrackingVisualizationsData (state) {

  let qtrString = `${state.selectedQuarter.year}|${state.selectedQuarter.quarter}`

  let cache = state.quarterlyDataCache[qtrString]
  if (cache) {
    state.selectedFirmageRadarChartData = cache.selectedFirmageRadarChartData

    state.acrossFirmagesRadarChartData = cache.acrossFirmagesRadarChartData

    state.tooltipTable.data = cache.tooltipTableData

    state.overviewTable.data = cache.overviewTableData

    return
  }

debugger
  state.quarterlyDataCache[qtrString] = {
    selectedFirmageRadarChartData : (state.selectedFirmageRadarChartData = getSelectedFirmageRadarChartData(state)),

    acrossFirmagesRadarChartData  : (state.acrossFirmagesRadarChartData  = getAcrossFirmagesRadarChartData(state)),

    tooltipTableData : (state.tooltipTable.data = getTooltipTableData(state)),

    overviewTableData : (state.overviewTable.data = getOverviewTableData(state))
  }

  console.log(state)
}



function resetAllVisualizationsData (state) {

  state.lineGraphs.rawGraphData = null
  state.lineGraphs.lqGraphData = null

  state.tooltipTable.data = null

  state.selectedFirmageRadarChartData = null

  state.acrossFirmagesRadarChartData = null

  state.overviewTable.data = null

  state.quarterlyDataCache = {}

  resetFirstAndLastQuarterWithData(state)
}



export const ACTION_HANDLERS = {
  [QWI_MSA_CHANGE]: handleMsaChange,

  [QWI_MEASURE_CHANGE]: handleMeasureChange,
  
  [QWI_MSA_AND_MEASURE_CHANGE]: handleMsaAndMeasureChange,

  [QWI_RATIOS_BY_FIRMAGE_DATA_REQUESTED]: handleInventoryUpdate.bind(null, 'ratiosByFirmage', 'REQUESTED'),
  [QWI_RATIOS_BY_FIRMAGE_DATA_RECEIVED]: handleDataReceived.bind(null, 'ratiosByFirmage'),

  [QWI_RAW_DATA_REQUESTED]: handleInventoryUpdate.bind(null, 'raw', 'REQUESTED'),
  [QWI_RAW_DATA_RECEIVED]: handleDataReceived.bind(null, 'raw'),

  [QWI_LINEGRAPH_FOCUS_CHANGE]: handleFocusedLineGraphChange,

  [QWI_OVERVIEW_TABLE_SORT_FIELD_CHANGE]: handleOverviewTableSortFieldChange,

  [QWI_SELECTED_QUARTER_WHEEL_CHANGE]: handleSelectedQuarterWheelChange,

  [QWI_SELECTED_QUARTER_CHANGE]: handleSelectedQuarterChange,

  [QWI_SELECTED_FIRMAGE_CHANGE]: handleSelectedFirmageChange,

  [QWI_SELECTED_FIRMAGE_WHEEL_CHANGE]: handleSelectedFirmageWheelChange,

  [QWI_MOUSE_ENTERED_TOOLTIP_CELL]: handleMouseEnteredTooltipNaicsLabel,

  [QWI_MOUSE_LEFT_TOOLTIP_CELL]: handleMouseLeftTooltipNaicsLabel,

  [QWI_ACTION_ERROR]: handleActionError,

  [QWI_NULL_ACTION] : _.identity,
}



export const metroQwiReducer = (state = initialState, action) => {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}

