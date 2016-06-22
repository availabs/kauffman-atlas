import _ from 'lodash'

import { qwiAPIServer as apiConfig } from '../../../AppConfig'
import { msaToFips, requestedRatioMeasures, requestedRawMeasures } from '../../../support/qwi'

import { industryTitles } from '../../../support/qwi'

const apiServerAddress = `${apiConfig.hostname}${(apiConfig.port) ? (':' + apiConfig.port) : ''}`

const allQwiIndustryCodes = Object.keys(industryTitles).concat(['00000']).map(code => _.padStart(code, 5, '0')).sort()



export const QWI_MSA_CHANGE = 'QWI_MSA_CHANGE'
export const QWI_MEASURE_CHANGE = 'QWI_MEASURE_CHANGE'
export const QWI_MSA_AND_MEASURE_CHANGE = 'QWI_MSA_AND_MEASURE_CHANGE'

export const QWI_RATIOS_BY_FIRMAGE_DATA_REQUESTED = 'QWI_RATIOS_BY_FIRMAGE_DATA_REQUESTED'
export const QWI_RATIOS_BY_FIRMAGE_DATA_RECEIVED = 'QWI_RATIOS_BY_FIRMAGE_DATA_RECEIVED'

export const QWI_RAW_DATA_REQUESTED = 'QWI_RAW_DATA_REQUESTED'
export const QWI_RAW_DATA_RECEIVED = 'QWI_RAW_DATA_RECIEVED'

export const QWI_LINEGRAPH_FOCUS_CHANGE = 'QWI_LINEGRAPH_FOCUS_CHANGE'
export const QWI_SELECTED_QUARTER_WHEEL_CHANGE = 'QWI_SELECTED_QUARTER_WHEEL_CHANGE'
export const QWI_SELECTED_QUARTER_CHANGE = 'QWI_SELECTED_QUARTER_CHANGE'

export const QWI_OVERVIEW_TABLE_SORT_FIELD_CHANGE = 'QWI_OVERVIEW_TABLE_SORT_FIELD_CHANGE'

export const QWI_SELECTED_FIRMAGE_CHANGE = 'QWI_SELECTED_FIRMAGE_CHANGE'
export const QWI_SELECTED_FIRMAGE_WHEEL_CHANGE = 'QWI_SELECTED_FIRMAGE_WHEEL_CHANGE'

export const QWI_MOUSE_ENTERED_TOOLTIP_CELL = 'QWI_MOUSE_ENTERED_TOOLTIP_CELL'
export const QWI_MOUSE_LEFT_TOOLTIP_CELL = 'QWI_MOUSE_LEFT_TOOLTIP_CELL'

export const QWI_ACTION_ERROR = 'QWI_ACTION_ERROR'
export const QWI_NULL_ACTION = 'QWI_NULL_ACTION'



// For internal use.
const qwiActionError = (error) => ({
  type    : QWI_ACTION_ERROR,
  payload : { error, }
})

const ratiosByFirmageDataRequested = (msa) => ({
  type : QWI_RATIOS_BY_FIRMAGE_DATA_REQUESTED,
  payload : { 
    msa,
  },
})

const ratiosByFirmageDataReceived = (msa, data) => ({
  type : QWI_RATIOS_BY_FIRMAGE_DATA_RECEIVED,
  payload : { 
    msa,
    data,
  },
})

const rawDataRequested = (msa) => ({
  type : QWI_RAW_DATA_REQUESTED,
  payload : { 
    msa,
  },
})

const rawDataReceived = (msa, data) => ({
  type    : QWI_RAW_DATA_RECEIVED,
  payload : { 
    msa,
    data,
  },
})

const nullAction = () => ({ type : QWI_NULL_ACTION, })



// Exposed API Actions
export const msaChange = (msa) => ({
  type : QWI_MSA_CHANGE,
  payload : { msa, }
})

export const measureChange = (measure) => ({
  type : QWI_MEASURE_CHANGE,
  payload : { measure, }
})

export const msaAndMeasureChange = (msa, measure) => ({
  type: QWI_MSA_AND_MEASURE_CHANGE,
  payload : { msa, measure, }
})


export const selectedQuarterWheelChange = (delta) => ({
  type : QWI_SELECTED_QUARTER_WHEEL_CHANGE,
  payload : { 
    delta, 
  },
})

export const lineGraphYearQuarterChange = (dateObj) => ({
  type : QWI_SELECTED_QUARTER_CHANGE,
  payload : { 
    selectedQuarter: getYearQuarterObjFromDateObj(dateObj), 
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
  type: QWI_SELECTED_FIRMAGE_WHEEL_CHANGE,
  payload: { delta },
})

export const firmageSelected = (firmage) => ({
  type: QWI_SELECTED_FIRMAGE_CHANGE,
  payload: { firmage }
})

export const mouseEnteredTooltipCell = (naics) => ({
  type: QWI_MOUSE_ENTERED_TOOLTIP_CELL,
  payload: { naics, }
})

export const mouseLeftTooltipCell = () => ({
  type: QWI_MOUSE_LEFT_TOOLTIP_CELL,
})


export const loadData = (msa) => (dispatch, getState) => {

  let state = getState().metroQwiData
  let madeRequest = false

  // If we don't already have it, get the national level ratiosByFirmage data.
  if (!_.has(state.inventory, ['ratiosByFirmage', '00000'])) {
    requestRatiosByFirmageData(dispatch, '00000')
    madeRequest = true
  }

  // If we don't already have it, get the metro's ratiosByFirmage data.
  if (!_.has(state.inventory, ['ratiosByFirmage', msa])) {
    requestRatiosByFirmageData(dispatch, msa)
    madeRequest = true
  }

  // If we don't already have it, get the metro's raw data.
  if (!_.has(state.inventory, ['raw', msa])) {
    requestRawDataForMetro(dispatch, msa)
    madeRequest = true
  }

  if (!madeRequest) {
    dispatch(nullAction())
  }
}


// Helpers
function requestRatiosByFirmageData (dispatch, msa) {
  dispatch(ratiosByFirmageDataRequested(msa))

  fetch(buildRatiosByFirmageRequestURL(msa))
    .then(handleFetchErrors)
    .then(response => response.json())
    .then(transformData)
    .then(data => dispatch(ratiosByFirmageDataReceived(msa, data)))
    .catch(err => dispatch(qwiActionError(err)))
}


function requestRawDataForMetro (dispatch, msa) {
  dispatch(rawDataRequested(msa))

  fetch(buildRawDataRequestURL(msa))
    .then(handleFetchErrors)
    .then(response => response.json())
    .then(transformData)
    .then(data => dispatch(rawDataReceived(msa, data)))
    .catch(err => dispatch(qwiActionError(err)))
}


function getYearQuarterObjFromDateObj (dateObj) {
  let splitDate = d3.time.format("%m-%Y")(dateObj).split('-')

  return {
    quarter : Math.floor((+splitDate[0]/3) + 1).toString(),
    year: splitDate[1],
  }
}


function buildRatiosByFirmageRequestURL (msa) {
  return `http://${apiServerAddress}/derived-data/measure-ratios-by-firmage/geography${msa}/` + 
             `industry${allQwiIndustryCodes.join('')}/year20012016/quarter/firmage12345` +
             `?${requestedRatioMeasures.map(m => `fields=${m}`).join('&')}&dense=true&flatLeaves=true`
}


function buildRawDataRequestURL (msa) {
  let fipsArr = msaToFips[msa]
  
  let isInterstate = (fipsArr.length > 1)

  let geoCode = (isInterstate) ? `geography${msa}` : `geography${fipsArr[0]}${msa}`

  return `http://${apiServerAddress}/` +
             ((isInterstate) ? `derived-data/interstate-msa/${geoCode}/` : `data/${geoCode}/`) +
             `industry${allQwiIndustryCodes.join('')}/year20012016/quarter/firmage012345` +
             `?${requestedRawMeasures.map(m => `fields=${m}`).join('&')}&dense=true&flatLeaves=true`
}


function transformData (data) { 
  let keys = Object.keys(data.data)

  if (keys.length !== 1) {
    throw new Error('QWI Error: Unexpected data formatting in API response.')
  } 

  let msa = keys[0]
  return data.data[msa]
}


function handleFetchErrors (response) {
  if (!response.ok) { throw new Error(`Fetch response statusText:\n${response.statusText}`) }

  return response
}
