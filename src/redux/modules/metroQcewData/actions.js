import _ from 'lodash'

import { qcewApi as apiServerAddress } from '../../../AppConfig'
import { requestedMeasures } from '../../../support/qcew'
import industryTitles from '../../../support/industryTitles'
import { loadNaicsKeys } from '../msaLookup'


export const QCEW_MSA_CHANGE = 'QCEW_MSA_CHANGE'
export const QCEW_MEASURE_CHANGE = 'QCEW_MEASURE_CHANGE'
export const QCEW_MSA_AND_MEASURE_CHANGE = 'QCEW_MSA_AND_MEASURE_CHANGE'

export const QCEW_DATA_REQUESTED = 'QCEW_DATA_REQUESTED'
export const QCEW_DATA_RECEIVED = 'QCEW_DATA_RECIEVED'

export const QCEW_NAICS_TABLE_RECEIVED = 'QCEW_NAICS_TABLE_RECEIVED'

export const QCEW_NAICS_DRILLDOWN = 'QCEW_NAICS_DRILLDOWN'
export const QCEW_NAICS_ONE_LEVEL_ASCENT = 'QCEW_NAICS_ONE_LEVEL_ASCENT'
export const QCEW_NAICS_RETURN_TO_ROOT = 'QCEW_NAICS_RETURN_TO_ROOT'


export const QCEW_LINEGRAPH_FOCUS_CHANGE = 'QCEW_LINEGRAPH_FOCUS_CHANGE'
export const QCEW_SELECTED_QUARTER_WHEEL_CHANGE = 'QCEW_SELECTED_QUARTER_WHEEL_CHANGE'
export const QCEW_SELECTED_QUARTER_CHANGE = 'QCEW_SELECTED_QUARTER_CHANGE'

export const QCEW_OVERVIEW_TABLE_SORT_FIELD_CHANGE = 'QCEW_OVERVIEW_TABLE_SORT_FIELD_CHANGE'

export const QCEW_MOUSE_ENTERED_TOOLTIP_CELL = 'QCEW_MOUSE_ENTERED_TOOLTIP_CELL'
export const QCEW_MOUSE_LEFT_TOOLTIP_CELL = 'QCEW_MOUSE_LEFT_TOOLTIP_CELL'

export const QCEW_ACTION_ERROR = 'QCEW_ACTION_ERROR'
export const QCEW_NULL_ACTION = 'QCEW_NULL_ACTION'


const reqFieldsString = requestedMeasures.map((m) => `fields[]=${m}`).join('&')

const years = _.range(2001, 2016) // Years 2001-2015


// For internal use.
const qcewActionError = (error) => ({
  type    : QCEW_ACTION_ERROR,
  payload : { error, }
})

const dataRequested = (msa, parentNaics, subNaics) => ({
  type : QCEW_DATA_REQUESTED,
  payload : { 
    msa,
    parentNaics,
    subNaics,
  },
})

const dataReceived = (msa, parentNaics, data) => ({
  type    : QCEW_DATA_RECEIVED,
  payload : { 
    msa,
    parentNaics,
    data,
  },
})

const naicsDrilldown = (subNaics) => ({
  type : QCEW_NAICS_DRILLDOWN,
  payload : { 
    subNaics, 
  },
})

const naicsOneLevelAscent = () => ({ type: QCEW_NAICS_ONE_LEVEL_ASCENT })

const naicsReturnToRoot = () => ({ type: QCEW_NAICS_RETURN_TO_ROOT })

const naicsTablesReceived = (naicsInfoTable, naicsLookup) => ({
  type: QCEW_NAICS_TABLE_RECEIVED,
  payload : { naicsInfoTable, naicsLookup },
})

const nullAction = () => ({ type : QCEW_NULL_ACTION, })



// Exposed API Actions
export const msaChange = (msa) => ({
  type : QCEW_MSA_CHANGE,
  payload : { msa, },
})

export const measureChange = (measure) => ({
  type : QCEW_MEASURE_CHANGE,
  payload : { measure, }
})

export const msaAndMeasureChange = (msa, measure) => ({
  type: QCEW_MSA_AND_MEASURE_CHANGE,
  payload : { msa, measure, }
})


export const selectedQuarterWheelChange = (delta) => ({
  type : QCEW_SELECTED_QUARTER_WHEEL_CHANGE,
  payload : { 
    delta, 
  },
})


export const selectedQuarterChange = (dateObj) => ({
  type : QCEW_SELECTED_QUARTER_CHANGE,
  payload : { 
    selectedQuarter: getYearQuarterObjFromDateObj(dateObj), 
  },
})

export const lineGraphFocusChange = (focusedGraph) => ({
  type : QCEW_LINEGRAPH_FOCUS_CHANGE,
  payload : { focusedGraph, }
})

export const overviewTableSortFieldChange = (sortField) => ({
  type : QCEW_OVERVIEW_TABLE_SORT_FIELD_CHANGE,
  payload : { sortField, }
})

export const mouseEnteredTooltipCell = (naics) => ({
  type: QCEW_MOUSE_ENTERED_TOOLTIP_CELL,
  payload: { naics, }
})

export const mouseLeftTooltipCell = () => ({
  type: QCEW_MOUSE_LEFT_TOOLTIP_CELL,
})


export const loadData = (msa, parentNaics, retryNumber) => (dispatch, getState) => {
  requestTheData(dispatch, getState, msa, parentNaics, retryNumber)
}

export const drilldownIntoNaicsSubindustry = (parentNaics) => (dispatch, getState) => {

  dispatch(naicsDrilldown(parentNaics))

  return requestTheData(dispatch, getState, null, parentNaics, 0)
}

export const ascendOneNaicsLevel = () => (dispatch, getState) => {

  let naicsDrilldownHistory = getState().metroQcewData.naicsDrilldownHistory
  let currentNaicsParentCode = _.last(naicsDrilldownHistory)

  if (currentNaicsParentCode === null) {
    return dispatch(nullAction())
  }

  dispatch(naicsOneLevelAscent())

  return requestTheData(dispatch, getState, null, naicsDrilldownHistory[naicsDrilldownHistory.length - 2], 0)
}

export const naicsRootReturn = () => (dispatch, getState) => {

  let naicsDrilldownHistory = getState().metroQcewData.naicsDrilldownHistory
  let currentNaicsParentCode = _.last(naicsDrilldownHistory)

  if (currentNaicsParentCode === null) {
    return dispatch(nullAction())
  }

  dispatch(naicsReturnToRoot())

  return requestTheData(dispatch, getState, null, null, 0)
}


function requestTheData (dispatch, getState, msa, parentNaics, retryNumber) {

  let state = getState().metroQcewData
  parentNaics = parentNaics || null

  msa = msa || state.msa

  if (!msa) { return dispatch(nullAction())}

  if (_.has(state.inventory, [msa, parentNaics])) { return dispatch(nullAction()) }

  console.log('Making the QCEW data request.')

  let metrosState = getState().metros

  let naicsInfoTable = metrosState.naicsKeys
  let naicsLookup = metrosState.naicsLookup

  retryNumber = retryNumber || 1

  if (!naicsLookup || !naicsInfoTable) {
    loadNaicsKeys() 

    //if (parentNaics) {
      dispatch(nullAction())
      return setTimeout(loadData.bind(null, dispatch, getState, msa, parentNaics, ++retryNumber), 500)
    //}
  } 

  if (naicsInfoTable && naicsLookup && !(state.naicsInfoTable && state.naicsLookup)) {
    dispatch(naicsTablesReceived(naicsInfoTable, naicsLookup))
  }

  let subNaics = (!parentNaics) ? Object.keys(industryTitles) : naicsLookup.Query(parentNaics, 1)

  if (!(subNaics && subNaics.length)) {
    return dispatch(qcewActionError(new Error('No NAICS codes match the request.')))
  }

  let requestURL = buildRequestURL(msa, subNaics)

  fetch(requestURL)
    .then(handleFetchErrors)
    .then(response => response.json())
    .then((data) => restructureData(data[0].values))
    .then(data => dispatch(dataReceived(msa, parentNaics, data)))
    .catch(err => dispatch(qcewActionError(err)))

  dispatch(dataRequested(msa, parentNaics, subNaics))
}


function getYearQuarterObjFromDateObj (dateObj) {
  let splitDate = d3.time.format("%m-%Y")(dateObj).split('-')

  return {
    quarter : Math.floor((+splitDate[0]/3) + 1).toString(),
    year: splitDate[1],
  }
}


function buildRequestURL (msa, naicsCodes) {

  return `${apiServerAddress}data/fipsC${msa.slice(0, 4)}/` + 
         `ind${naicsCodes.map(code => _.padStart(code, 6, '0')).join('')}/` +
         `yr${years.join('')}/qtr1234?${reqFieldsString}`
}


function restructureData (data) {
  return data.reduce((acc, val) => {
    if (val.key && val.values) {
      acc[val.key] = restructureData(val.values)
      return acc
    } else {
      return val // The one and only value in the last values array
    }
  }, {})
}


function handleFetchErrors (response) {
  if (!response.ok) { throw new Error(`Fetch response statusText:\n${response.statusText}`) }

  return response
}
