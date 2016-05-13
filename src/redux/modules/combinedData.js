/* @flow */
import fetch from 'isomorphic-fetch'
import colorbrewer from 'colorbrewer'
import d3 from 'd3'
// ------------------------------------
// Constants
// ------------------------------------

export const RECEIVE_COMBINEDCOMPOSITE_DATA = 'RECEIVE_COMBINEDCOMPOSITE_DATA'

export const loadCombinedComposite = () => {
  return (dispatch) => {
    return fetch('/data/processedCombinedComposite.json')
      .then(response => response.json())
      .then(json => dispatch(receiveCombinedComposite(json)))
  }
}

export function receiveCombinedComposite (value) {
  return {
    type: RECEIVE_COMBINEDCOMPOSITE_DATA,
    payload: value
  }
}


export const actions = {
  loadCombinedComposite,
  receiveCombinedComposite
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECEIVE_COMBINEDCOMPOSITE_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.combinedcomposite = action.payload;

    return newState;
  }
}


// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {};

export default function combinedReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
