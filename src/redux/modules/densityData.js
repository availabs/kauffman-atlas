/* @flow */
import fetch from 'isomorphic-fetch'
import { msaLookup, populationData } from 'static/data/msaDetails'
import colorbrewer from 'colorbrewer'
import d3 from 'd3'
// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_NEWVALUES_DATA = 'RECEIVE_NEWVALUES_DATA'
export const RECEIVE_SHARE_DATA = 'RECEIVE_SHARE_DATA'
export const RECEIVE_SHAREEMPNOACCRET_DATA = 'RECEIVE_SHAREEMPNOACCRET_DATA'
export const RECEIVE_SHAREEMPHIGHTECH_DATA = 'RECEIVE_SHAREEMPHIGHTECH_DATA'
export const RECEIVE_DENSITYCOMPOSITE_DATA = 'RECEIVE_DENSITYCOMPOSITE_DATA'

// ------------------------------------
// Actions
// ------------------------------------
// NOTE: "Action" is a Flow interface defined in https://github.com/TechnologyAdvice/flow-interfaces
// If you're unfamiliar with Flow, you are completely welcome to avoid annotating your code, but
// if you'd like to learn more you can check out: flowtype.org.
// DOUBLE NOTE: there is currently a bug with babel-eslint where a `space-infix-ops` error is
// incorrectly thrown when using arrow functions, hence the oddity.

export function receiveNewValuesData (value) {
  return {
    type: RECEIVE_NEWVALUES_DATA,
    payload: value
  }
}

export function receiveShareData (value) {
  return {
    type: RECEIVE_SHARE_DATA,
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

export function receiveCompositeData (value) {
  return {
    type: RECEIVE_DENSITYCOMPOSITE_DATA,
    payload: value
  }
}



// This is a thunk, meaning it is a function that immediately
// returns a function for lazy evaluation. It is incredibly useful for
// creating async actions, especially when combined with redux-thunk!
// NOTE: This is solely for demonstration purposes. In a real application,
// you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
// reducer take care of this logic.
export const loadNewValues = () => {
  return (dispatch) => {
    return fetch('/data/processedNewFirms.json')
      .then(response => response.json())
      .then(json => dispatch(receiveNewValuesData(json)))
  }
}

export const loadShare = () => {
  return (dispatch) => {
    return fetch('/data/processedShareEmp.json')
      .then(response => response.json())
      .then(json => dispatch(receiveShareData(json)))
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

export const loadDensityComposite = () => {
  return (dispatch) => {
    return fetch('/data/processedDensityComposite.json')
      .then(response => response.json())
      .then(json => dispatch(receiveCompositeData(json)))
  }
}


export const actions = {
  loadNewValues,
  loadShare,
  loadShareEmpNoAccRet,
  loadShareEmpHighTech,
  loadDensityComposite,
  receiveNewValuesData,
  receiveShareData,
  receiveShareEmpNoAccRetData,
  receiveShareEmpHighTechData,
  receiveCompositeData
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECEIVE_NEWVALUES_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.newValuesData = action.payload;

    return newState;
  },
  [RECEIVE_SHARE_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.shareData = action.payload;

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
  [RECEIVE_DENSITYCOMPOSITE_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.compositeData = action.payload;

    return newState;
  }
}


// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {};

export default function densityReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
