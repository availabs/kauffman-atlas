import { qwiAPIServer as apiConfig } from '../../../AppConfig'
import { msaToFips } from '../../../support/qwi'

const apiServerAddress = `${apiConfig.hostname}${(apiConfig.port) ? (':' + apiConfig.port) : ''}`


export const QWI_DATA_REQUESTED = 'QWI_DATA_REQUESTED'
export const QWI_DATA_RECEIVED = 'QWI_DATA_RECEIVED'
export const QWI_MSA_CHANGE = 'QWI_MSA_CHANGE'
export const QWI_MEASURE_CHANGE = 'QWI_MEASURE_CHANGE'
export const QWI_OVERVIEW_TABLE_SORT_FIELD_CHANGE = 'QWI_OVERVIEW_TABLE_SORT_FIELD_CHANGE'
export const QWI_LINEGRAPH_FOCUS_CHANGE = 'QWI_LINEGRAPH_FOCUS_CHANGE'
export const QWI_QUARTER_CHANGE = 'QWI_QUARTER_CHANGE'
export const QWI_ACTION_ERROR = 'QWI_ACTION_ERROR'


// For internal use.
const qwiActionError = (err) => ({
  type    : QWI_ACTION_ERROR,
  payload : { err, }
})


const ratiosByFirmageDataRequested = (msa, measure) => ({
  type : QWI_DATA_REQUESTED,
  payload : { 
    inventory: { ratiosByFirmage: { [msa]: { [measure]: 'REQUESTED'} } },
  },
})

const ratiosByFirmageDataReceived = (msa, measure, ratiosByFirmageData) => ({
  type : QWI_DATA_RECEIVED,
  payload : { 
    inventory: { ratiosByFirmage: { [msa]: { [measure]: 'RECEIVED'} } },
    data: { ratiosByFirmage: ratiosByFirmageData },
  },
})


const rawDataRequested = (msa, measure) => ({
  type : QWI_DATA_REQUESTED,
  payload : { 
    inventory: { raw: { [msa]: { [measure]: 'REQUESTED' } } },
  },
})


const rawDataReceived = (msa, measure, metroRawData) => ({
  type    : QWI_DATA_RECEIVED,
  payload : { 
    inventory: { raw: { [msa]: { [measure]: 'RECEIVED' } } },
    data: { raw: metroRawData },
  },
})


export const quarterChange = (dateObj) => ({
  type : QWI_QUARTER_CHANGE,
  payload : { 
    quarter: getQuarterObjFromDateObj(dateObj), 
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

export const lineGraphFocusChange = (focusedLineGraph) => ({
  type : QWI_LINEGRAPH_FOCUS_CHANGE,
  payload : { focusedLineGraph, }
})

export const overviewTableSortFieldChange = (overviewTableSortField) => ({
  type : QWI_OVERVIEW_TABLE_SORT_FIELD_CHANGE,
  payload : { overviewTableSortField, }
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



function getQuarterObjFromDateObj (dateObj) {
  
  let splitDate = d3.time.format("%m-%Y")(dateObj).split('-')

  return {
    qrt : Math.floor((+splitDate[0]/3) + 1).toString(),
    yr  : splitDate[1],
  }
}


function buildRatiosByFirmageRequestURL (msa, measure) {
  return `http://${apiServerAddress}/derived-data/measure-ratios-by-firmage/firmage1/geography` + 
            `${(msa === '00') ? '00000' : msaToFips[msa]}${msa}/year20012016/quarter/industry` + 
            `?fields=${measure}&dense=true&flatLeaves=true`
}

function buildRawDataRequestURL (msa, measure) {
  return `http://${apiServerAddress}/data/firmage1/geography` +
            `${msaToFips[msa]}${msa}/year20012016/quarter/industry` + 
            `?fields=${measure}&dense=true&flatLeaves=true`
}

function transformJSON (json) { 
  // Since all requests are for firmage == 1,
  // we take the data starting after the { '1': {... part of the nesting.
  let data =  _.mapKeys(json.data['1'], (v,k) => (k.length > 2) ? k.substring(2) : k)
  console.log(data)
  return data
}

function handleFetchErrors (response) {
  if (response.ok) { return response }

  throw new Error(`Fetch response statusText:\n${response.statusText}`)
}
