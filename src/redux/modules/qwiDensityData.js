/* @flow */
import fetch from 'isomorphic-fetch'
import d3 from 'd3'
// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_SHAREEMPALL_DATA = 'RECEIVE_SHAREEMPALL_DATA'
export const RECEIVE_SHAREEMPNOACCRET_DATA = 'RECEIVE_SHAREEMPNOACCRET_DATA'
export const RECEIVE_SHAREEMPHIGHTECH_DATA = 'RECEIVE_SHAREEMPHIGHTECH_DATA'
export const RECEIVE_SHAREEMPINFO_DATA = 'RECEIVE_SHAREEMPINFO_DATA'
export const RECEIVE_SHAREEMPPRO_DATA = 'RECEIVE_SHAREEMPPRO_DATA'


export function receiveShareEmpAllData (value) {
  return {
    type: RECEIVE_SHAREEMPALL_DATA,
    payload: value
  }
}

export function receiveShareEmpNoAccRetData (value) {
  return {
    type: RECEIVE_SHAREEMPNOACCRET_DATA,
    payload: value
  }
}

export function receiveShareEmpHighTechData (value) {
  return {
    type: RECEIVE_SHAREEMPHIGHTECH_DATA,
    payload: value
  }
}

export function receiveShareEmpInfoData (value) {
  return {
    type: RECEIVE_SHAREEMPINFO_DATA,
    payload: value
  }
}

export function receiveShareEmpProData (value) {
  return {
    type: RECEIVE_SHAREEMPPRO_DATA,
    payload: value
  }
}


export const loadShareEmpAll = () => {
  return (dispatch) => {
    return fetch('/data/processedShareEmpNewFirmsQWI_All.json')
      .then(response => response.json())
      .then(json => dispatch(receiveShareEmpAllData(json)))
  }
}

export const loadShareEmpNoAccRet = () => {
  return (dispatch) => {
    return fetch('/data/processedShareEmpNewFirmsQWI_ExceptAccomAndRetail.json')
      .then(response => response.json())
      .then(json => dispatch(receiveShareEmpNoAccRetData(json)))
  }
}

export const loadShareEmpHighTech = () => {
  return (dispatch) => {
    return fetch('/data/processedShareEmpNewFirmsQWI_HighTech.json')
      .then(response => response.json())
      .then(json => dispatch(receiveShareEmpHighTechData(json)))
  }
}

export const loadShareEmpInfo = () => {
  return (dispatch) => {
    return fetch('/data/processedShareEmpNewFirmsQWI_Information.json')
      .then(response => response.json())
      .then(json => dispatch(receiveShareEmpInfoData(json)))
  }
}

export const loadShareEmpPro = () => {
  return (dispatch) => {
    return fetch('/data/processedShareEmpNewFirmsQWI_Professional.json')
      .then(response => response.json())
      .then(json => dispatch(receiveShareEmpProData(json)))
  }
}

export const actions = {
  receiveShareEmpAllData,
  receiveShareEmpNoAccRetData,
  receiveShareEmpHighTechData,
  receiveShareEmpInfoData,
  receiveShareEmpProData,
  loadShareEmpAll,
  loadShareEmpNoAccRet,
  loadShareEmpHighTech,
  loadShareEmpInfo,
  loadShareEmpPro
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECEIVE_SHAREEMPALL_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.shareEmpAll = action.payload;

    return newState;
  },
  [RECEIVE_SHAREEMPNOACCRET_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.shareEmpNoAccRet = action.payload;

    return newState;
  },
  [RECEIVE_SHAREEMPHIGHTECH_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.shareEmpHighTech = action.payload;

    return newState;
  },
  [RECEIVE_SHAREEMPINFO_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.shareEmpInfo = action.payload;

    return newState;
  },
  [RECEIVE_SHAREEMPPRO_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.shareEmpPro = action.payload;

    return newState;
  }
}


// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {};

export default function qwiDensityReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
