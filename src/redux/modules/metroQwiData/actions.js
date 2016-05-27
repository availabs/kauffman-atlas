import { qwiAPIServer as apiConfig } from '../../../AppConfig'
import { msaToFips } from './constants'


export const RECEIVE_METRO_QWI_DATA = 'RECEIVE_METRO_QWI_DATA'
export const SET_QWI_COMP_QTR_DATA  = 'SET_QWI_COMP_QTR_DATA'
export const QWI_ACTION_ERROR       = 'QWI_ACTION_ERROR'


const apiServerAddress = `${apiConfig.hostname}${(apiConfig.port) ? (':' + apiConfig.port) : ''}`


const qwiActionError = (err) => ({
  type    : QWI_ACTION_ERROR,
  payload : { err, }
})

const receiveData = (data, msa) => ({
  type    : RECEIVE_METRO_QWI_DATA,
  payload : { data, msa, },
})

export const setCurrentMetroQuarter = (tableData) => ({
  type    : SET_QWI_COMP_QTR_DATA,
  payload : tableData,
})


const buildURL = (msa, measure) => 
  `http://${apiServerAddress}/data/geography${msaToFips[msa]}${msa}/year20012016/quarter/industry` + 
    `?fields=${measure}&dense=true&flatLeaves=true`


const handleFetchErrors = response => {
  if (response.ok) { return response }

  throw new Error(`Fetch response statusText:\n${response.statusText}`)
}


export const loadMetroData = (msa, measure, event) => 

  (dispatch, getState) => {
    let state = getState().metroQwiData

    if (state.data && state.data[msa]) {
      return console.log('Already have the data.')
    } 

    fetch(buildURL(msa, measure))
                  .then(handleFetchErrors)
                  .then(response => response.json())
                  .then(json => dispatch(event ? event(json.data) : receiveData(json.data, msa)))
                  .catch(err => dispatch(qwiActionError(err)))
  }


export const setMetroQuarter = (tableData) => (dispatch) => dispatch(setCurrentMetroQuarter(tableData))
