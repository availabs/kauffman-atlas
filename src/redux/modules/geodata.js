/* @flow */
import fetch from 'isomorphic-fetch'
import topojson from 'topojson'
// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_NATIONAL_DATA = 'RECEIVE_NATIONAL_DATA'

// ------------------------------------
// Actions
// ------------------------------------
export function receiveData (value) {
  return {
    type: RECEIVE_NATIONAL_DATA,
    payload: value
  }
}

export const loadNationalData = () => {
  return (dispatch) => {
    return fetch('/us.json')
      .then(response => response.json())
      .then(json => dispatch(receiveData(json)))
  }
}

export const actions = {
  receiveData,
  loadNationalData
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECEIVE_NATIONAL_DATA]: (state, action) => {
    let newState =  Object.assign({},state);
    newState.loaded = true;
    let us = action.payload
    newState.statesGeo = topojson.feature(us,us["objects"]["states.geo"])
    newState.metrosGeo = topojson.feature(us,us["objects"]["fixMsa.geo"])
    return  newState;
  }
}


// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {loaded: false}
export default function geodataReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
