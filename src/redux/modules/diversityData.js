/* @flow */
import fetch from 'isomorphic-fetch'

// ------------------------------------
// Constants
// ------------------------------------

export const RECEIVE_OPPORTUNITY_DATA = 'RECEIVE_OPPORTUNITY_DATA'
export const RECEIVE_FOREIGNBORN_DATA = 'RECEIVE_FOREIGNBORN_DATA'
export const RECEIVE_EMPVARIANCE_DATA = 'RECEIVE_EMPVARIANCE_DATA'
export const RECEIVE_EMPHHI_DATA = 'RECEIVE_EMPHHI_DATA'
export const RECEIVE_DIVERSITYCOMPOSITE_DATA = 'RECEIVE_DIVERSITYCOMPOSITE_DATA'

export function receiveOpportunityData (value) {
  return {
    type: RECEIVE_OPPORTUNITY_DATA,
    payload: value
  }
}

export function receiveForeignBornData (value) {
  return {
    type: RECEIVE_FOREIGNBORN_DATA,
    payload: value
  }
}

export function receiveEmpVarianceData (value) {
  return {
    type: RECEIVE_EMPVARIANCE_DATA,
    payload: value
  }
}

export function receiveEmpHHIData (value) {
  return {
    type: RECEIVE_EMPHHI_DATA,
    payload: value
  }
}

export function receiveDiversityComposite (value) {
  return {
    type: RECEIVE_DIVERSITYCOMPOSITE_DATA,
    payload: value
  }
}


export const loadOpportunityData = () => {
  return (dispatch) => {
    return fetch('/data/processedOpportunity.json')
      .then(response => response.json())
      .then(json => dispatch(receiveOpportunityData(json)))
  }
}

export const loadForeignBornData = () => {
  return (dispatch) => {
    return fetch('/data/processedForeignborn.json')
      .then(response => response.json())
      .then(json => dispatch(receiveForeignBornData(json)))
  }
}

export const loadEmpVarianceData = () => {
  return (dispatch) => {
    return fetch('/data/processedEmpVariance.json')
      .then(response => response.json())
      .then(json => dispatch(receiveEmpVarianceData(json)))
  }
}


export const loadEmpHHIData = () => {
  return (dispatch) => {
    return fetch('/data/processedEmpHHI.json')
      .then(response => response.json())
      .then(json => dispatch(receiveEmpHHIData(json)))
  }
}


export const loadDiversityComposite = () => {
  return (dispatch) => {
    return fetch('/data/processedDiversityComposite.json')
      .then(response => response.json())
      .then(json => dispatch(receiveDiversityComposite(json)))
  }
}


export const actions = {
  receiveOpportunityData,
  receiveForeignBornData,
  receiveEmpVarianceData,
  receiveEmpHHIData,
  receiveDiversityComposite,
  loadOpportunityData,
  loadForeignBornData,
  loadEmpVarianceData,
  loadEmpHHIData,
  loadDiversityComposite
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECEIVE_OPPORTUNITY_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.opportunity = action.payload;

    return newState;
  },
  [RECEIVE_FOREIGNBORN_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.foreignborn = action.payload;

    return newState;
  },
  [RECEIVE_EMPVARIANCE_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.empVariance = action.payload;

    return newState;
  },
  [RECEIVE_EMPHHI_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.empHHI = action.payload;

    return newState;
  },
  [RECEIVE_DIVERSITYCOMPOSITE_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.diversitycomposite = action.payload;

    return newState;
  }
}


// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {};

export default function diversityReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
