/* @flow */
import fetch from 'isomorphic-fetch'
// ------------------------------------
// Constants
// ------------------------------------
export const RECIEVE_METRO_GDP_DATA = 'RECIEVE_METRO_GDP_DATA'
export const RECIEVE_METRO_GDP_PER_CAPITA_DATA = 'RECIEVE_METRO_GDP_PER_CAPITA_DATA'

// ------------------------------------
// Actions
// ------------------------------------
// NOTE: "Action" is a Flow interface defined in https://github.com/TechnologyAdvice/flow-interfaces
// If you're unfamiliar with Flow, you are completely welcome to avoid annotating your code, but
// if you'd like to learn more you can check out: flowtype.org.
// DOUBLE NOTE: there is currently a bug with babel-eslint where a `space-infix-ops` error is
// incorrectly thrown when using arrow functions, hence the oddity.
function recieveData (type,value,msaId) {
  return {
    type: type,
    payload: [value,msaId]
  }
}

// This is a thunk, meaning it is a function that immediately
// returns a function for lazy evaluation. It is incredibly useful for
// creating async actions, especially when combined with redux-thunk!
// NOTE: This is solely for demonstration purposes. In a real application,
// you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
// reducer take care of this logic.
export const loadMetroGdp = (msaId) => {
  return (dispatch) => {
    return fetch('http://bea.gov/api/data/?UserID=DF1D6670-E35A-40F3-B4CA-A5F68A8EE147&method=GetData&datasetname=RegionalProduct&Component=RGDP_MAN&IndustryId=1&Year=ALL&GeoFips=' + msaId + '&ResultFormat=json')
      .then(response => {
        //console.log('test', response)
        return response.json()
      })
      .then(json => dispatch(recieveData(RECIEVE_METRO_GDP_DATA,json,msaId)))
  }
}

export const loadMetroGdpPerCapita = (msaId) => {
  return (dispatch) => {
    return fetch('http://bea.gov/api/data/?UserID=DF1D6670-E35A-40F3-B4CA-A5F68A8EE147&method=GetData&datasetname=RegionalProduct&Component=PCRGDP_MAN&IndustryId=1&Year=ALL&GeoFips=' + msaId + '&ResultFormat=json')
      .then(response => {
        //console.log('test', response)
        return response.json()
      })
      .then(json => dispatch(recieveData(RECIEVE_METRO_GDP_PER_CAPITA_DATA,json,msaId)))
  }
}

export const actions = {
  recieveData,
  loadMetroGdp
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECIEVE_METRO_GDP_DATA]: (state,action) => {
    var newState = Object.assign({},state);
    if(!newState[action.payload[1]]) newState[action.payload[1]] = {}
    newState[action.payload[1]]['gdp'] = action.payload[0].BEAAPI.Results.Data.map(d => { 
      return {
        key: d.TimePeriod,
        value: +d.DataValue
      }
    });
    return newState;
  },
  [RECIEVE_METRO_GDP_PER_CAPITA_DATA]: (state,action) => {
    var newState = Object.assign({},state);
    if(!newState[action.payload[1]]) newState[action.payload[1]] = {}
    newState[action.payload[1]]['gdp_per_capita'] = action.payload[0].BEAAPI.Results.Data.map(d => { 
      return {
        key: d.TimePeriod,
        value: +d.DataValue
      }
    });
    return newState;
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {};

export default function metroGdpReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
