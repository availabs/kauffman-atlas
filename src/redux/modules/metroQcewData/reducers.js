import d3 from 'd3'
import _ from 'lodash'


import { updateFirstAndLastQuarterWithData, 
         resetFirstAndLastQuarterWithData,
         newOverviewTableDataComparator, 
         tooltipComparator,
         lineGraphDataTransformer, } from '../../../support/sharedReducers'

import NaicsTree from '../../../support/NaicsTree'

import { currencyMeasures, measureToRouteSegmentName } from '../../../support/qcew'

import { industryTitles } from '../../../support/industryTitles'



import { 
  QCEW_MSA_CHANGE,
  QCEW_MEASURE_CHANGE,
  QCEW_MSA_AND_MEASURE_CHANGE,

  QCEW_DATA_REQUESTED,
  QCEW_DATA_RECEIVED,
  QCEW_NAICS_TABLE_RECEIVED,

  QCEW_LINEGRAPH_FOCUS_CHANGE,
  QCEW_NAICS_DRILLDOWN,
  QCEW_NAICS_ONE_LEVEL_ASCENT,
  QCEW_NAICS_RETURN_TO_ROOT,

  QCEW_SELECTED_QUARTER_CHANGE,
  QCEW_SELECTED_QUARTER_WHEEL_CHANGE,
  QCEW_OVERVIEW_TABLE_SORT_FIELD_CHANGE,

  QCEW_MOUSE_ENTERED_TOOLTIP_CELL,
  QCEW_MOUSE_LEFT_TOOLTIP_CELL,

  QCEW_ACTION_ERROR,
  QCEW_NULL_ACTION,
} from './actions'



const startQuarter = {
  year: 2001,
  quarter: 1,
}

const endQuarter = {
  year: 2015,
  quarter: 1,
}

const transformers = {

  emplvl: {
    input: [
      'month1_emplvl',
      'month2_emplvl',
      'month3_emplvl',
    ],

    f : (emps) => _(emps).filter(Number.isFinite).mean(),
  },

  lq_emplvl: {
    input: [
      'lq_month1_emplvl',
      'lq_month2_emplvl',
      'lq_month3_emplvl',
    ],

    f : (lq_emps) => _(lq_emps).filter(Number.isFinite).mean(),
  },

  avg_wkly_wage    : null,
  lq_avg_wkly_wage : null,

  qtrly_estabs_count    : null,
  lq_qtrly_estabs_count : null,

  total_qtrly_wages    : null,
  lq_total_qtrly_wages : null,

}


const colors = d3.scale.category20c()


const initialState = {

  msa: null,
  measure: null,

  measureIsCurrency: null,
  
  naicsDrilldownHistory: [null],

  selectedParentNaicsTitle: null,

  selectedQuarter: endQuarter,

  metroParagraphData : {}, 

  naicsInfoTable: null,

  naicsLookup: null,

  byMsaNaicsTrees: {},

  lineGraphs: {
    focused: 'rawData-lineGraph',

    rawGraphTitle: null,
    rawGraphData : null,

    lqGraphTitle : null,
    lqGraphData  : null,
  },

  tooltipTable: {
    data: null,
    hoveredNaicsLabel: null,
  },

  shareRadarChartData: null,

  lqRadarChartData: null,

  overviewTable: {
    sortField: 'measureLocationQuotient',
    data: null,
  },

  inventory: {},

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


const handleNaicsDrilldown = (state, action) => {

  let newState = Object.assign({}, state)
    
  newState.naicsDrilldownHistory.push(action.payload.subNaics || null)

  updateAllVisualizationsData(newState)

  return newState
} 

const handleNaicsOneLevelAscent = (state) => {

  let newState = Object.assign({}, state)
    
  newState.naicsDrilldownHistory.pop()

  updateAllVisualizationsData(newState)

  return newState
} 

const handleNaicsReturnToRoot = (state) => {

  let newState = Object.assign({}, state)
    
  newState.naicsDrilldownHistory = [null]

  updateAllVisualizationsData(newState)

  return newState
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


const handleInventoryUpdate = (inventoryStatus, state, action) => {

  let parentNaics = action.payload.parentNaics || null

  // When making a request, the action contains the requested codes.
  // When receiving the response, we use the codes in the response data.
  let subNaics = (inventoryStatus === 'REQUESTED') ? action.payload.subNaics : _.keys(action.payload.data)

  let path = ['inventory', action.payload.msa, parentNaics]
  let curInventoryForParent = _.get(state, path, {})

  let inventoryUpdate = subNaics.reduce((acc, naicsCode) => _.set(acc, naicsCode, inventoryStatus), {})

  let updatedInventoryForParent = Object.assign({}, curInventoryForParent, inventoryUpdate)

  return (_.isEqual(curInventoryForParent, updatedInventoryForParent)) ? 
            state : _.set(_.clone(state), path, updatedInventoryForParent)
}


const handleDataReceived = (state, action) => {

  let newState = handleInventoryUpdate('RECEIVED', state, action)

  if (state === newState) { return state }
  
  let msa = action.payload.msa

  //console.log(`==> QCEW Data Received for MSA ${msa}, NAICS ${action.payload.parentNaics}`)

  let naicsTree = newState.byMsaNaicsTrees[msa] || 
                  (newState.byMsaNaicsTrees[msa] = new NaicsTree(startQuarter, endQuarter))

  naicsTree.insertData(action.payload.data, transformers)

  updateAllVisualizationsData(newState)

  if (action.payload.parentNaics === null) {
    updateMetroParagraphData(newState, msa)
  }

  return newState
}


const handleNaicsTablesReceived = (state, action) => {
  if (state.naicsInfoTable && state.naicsLookup) { return state }

  let newState = setStateField(state, 'naicsInfoTable', action.payload.naicsInfoTable)

  return setStateField(newState, 'naicsLookup', action.payload.naicsLookup)
}


const handleMsaChange = (state, action) => {
  let newState = setStateField(state, 'msa', action.payload.msa)

  if (newState === state) { return state }

  newState.naicsDrilldownHistory = [null]

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

  newState.naicsDrilldownHistory = [null]

  updateAllVisualizationsData(newState)

  return newState
}


const handleMsaAndMeasureChange = (state, action) => {

  let newState = setStateField(state, 'msa', action.payload.msa)
  newState = setStateField(newState, 'measure', action.payload.measure)

  if (newState === state) { return state }

  newState.measureIsCurrency = !!currencyMeasures[action.payload.measure]
  
  if (state.msa !== newState.msa) {
    newState.naicsDrilldownHistory = [null]
  }

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



function getRawLineGraphData (state) { return getLineGraphData(state, state.measure) }
function getLQLineGraphData  (state) { return getLineGraphData(state, `lq_${state.measure}`) }

function getLineGraphData (state, measure) {

  let msa = state.msa
  let parentNaics = _.last(state.naicsDrilldownHistory)

  if (!state.byMsaNaicsTrees[msa]) { return null }

  let data = state.byMsaNaicsTrees[msa].queryMeasureDataForSubindustries({ naics: parentNaics, measure })

  if (!(data && _(data).values().some())) { return null }

  updateFirstAndLastQuarterWithData(state, data)

  let subNaicsCodes = Object.keys(state.inventory[msa][parentNaics]).sort()
  let colorMappings = subNaicsCodes.reduce((acc, naicsCode, i) => _.set(acc, naicsCode, colors(i)), {})

  return lineGraphDataTransformer(data, colorMappings)
}



function getTooltipTableData (state) {

  let msa     = state.msa
  let measure = (state.lineGraphs.focused==='rawData-lineGraph') ? state.measure : `lq_${state.measure}`
  let parentNaics = _.last(state.naicsDrilldownHistory)

  let year = state.selectedQuarter.year
  let quarter = state.selectedQuarter.quarter

  if (!state.byMsaNaicsTrees[msa]) { return null }

  // Get the quarter's data for the MSA
  let data = state.byMsaNaicsTrees[msa]
                  .queryMeasureDataForSubindustriesForQuarter({ naics: parentNaics, year, quarter, measure })

  if (!(data && _(data).values().some())) { return null }

  let naicsInfoTable = state.naicsInfoTable

  let subNaicsCodes = Object.keys(state.inventory[msa][parentNaics]).sort()
  let colorMappings = subNaicsCodes.reduce((acc, naicsCode, i) => _.set(acc, naicsCode, colors(i)), {})

  // Omit the 'all industries' data, then create a sorter array of data elems.
  return subNaicsCodes.map((subNaics) => ({
    color       : colorMappings[subNaics],
    key         : subNaics,
    title       : _.get(naicsInfoTable, [subNaics, 'title'], subNaics),
    value       : (Number.isFinite(_.get(data, [subNaics, 'value']))) ? data[subNaics].value : 'No data.',
    filledValue : _.get(data, [subNaics, 'filledValue'], false),
  })).sort(tooltipComparator)
}



function getShareRadarChartData (state) {

  let msa         = state.msa
  let measure     = state.measure
  let parentNaics = _.last(state.naicsDrilldownHistory)

  let year = state.selectedQuarter.year
  let quarter = state.selectedQuarter.quarter

  if (!state.byMsaNaicsTrees[msa]) { return null }

  let data = state.byMsaNaicsTrees[msa]
                  .queryMeasureDataForSubindustriesForQuarter({ naics: parentNaics, year, quarter, measure, })

  if (!(data && _(data).values().some())) { return null }

  let naicsInfoTable = state.naicsInfoTable

  let totalAcrossNaics = _(data).values().map('value').filter(Number.isFinite).sum()

  let subNaicsCodes = Object.keys(state.inventory[msa][parentNaics]).sort()

  return subNaicsCodes.map((subNaics) => {

    let measureValue = _.get(data, [subNaics, 'value'], 0)
    let measureShare = (measureValue / totalAcrossNaics)

    let naicsTitle = _.get(naicsInfoTable, [subNaics, 'title'], subNaics.toString())
    return {
      axis  : naicsTitle.substring(0,6),
      value : Number.isFinite(measureShare) ? measureShare : 0,
    }
  })
}



function getLQRadarChartData (state) {

  let msa     = state.msa
  let measure = `lq_${state.measure}`
  let parentNaics = _.last(state.naicsDrilldownHistory)

  let year = state.selectedQuarter.year
  let quarter = state.selectedQuarter.quarter

  if (!state.byMsaNaicsTrees[msa]) { return null }

  let data = state.byMsaNaicsTrees[msa]
                  .queryMeasureDataForSubindustriesForQuarter({ naics: parentNaics, year, quarter, measure, })

  if (!(data && _(data).values().some())) { return null }

  let naicsInfoTable = state.naicsInfoTable

  let subNaicsCodes = Object.keys(state.inventory[msa][parentNaics]).sort()

  //let naicsTitle = _.get(naicsInfoTable, [subNaics, 'title'], subNaics.toString())
  return subNaicsCodes.map((subNaics) => {

    let lq = +_.get(data, [subNaics, 'value'])

    return {
      axis  : (_.get(naicsInfoTable, [subNaics, 'title'], subNaics.toString())).substring(0,6),
      value : Number.isFinite(lq) ? lq : 0,
    }
  })
}


function getOverviewTableData (state) {

  let msa = state.msa

  if (!state.byMsaNaicsTrees[msa]) { return null }


  let measure     = state.measure
  let parentNaics = _.last(state.naicsDrilldownHistory)

  let year    = state.selectedQuarter.year
  let quarter = state.selectedQuarter.quarter


  let rawData = state.byMsaNaicsTrees[msa]
                     .queryMeasureDataForSubindustriesForQuarter({ naics: parentNaics, 
                                                                   year, 
                                                                   quarter, 
                                                                   measure, })

  let lqData  = state.byMsaNaicsTrees[msa]
                     .queryMeasureDataForSubindustriesForQuarter({ naics: parentNaics, 
                                                                   year, 
                                                                   quarter, 
                                                                   measure: `lq_${measure}`, })

  if (!(rawData && lqData && _(rawData).values().some() && _(lqData).values().some())) { return null }

  let tableData = {}

  // For consistent ordering of the column names.
  tableData.__columns = [
    'naicsCode',
    'sectorTitle',
    'measure',
    'measureShare',
    'measureLocationQuotient',
  ]
 
  tableData.__columnNames = {
    naicsCode               : 'NAICS Code',
    sectorTitle             : 'Sector Title',
    measure                 : `${measure} Value`,
    measureShare            : `${measure} Share`,
    measureLocationQuotient : `${measure} Location Quotient`,
  }


  let stringifier = (d, isCurrency, filledValue, numOfDecimals = 0) => (Number.isFinite(d)) ? 
        `${(isCurrency)?'$':''}${parseFloat(d.toFixed(numOfDecimals)).toLocaleString()}${filledValue?'*':''}` : 'No data'


  let totalAcrossNaics = _(rawData).values().map('value').filter(Number.isFinite).sum()
  let totalContainsFilled = _(rawData).values().map('filledValue').some()

  let naicsInfoTable = state.naicsInfoTable
  let subNaics = Object.keys(state.inventory[msa][parentNaics])
  let measureIsCurrency = state.measureIsCurrency

  subNaics.forEach((subNaics) => {

    let sectorTitle = _.get(naicsInfoTable, [subNaics, 'title'], 'Unrecognized Naics Code')

    let measureValue = _.get(rawData, [subNaics, 'value'], 'No data')
    let measureFilled = !!_.get(rawData, [subNaics, 'filledValue'])

    let measureShare = (Number.isFinite(measureValue / totalAcrossNaics)) ? (measureValue / totalAcrossNaics) : '-'

    let lqValue = _.get(lqData, [subNaics, 'value'], 'No Data')
    let lqFilled = !!_.get(lqData, [subNaics, 'filledValue'])

    let subSubNaics = state.naicsLookup.Query(subNaics, 1)
    let hasSubindustries = !!_.difference(subSubNaics, [subNaics]).length

    _.set(tableData, [subNaics, 'naicsCode'], subNaics)
    _.set(tableData, [subNaics, 'sectorTitle'], sectorTitle)
    _.set(tableData, [subNaics, '_hasSubindustries'], hasSubindustries)
    _.set(tableData, [subNaics, 'measure'], stringifier(measureValue, measureIsCurrency, measureFilled))
    _.set(tableData, [subNaics, 'measureShare'], stringifier(measureShare, false, totalContainsFilled, 3))
    _.set(tableData, [subNaics, 'measureLocationQuotient'], stringifier(lqValue, false, lqFilled, 3))
  })


  let sortField = state.overviewTable.sortField
  let overviewDataComparator = newOverviewTableDataComparator(sortField, tableData)

  // Provided the requested sorted order for the table rows.
  tableData.__naicsRowOrder = subNaics.sort(overviewDataComparator)

  return tableData
}



function updateAllVisualizationsData (state) {

  _.set(state, 'quarterlyDataCache', {})

  resetFirstAndLastQuarterWithData(state)

  if (!(state.inventory[state.msa] && state.inventory[state.msa][_.last(state.naicsDrilldownHistory)])) {
    return resetAllVisualizationsData(state)
  }

  state.selectedParentNaicsTitle = (_.last(state.naicsDrilldownHistory) === null) ?  'All Industries' : 
      _.get(state.naicsInfoTable, [_.last(state.naicsDrilldownHistory), 'title'], 'Unrecognized Naics Code')

  let measure = state.measure

  state.lineGraphs.rawGraphTitle = `Quarterly ${measureToRouteSegmentName[measure]}`
  state.lineGraphs.rawGraphData = getRawLineGraphData(state)

  state.lineGraphs.lqGraphTitle = `LQ Quarterly ${measureToRouteSegmentName[measure]}`
  state.lineGraphs.lqGraphData =  getLQLineGraphData(state)

  state.selectedQuarter = state.lastQuarterWithData

  updateQuarterTrackingVisualizationsData(state)
}



function updateQuarterTrackingVisualizationsData (state) {

  let qtrString = `${state.selectedQuarter.year}|${state.selectedQuarter.quarter}`

  let cache = state.quarterlyDataCache[qtrString]
  if (cache) {
    state.shareRadarChartData = cache.shareRadarChartData

    state.lqRadarChartData = cache.lqRadarChartData

    state.tooltipTable.data = cache.tooltipTableData

    state.overviewTable.data = cache.overviewTableData

    return
  }

  state.quarterlyDataCache[qtrString] = {
    shareRadarChartData : (state.shareRadarChartData = getShareRadarChartData(state)),

    lqRadarChartData  : (state.lqRadarChartData  = getLQRadarChartData(state)),

    tooltipTableData : (state.tooltipTable.data = getTooltipTableData(state)),

    overviewTableData : (state.overviewTable.data = getOverviewTableData(state))
  }
}


function updateMetroParagraphData (state, msa) {
//debugger
    let rawEmpData = state.byMsaNaicsTrees[msa]
                          .queryMeasureDataForSubindustries({ naics: null, measure: 'emplvl', })

    let rawEstData = state.byMsaNaicsTrees[msa]
                          .queryMeasureDataForSubindustries({ naics: null, measure: 'qtrly_estabs_count', })

    let lqEstData  = state.byMsaNaicsTrees[msa]
                          .queryMeasureDataForSubindustries({ naics: null, measure: 'lq_qtrly_estabs_count', })


    let years = {}
    let toYearlyAverages = (data) =>  data && _(data.reduce((acc, d) => { 
                                         years[d.year] = true;

                                         (acc[d.year] || (acc[d.year] = [])).push(d.value)

                                         return acc
                                       }, {})).mapValues((qrtly) => _(qrtly).filter().mean()).value()

    let yearlyRawEmpData = _.mapValues(rawEmpData, toYearlyAverages)

    let yearlyRawEstData = _.mapValues(rawEstData, toYearlyAverages)
    let yearlyLQEstData = _.mapValues(lqEstData, toYearlyAverages)

    years = Object.keys(years).sort()


    let yearlyEmpTotals = years.reduce((acc, year) => _.set(acc, year, _(yearlyRawEmpData).values().sumBy(year)), {})

    let yearlyEmpShares = _.mapValues(yearlyRawEmpData, (indByYearEmp) => 
                            _.mapValues(indByYearEmp, (val, yr) => (val / yearlyEmpTotals[yr])))


    let yearlyEstTotals = years.reduce((acc, year) => _.set(acc, year, _(yearlyRawEstData).values().sumBy(year)), {})

    let yearlyEstShares = _.mapValues(yearlyRawEstData, (indByYearEst) => 
                            _.mapValues(indByYearEst, (val, yr) => (val / yearlyEstTotals[yr])))

    let getter = (d,k,yr) => ((d[k] && d[k][yr]) || Number.NEGATIVE_INFINITY)

    state.metroParagraphData = Object.assign({}, state.metroParagraphData)

    state.metroParagraphData[msa] = years.reduce( (acc, year) => {
      
      let naicsCodes = Object.keys(yearlyEmpShares)

      let topEmpShare = 
        _.tail(naicsCodes).reduce((acc, code) => 
          (getter(yearlyEmpShares, acc, year) < getter(yearlyEmpShares, code, year)) ? code : acc, _.head(naicsCodes))

      let topEst = 
        _.tail(naicsCodes).reduce((acc, code) => 
          (getter(yearlyRawEstData,acc,year) < getter(yearlyRawEstData,code,year)) ? code : acc, _.head(naicsCodes))

      let topEstShare = 
        _.tail(naicsCodes).reduce((acc, code) => 
          (getter(yearlyEstShares,acc,year) < getter(yearlyEstShares,code,year)) ? code : acc, _.head(naicsCodes))

      let descSortedLQEstNaicsCodes = naicsCodes.slice().sort( (naicsA, naicsB) => 
          (getter(yearlyLQEstData,naicsB,year) - getter(yearlyLQEstData,naicsA,year)))


      acc[year] = {
        topEmpShare,
        topEmpShareName : industryTitles[topEmpShare],
        topEmpShareValue : yearlyEmpShares[topEmpShare][year],

        topEst,
        topEstName : industryTitles[topEst],
        topEstValue : yearlyRawEstData[topEst][year],

        topEstShare,
        topEstShareName : industryTitles[topEstShare],
        topEstShareValue : yearlyEstShares[topEstShare][year],

        topLQEst_0: descSortedLQEstNaicsCodes[0],
        topLQEst_0_Name: industryTitles[descSortedLQEstNaicsCodes[0]],

        topLQEst_1: descSortedLQEstNaicsCodes[1],
        topLQEst_1_Name: industryTitles[descSortedLQEstNaicsCodes[1]],

        topLQEst_2: descSortedLQEstNaicsCodes[2],
        topLQEst_2_Name: industryTitles[descSortedLQEstNaicsCodes[2]],
      }

      return acc
        
    }, {})
}


function resetAllVisualizationsData (state) {

  state.lineGraphs.rawGraphData = null
  state.lineGraphs.lqGraphData = null

  state.tooltipTable.data = null

  state.shareRadarChartData = null

  state.lqRadarChartData = null

  state.overviewTable.data = null

  state.quarterlyDataCache = {}

  resetFirstAndLastQuarterWithData(state)
}



export const ACTION_HANDLERS = {
  [QCEW_MSA_CHANGE]: handleMsaChange,

  [QCEW_MEASURE_CHANGE]: handleMeasureChange,
  
  [QCEW_MSA_AND_MEASURE_CHANGE]: handleMsaAndMeasureChange,

  [QCEW_DATA_REQUESTED]: handleInventoryUpdate.bind(null, 'REQUESTED'),
  [QCEW_DATA_RECEIVED]: handleDataReceived,
  [QCEW_NAICS_TABLE_RECEIVED]: handleNaicsTablesReceived,

  [QCEW_LINEGRAPH_FOCUS_CHANGE]: handleFocusedLineGraphChange,

  [QCEW_OVERVIEW_TABLE_SORT_FIELD_CHANGE]: handleOverviewTableSortFieldChange,

  [QCEW_SELECTED_QUARTER_WHEEL_CHANGE]: handleSelectedQuarterWheelChange,

  [QCEW_NAICS_DRILLDOWN]: handleNaicsDrilldown,
  [QCEW_NAICS_ONE_LEVEL_ASCENT]: handleNaicsOneLevelAscent,
  [QCEW_NAICS_RETURN_TO_ROOT]: handleNaicsReturnToRoot,

  [QCEW_SELECTED_QUARTER_CHANGE]: handleSelectedQuarterChange,

  [QCEW_MOUSE_ENTERED_TOOLTIP_CELL]: handleMouseEnteredTooltipNaicsLabel,

  [QCEW_MOUSE_LEFT_TOOLTIP_CELL]: handleMouseLeftTooltipNaicsLabel,

  [QCEW_ACTION_ERROR]: handleActionError,

  [QCEW_NULL_ACTION] : _.identity,
}



export const metroQcewReducer = (state = initialState, action) => {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}

