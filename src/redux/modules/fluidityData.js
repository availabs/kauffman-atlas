/* @flow */
import fetch from 'isomorphic-fetch'
import colorbrewer from 'colorbrewer'
import d3 from 'd3'
import { msaLookup, populationData } from 'static/data/msaDetails'

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_INC5000_DATA = 'RECEIVE_INC5000_DATA'
export const RECEIVE_COMPOSITE_DATA = 'RECEIVE_COMPOSITE_DATA'
export const RECEIVE_NETMIGRATIONIRS_DATA = 'RECEIVE_NETMIGRATIONIRS_DATA'
export const RECEIVE_TOTALMIGRATION_DATA = 'RECEIVE_TOTALMIGRATION_DATA'
export const RECEIVE_INFLOWMIGRATION_DATA = 'RECEIVE_INFLOWMIGRATION_DATA'
export const RECEIVE_OUTFLOWMIGRATION_DATA = 'RECEIVE_OUTFLOWMIGRATION_DATA'
export const RECEIVE_ANNUALCHURN_DATA = 'RECEIVE_ANNUALCHURN_DATA'

export const loadInc5000Data = () => {
  return (dispatch) => {
    return fetch('/data/processedInc5000.json')
      .then(response => response.json())
      .then(json => dispatch(receiveInc5000Data(json)))
  }
}
export function receiveInc5000Data (value) {
  return {
    type: RECEIVE_INC5000_DATA,
    payload: value
  }
}

export const loadFluidityComposite = () => {
  return (dispatch) => {
    return fetch('/data/processedFluidityComposite.json')
      .then(response => response.json())
      .then(json => dispatch(receiveFluidityComposite(json)))
  }
}
export function receiveFluidityComposite (value) {
  return {
    type: RECEIVE_COMPOSITE_DATA,
    payload: value
  }
}

export const loadNetMigrationIrs = () => {
  return (dispatch) => {
    return fetch('/data/processedNetMigration.json')
      .then(response => response.json())
      .then(json => dispatch(receiveNetMigrationIrs(json)))
  }
}
export function receiveNetMigrationIrs (value) {
  return {
    type: RECEIVE_NETMIGRATIONIRS_DATA,
    payload: value
  }
}

export const loadTotalMigration = () => {
  return (dispatch) => {
    return fetch('/data/processedTotalMigration.json')
      .then(response => response.json())
      .then(json => dispatch(receiveTotalMigration(json)))
  }
}
export function receiveTotalMigration (value) {
  return {
    type: RECEIVE_TOTALMIGRATION_DATA,
    payload: value
  }
}

export const loadInflowMigration = () => {
  return (dispatch) => {
    return fetch('/data/processedInflowMigration.json')
      .then(response => response.json())
      .then(json => dispatch(receiveInflowMigration(json)))
  }
}
export function receiveInflowMigration (value) {
  return {
    type: RECEIVE_INFLOWMIGRATION_DATA,
    payload: value
  }
}

export const loadOutflowMigration = () => {
  return (dispatch) => {
    return fetch('/data/processedOutflowMigration.json')
      .then(response => response.json())
      .then(json => dispatch(receiveOutflowMigration(json)))
  }
}
export function receiveOutflowMigration (value) {
  return {
    type: RECEIVE_OUTFLOWMIGRATION_DATA,
    payload: value
  }
}

export const loadAnnualChurn = () => {
  return (dispatch) => {
    return fetch('/data/processedAnnualChurn.json')
      .then(response => response.json())
      .then(json => dispatch(receiveAnnualChurn(json)))
  }
}
export function receiveAnnualChurn (value) {
  return {
    type: RECEIVE_ANNUALCHURN_DATA,
    payload: value
  }
}


export const actions = {
  loadInc5000Data,
  receiveInc5000Data,
  loadFluidityComposite,
  receiveFluidityComposite,
  loadNetMigrationIrs,
  receiveNetMigrationIrs,
  loadTotalMigration,
  receiveTotalMigration,
  loadInflowMigration,
  receiveInflowMigration,
  loadOutflowMigration,
  receiveOutflowMigration,
  loadAnnualChurn,
  receiveAnnualChurn
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECEIVE_INC5000_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.inc5000 = action.payload;
    
    return newState;
  },
  [RECEIVE_COMPOSITE_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.compositeData = action.payload;

    return newState;
  },
  [RECEIVE_NETMIGRATIONIRS_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.irsNet = action.payload

    return newState;
  },
  [RECEIVE_TOTALMIGRATION_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.totalMigrationFlow = action.payload

    return newState;
  },
  [RECEIVE_INFLOWMIGRATION_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.inflowMigration = action.payload

    return newState;
  },
  [RECEIVE_OUTFLOWMIGRATION_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.outflowMigration = action.payload

    return newState;
  },
  [RECEIVE_ANNUALCHURN_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.annualChurn = action.payload

    return newState;
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = { };

export default function fluidityReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
