/* @flow */

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_HOME_DATA = 'RECEIVE_HOME_DATA'

// ------------------------------------
// Actions
// ------------------------------------
// NOTE: "Action" is a Flow interface defined in https://github.com/TechnologyAdvice/flow-interfaces
// If you're unfamiliar with Flow, you are completely welcome to avoid annotating your code, but
// if you'd like to learn more you can check out: flowtype.org.
// DOUBLE NOTE: there is currently a bug with babel-eslint where a `space-infix-ops` error is
// incorrectly thrown when using arrow functions, hence the oddity.
export function homeState (value) {
  return {
    type: RECEIVE_HOME_DATA,
    payload: value
  }
}

// This is a thunk, meaning it is a function that immediately
// returns a function for lazy evaluation. It is incredibly useful for
// creating async actions, especially when combined with redux-thunk!
// NOTE: This is solely for demonstration purposes. In a real application,
// you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
// reducer take care of this logic.
export const changeHomeState = (value) => {
  return (dispatch) => {
      dispatch(homeState(value))
  }
}

export const actions = {
  homeState,
  changeHomeState
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECEIVE_HOME_DATA]: (state,action) => {

    var newState = Object.assign({},state);

    var pageState = action.payload;

    if(pageState.activeComponent){
      newState.activeComponent = pageState.activeComponent
    }
    if(pageState.bucket){
      newState.bucket = pageState.bucket
    }
    if(pageState.activeMapGraph){
      newState.activeMapGraph = pageState.activeMapGraph
    }    
    if(pageState.metric){
      newState.metric = pageState.metric
    }  
    if(pageState.hoverMetro){
      newState.hoverMetro = pageState.hoverMetro
    }   
    if(pageState.hoverYear){
      newState.hoverYear = pageState.hoverYear
    }      
    
    return newState;
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = { 
      activeComponent:'combined',
      bucket:'all',
      activeMapGraph:'map',
      metric:'composite',
      hoverMetro: null,
      hoverYear:2013
}
export default function homeDataReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
