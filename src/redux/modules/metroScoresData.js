/* @flow */
import fetch from 'isomorphic-fetch'
// ------------------------------------
// Constants
// ------------------------------------
export const RECIEVE_METRO_SCORES_DATA = 'RECIEVE_METRO_SCORES_DATA'


// ------------------------------------
// Actions
// ------------------------------------
// NOTE: "Action" is a Flow interface defined in https://github.com/TechnologyAdvice/flow-interfaces
// If you're unfamiliar with Flow, you are completely welcome to avoid annotating your code, but
// if you'd like to learn more you can check out: flowtype.org.
// DOUBLE NOTE: there is currently a bug with babel-eslint where a `space-infix-ops` error is
// incorrectly thrown when using arrow functions, hence the oddity.
function recieveData (value,msaId) {
  return {
    type: RECIEVE_METRO_SCORES_DATA,
    payload: [value,msaId]
  }
}

// This is a thunk, meaning it is a function that immediately
// returns a function for lazy evaluation. It is incredibly useful for
// creating async actions, especially when combined with redux-thunk!
// NOTE: This is solely for demonstration purposes. In a real application,
// you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
// reducer take care of this logic.
export const loadMetroScores = (msaId) => {
  return (dispatch) => {
    return fetch('/data/metros/'+msaId +'.json')
      .then(response => {
        return response.json()
      })
      .then(json => dispatch(recieveData(json,msaId)))
  }
}

export const actions = {
  recieveData,
  loadMetroScores
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECIEVE_METRO_SCORES_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState[action.payload[1]] = action.payload[0];

    return newState;
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {};

export default function metroScoresReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
