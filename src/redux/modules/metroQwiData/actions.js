import { qwiAPIServer as apiConfig } from '../../../AppConfig'
import { msaToFips } from '../../../support/qwi'

import { industryTitles } from '../../../support/qwi'

const apiServerAddress = `${apiConfig.hostname}${(apiConfig.port) ? (':' + apiConfig.port) : ''}`

const allQwiIndustryCodes = Object.keys(industryTitles).concat(['00']).map(code => _.padStart(code, 5, '0')).sort()
const allQwiFirmageCodes = _.range(0, 6)


export const QWI_MSA_CHANGE = 'QWI_MSA_CHANGE'
export const QWI_MEASURE_CHANGE = 'QWI_MEASURE_CHANGE'

export const QWI_RATIOS_BY_FIRMAGE_DATA_REQUESTED = 'QWI_RATIOS_BY_FIRMAGE_DATA_REQUESTED'
export const QWI_RATIOS_BY_FIRMAGE_DATA_RECEIVED = 'QWI_RATIOS_BY_FIRMAGE_DATA_RECEIVED'

export const QWI_RAW_DATA_REQUESTED = 'QWI_RAW_DATA_REQUESTED'
export const QWI_RAW_DATA_RECEIVED = 'QWI_RAW_DATA_RECIEVED'

export const QWI_LINEGRAPH_FOCUS_CHANGE = 'QWI_LINEGRAPH_FOCUS_CHANGE'
export const QWI_YEARQUARTER_WHEEL_CHANGE = 'QWI_YEARQUARTER_WHEEL_CHANGE'
export const QWI_LINEGRAPH_YEARQUARTER_CHANGE = 'QWI_LINEGRAPH_YEARQUARTER_CHANGE'

export const QWI_OVERVIEW_TABLE_SORT_FIELD_CHANGE = 'QWI_OVERVIEW_TABLE_SORT_FIELD_CHANGE'
export const QWI_FIRMAGE_SELECTED = 'QWI_FIRMAGE_SELECTED'
export const QWI_FIRMAGE_WHEEL_CHANGE = 'QWI_FIRMAGE_WHEEL_CHANGE'
export const QWI_ACTION_ERROR = 'QWI_ACTION_ERROR'


// For internal use.
const qwiActionError = (err) => ({
  type    : QWI_ACTION_ERROR,
  payload : { err, }
})


const ratiosByFirmageDataRequested = (msa, measure) => ({
  type : QWI_RATIOS_BY_FIRMAGE_DATA_REQUESTED,
  payload : { 
    msa,
    measure,
  },
})

const ratiosByFirmageDataReceived = (msa, measure, data) => ({
  type : QWI_RATIOS_BY_FIRMAGE_DATA_RECEIVED,
  payload : { 
    msa,
    measure,
    data,
  },
})


const rawDataRequested = (msa, measure) => ({
  type : QWI_RAW_DATA_REQUESTED,
  payload : { 
    msa,
    measure,
  },
})


const rawDataReceived = (msa, measure, data) => ({
  type    : QWI_RAW_DATA_RECEIVED,
  payload : { 
    msa,
    measure,
    data,
  },
})



export const msaChange = (msa) => ({
  type : QWI_MSA_CHANGE,
  payload : { msa, }
})

export const measureChange = (measure) => ({
  type : QWI_MEASURE_CHANGE,
  payload : { measure, }
})



export const yearQuarterWheelChange = (delta) => ({
  type : QWI_YEARQUARTER_WHEEL_CHANGE,
  payload : { 
    delta, 
  },
})

export const lineGraphYearQuarterChange = (dateObj) => ({
  type : QWI_LINEGRAPH_YEARQUARTER_CHANGE,
  payload : { 
    yearQuarter: getYearQuarterObjFromDateObj(dateObj), 
  },
})

export const lineGraphFocusChange = (focusedGraph) => ({
  type : QWI_LINEGRAPH_FOCUS_CHANGE,
  payload : { focusedGraph, }
})

export const overviewTableSortFieldChange = (sortField) => ({
  type : QWI_OVERVIEW_TABLE_SORT_FIELD_CHANGE,
  payload : { sortField, }
})

export const firmageWheelChange = (delta) => ({
  type: QWI_FIRMAGE_WHEEL_CHANGE,
  payload: { delta },
})

export const firmageSelected = (firmage) => ({
  type: QWI_FIRMAGE_SELECTED,
  payload: { firmage }
})


export const loadData = (msa, measure) => (dispatch, getState) => {

  let state = getState().metroQwiData

  if (state.msa !== msa) {
    dispatch(msaChange(msa))
  }

  if (state.measure !== measure) {
    dispatch(measureChange(measure))
  }

  // If we don't already have it, get the national level ratiosByFirmage data.
  if (!_.has(state.inventory, ['ratiosByFirmage', '00', `${measure}_ratio`])) {
    requestRatiosByFirmageData(dispatch, '00', `${measure}_ratio`)
  }

  // If we don't already have it, get the metro's ratiosByFirmage data.
  if (!_.has(state.inventory, ['ratiosByFirmage', msa, `${measure}_ratio`])) {
    requestRatiosByFirmageData(dispatch, msa, `${measure}_ratio`)
  }

  // If we don't already have it, get the metro's raw data.
  if (!_.has(state.inventory, ['raw', msa, measure])) {
    requestRawDataForMetro(dispatch, msa, measure)
  }
}


function requestRatiosByFirmageData (dispatch, msa, measure) {
  dispatch(ratiosByFirmageDataRequested(msa, measure))

  fetch(buildRatiosByFirmageRequestURL(msa, measure))
    .then(handleFetchErrors)
    .then(response => response.json())
    .then(transformJSON)
    .then(data => dispatch(ratiosByFirmageDataReceived(msa, measure, data)))
    .catch(err => dispatch(qwiActionError(err)))
}

function requestRawDataForMetro (dispatch, msa, measure) {
  dispatch(rawDataRequested(msa, measure))

  fetch(buildRawDataRequestURL(msa, measure))
    .then(handleFetchErrors)
    .then(response => response.json())
    .then(transformJSON)
    .then(data => dispatch(rawDataReceived(msa, measure, data)))
    .catch(err => dispatch(qwiActionError(err)))
}



function getYearQuarterObjFromDateObj (dateObj) {
  
  let splitDate = d3.time.format("%m-%Y")(dateObj).split('-')

  return {
    quarter : Math.floor((+splitDate[0]/3) + 1).toString(),
    year: splitDate[1],
  }
}


const allIndustryAndFirmageCodesReqPath = `industry${allQwiIndustryCodes.join('')}/firmage${allQwiFirmageCodes.join('')}`

function buildRatiosByFirmageRequestURL (msa, measure) {
  return `http://${apiServerAddress}/derived-data/measure-ratios-by-firmage/geography` + 
            `${(msa === '00') ? '00000' : msaToFips[msa]}${msa}/year20012016/quarter/` +
            `${allIndustryAndFirmageCodesReqPath}` +
            `?fields=${measure}&dense=true&flatLeaves=true`
}

function buildRawDataRequestURL (msa, measure) {
  return `http://${apiServerAddress}/data/geography` +
            `${msaToFips[msa]}${msa}/year20012016/quarter/` + 
            `${allIndustryAndFirmageCodesReqPath}` +
            `?fields=${measure}&dense=true&flatLeaves=true`
}

function transformJSON (json) { 
  let data =  _.mapKeys(json.data, (v,k) => (k.length > 2) ? k.substring(2) : k)
  return data
}

function handleFetchErrors (response) {
  if (response.ok) { return response }

  throw new Error(`Fetch response statusText:\n${response.statusText}`)
}
