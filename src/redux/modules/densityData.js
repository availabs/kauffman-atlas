/* @flow */
import fetch from 'isomorphic-fetch'
// ------------------------------------
// Constants
// ------------------------------------
export const RECIEVE_DENSITY_DATA = 'RECIEVE_DENSITY_DATA'

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
    type: RECIEVE_DENSITY_DATA,
    payload: value
  }
}

// This is a thunk, meaning it is a function that immediately
// returns a function for lazy evaluation. It is incredibly useful for
// creating async actions, especially when combined with redux-thunk!
// NOTE: This is solely for demonstration purposes. In a real application,
// you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
// reducer take care of this logic.
export const loadDensityData = () => {
  return (dispatch) => {
    return fetch('/data/density_data.json')
      .then(response => response.json())
      .then(json => dispatch(recieveData(json)))
  }
}

export const actions = {
  recieveData,
  loadDensityData
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECIEVE_DENSITY_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.data = action.payload;
    newState.loaded = true;

    return newState;
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {loaded:false};

export default function densityReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
