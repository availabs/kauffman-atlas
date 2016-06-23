import d3 from 'd3'
import _ from 'lodash'

import NaicsTree from '../../../support/NaicsTree'

import { currencyMeasures, 
         firmageLabels, 
         industryTitles, 
         requestedRatioMeasures, 
         requestedRawMeasures } from '../../../support/qwi'

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

const colors = d3.scale.category20c()


const initialState = {

  msa: null,
  measure: null,

  measureIsCurrency: null,
  
  selectedFirmage: '1',

  selectedQuarter: endQuarter,

  byMsaNaicsTrees: {},

  lineGraphs: {
    focused: 'qwi-rawData-linegraph',
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
    sortField: 'Location Quotient',
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

  return lineGraphDataTransformer(data)
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
    return msaData.map((d) => _.set(_.clone(d), 'value', (d.value / natDataForNaics[nat_i++].value)))
  })

  updateFirstAndLastQuarterWithData(state, data)

  return data ? lineGraphDataTransformer(data) : null
}


function getTooltipTableData (state) {
  return ((state.lineGraphs.focused==='qwi-rawData-linegraph') ? getRawTooltipTableData : getLQTooltipTableData)(state)
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
  return _(data).keys().pull('00').sort().map( (naics, i) => ({
    color       : colors(i % 20),
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
  return _(ratioDataForMSA).keys().pull('00').sort().map( (naics, i) => {

    let value = _.get(ratioDataForMSA, [naics, 'value'], NaN) / _.get(ratioDataForNation, [naics, 'value'], NaN)

    return {
      color       : colors(i % 20),
      key         : naics,
      title       : industryTitles[naics],
      value       : (Number.isFinite(value)) ? value : 'No data.',
      filledValue : _.get(ratioDataForMSA, [naics, 'filledValue'], false),
    }
  }).sort(tooltipComparator).value()
}


function getSelectedFirmageRadarGraphData (state) {

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
    value : _.get(selectedFirmageData, [naics, 'value'], 0) / 
            _.get(acrossFirmagesData, [naics, 'value'], Number.POSITIVE_INFINITY)
  })).value()
}


function getAcrossFirmagesRadarGraphData (state) {

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
    value : _.get(data, [naics, 'value'], 0) / _.get(data, ['00', 'value'], Number.POSITIVE_INFINITY)
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

  let sortField = state.overviewTable.sortField

  let colNames = {
    naicsCode             : 'NAICS Code',
    sectorTitle           : 'Sector Title',
    measureForFirmage     : `${measure} for ${firmageLabels[firmage]} firms`,
    measureForAllFirmages : `${measure} for all firmages`,
    locationQuotient      : 'Location Quotient',
  }

  // Consistent ordering of the column names.
  tableData.__columnNames = [
    colNames.naicsCode,
    colNames.sectorTitle,
    colNames.measureForFirmage,
    colNames.measureForAllFirmages,
    colNames.locationQuotient,
  ]
 
  let stringifier = (d) => (Number.isFinite(d && d.value)) ? 
        `${(state.measureIsCurrency) ? '$' : ''}${d.value.toLocaleString()}${d.filledValue ? '*' : ''}` : 'No data'

  Object.keys(industryTitles).forEach((naics) => {

    let lq = _.get(ratioDataForFirmage, [naics, 'value'], NaN) / _.get(ratioDataForNation, [naics, 'value'], NaN)

    _.set(tableData, [naics, colNames.naicsCode], naics)
    _.set(tableData, [naics, colNames.sectorTitle], industryTitles[naics])
    _.set(tableData, [naics, colNames.measureForFirmage], stringifier(rawDataForFirmage[naics]))
    _.set(tableData, [naics, colNames.measureForAllFirmages], stringifier(rawDataAcrossFirmages[naics]))
    _.set(tableData, [naics, colNames.locationQuotient], Number.isFinite(lq) ? lq : 'No data')
  })


  let overviewDataComparator = newOverviewDataComparator(sortField, colNames, tableData)

  // Provided the requested sorted order for the table rows.
  tableData.__naicsRowOrder = Object.keys(tableData).sort(overviewDataComparator)

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

  state.quarterlyDataCache[qtrString] = {
    selectedFirmageRadarChartData : (state.selectedFirmageRadarChartData = getSelectedFirmageRadarGraphData(state)),

    acrossFirmagesRadarChartData  : (state.acrossFirmagesRadarChartData  = getAcrossFirmagesRadarGraphData(state)),

    tooltipTableData : (state.tooltipTable.data = getTooltipTableData(state)),

    overviewTableData : (state.overviewTable.data = getOverviewTableData(state))
  }
}



function lineGraphDataTransformer (data) {

  if (!data) { return null }

  let naicsCodes = _(data).keys().pull('00').sort().value()

  let lineGraphRawData = []

  naicsCodes.forEach((naics, i) => {

    let color = colors(i % 20)

    let dataArr = data[naics]
 
    if (!Array.isArray(dataArr)) { return null }

    dataArr.forEach(d => {

      let val = d.value
      let filledValue = d.filledValue

      let month = 1 + 3*(d.quarter-1)
      let quarterCentralMonth = new Date(d.year, month)

      let elem = {
        key: quarterCentralMonth,
        values: {
          x: quarterCentralMonth,
          y: val,
        },
      }

      let lastLineGraphRawDataElem = _.last(lineGraphRawData)

      if ((_.get(lastLineGraphRawDataElem, 'key') !== naics) ||
          (_.get(lastLineGraphRawDataElem, 'filledValue') !== filledValue)) {

            lineGraphRawData.push({
              color: color,
              key: naics,
              values: [],
              filledValue,
            })

            // Connect the fill segment with the new non-filled segment.
            if (lastLineGraphRawDataElem && (lastLineGraphRawDataElem.key === naics)) {
            
              if (filledValue) {
                _.last(lineGraphRawData).values.push(_.last(lastLineGraphRawDataElem.values)) 
              } else {
                lastLineGraphRawDataElem.values.push(elem)
              }
            }
      }

      _.last(lineGraphRawData).values.push(elem) 
    })
  })

  return lineGraphRawData
}


function tooltipValGetter (x) { return ((Number.isFinite(x.value)) ? x.value : Number.NEGATIVE_INFINITY) }
function tooltipComparator (a,b) { return tooltipValGetter(b) - tooltipValGetter(a) }


function newOverviewDataComparator (sortField, columnNames, tableData) {

  return (naicsCodeA, naicsCodeB) => {

    let order = ((sortField === columnNames.naicsCode) || 
                 (sortField === columnNames.sectorTitle)) ? 1 : -1

    let aVal = _.get(tableData, [naicsCodeA, sortField], '')
    let bVal = _.get(tableData, [naicsCodeB, sortField], '')

    aVal = aVal.replace ? aVal.replace(/\$|,|\*/g, '') : aVal
    bVal = bVal.replace ? bVal.replace(/\$|,|\*/g, '') : bVal

    if (!(Number.isFinite(aVal) || Number.isFinite(bVal))) {
      return (aVal.localeCompare(bVal) * order)
    }

    if (Number.isFinite(aVal) && !Number.isFinite(bVal)) {
      return (1 * order)
    }

    if (!Number.isFinite(aVal) && Number.isFinite(bVal)) {
      return (-1 * order)
    }

    return ((aVal - bVal) * order)
  }
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


function updateFirstAndLastQuarterWithData (state, data) {

  if (!data) { return }

  let firstQtr = _.clone(state.firstQuarterWithData)
  let lastQtr  = _.clone(state.lastQuarterWithData)

  let naicsCodes = Object.keys(data)

  for (let i = 0; i < naicsCodes.length; ++i) {
    let naics = naicsCodes[i]

    let dataForNaics = data[naics]

    if (!(Array.isArray(dataForNaics) && dataForNaics.length)) { continue }

    if (dataForNaics[0].year <= firstQtr.year) {
      if (dataForNaics[0].quarter < firstQtr.quarter) {
        firstQtr = {
          year: dataForNaics[0].year,
          quarter: dataForNaics[0].quarter,
        }
      } 
    }

    if (dataForNaics[dataForNaics.length - 1].year >= lastQtr.year) {
      if (dataForNaics[dataForNaics.length - 1].quarter > lastQtr.quarter) {
        lastQtr = {
          year: dataForNaics[dataForNaics.length - 1].year,
          quarter: dataForNaics[dataForNaics.length - 1].quarter,
        }
      } 
    }
  }

  state.firstQuarterWithData = firstQtr
  state.lastQuarterWithData  = lastQtr
}


function resetFirstAndLastQuarterWithData (state) {
  state.firstQuarterWithData = {
    year: Number.POSITIVE_INFINITY,
    quarter: Number.POSITIVE_INFINITY,
  }

  state.lastQuarterWithData = {
    year: Number.NEGATIVE_INFINITY,
    quarter: Number.NEGATIVE_INFINITY,
  }
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

