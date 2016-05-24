/* @flow */
import fetch from 'isomorphic-fetch'
import topojson from 'topojson'
// ------------------------------------
// Constants
// ------------------------------------
export const RECIEVE_NATIONAL_DATA = 'RECIEVE_NATIONAL_DATA'

// ------------------------------------
// Actions
// ------------------------------------
// NOTE: "Action" is a Flow interface defined in https://github.com/TechnologyAdvice/flow-interfaces
// If you're unfamiliar with Flow, you are completely welcome to avoid annotating your code, but
// if you'd like to learn more you can check out: flowtype.org.
// DOUBLE NOTE: there is currently a bug with babel-eslint where a `space-infix-ops` error is
// incorrectly thrown when using arrow functions, hence the oddity.
export function recieveData (value) {
  return {
    type: RECIEVE_NATIONAL_DATA,
    payload: value
  }
}

// This is a thunk, meaning it is a function that immediately
// returns a function for lazy evaluation. It is incredibly useful for
// creating async actions, especially when combined with redux-thunk!
// NOTE: This is solely for demonstration purposes. In a real application,
// you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
// reducer take care of this logic.
export const loadNationalData = () => {
  return (dispatch) => {
    return fetch('/us.json')
      .then(response => response.json())
      .then(json => dispatch(recieveData(json)))
  }
}

export const actions = {
  recieveData,
  loadNationalData
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECIEVE_NATIONAL_DATA]: (state,action) => {

    var newState = Object.assign({},state);
    let us = action.payload;

    newState.loaded = true;
    newState.statesGeo = topojson.feature(us,us["objects"]["states.geo"]),
    newState.metrosGeo = topojson.feature(us,us["objects"]["fixMsa.geo"])

    return newState;
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = { loaded:false }
export default function geoDataReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
