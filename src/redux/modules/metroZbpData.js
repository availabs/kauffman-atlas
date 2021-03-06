/* @flow */
import fetch from 'isomorphic-fetch'
// ------------------------------------
// Constants
// ------------------------------------
export const RECIEVE_METROZBP_DATA = 'RECIEVE_METROZBP_DATA'
export const RECIEVE_METROZBP_ZIP_DATA = 'RECIEVE_METROZBP_ZIP_DATA'
export const RECIEVE_METROZBP_GEO_DATA = 'RECIEVE_METROZBP_GEO_DATA'
export const RECIEVE_METROZBP_GEO_ZIP_DATA = 'RECIEVE_METROZBP_GEO_ZIP_DATA'
export const RECIEVE_METROZBP_DATA_WITH_YEAR = 'RECIEVE_METROZBP_DATA_WITH_YEAR'
const location = 'http://zbp.availabs.org/'
  

// ------------------------------------
// Actions
// ------------------------------------
// NOTE: "Action" is a Flow interface defined in https://github.com/TechnologyAdvice/flow-interfaces
// If you're unfamiliar with Flow, you are completely welcome to avoid annotating your code, but
// if you'd like to learn more you can check out: flowtype.org.
// DOUBLE NOTE: there is currently a bug with babel-eslint where a `space-infix-ops` error is
// incorrectly thrown when using arrow functions, hence the oddity.
export function recieveData (value,msaId) {
  return {
    type: RECIEVE_METROZBP_DATA,
    payload: [value,msaId]
  }
}

export function recieveZipData (value,msaId,year) {
  return {
    type: RECIEVE_METROZBP_ZIP_DATA,
    payload: [value,msaId,year]
  }
}

export function recieveGeoData (value,msaId) {
  return {
    type: RECIEVE_METROZBP_GEO_DATA,
    payload: [value,msaId]
  }
}

export function recieveGeoZipData (value,msaId) {
  return {
    type: RECIEVE_METROZBP_GEO_ZIP_DATA,
    payload: [value,msaId]
  }
}

export function recieveDataWithYear (value,msaId,year) {
  return {
    type: RECIEVE_METROZBP_DATA_WITH_YEAR,
    payload: [value,msaId,year]
  }
}

export const loadMetroZipsGeo = (msaId, zips) => {
  return (dispatch) => {
    return fetch(location+'geozipcodes',{
      method: 'POST',
      body: JSON.stringify({
        zips: zips.filter(d => ['totalEmp', 'totalEst'].indexOf(d) === -1)
      })
    })
    .then(response => response.json())
    .then(json => {
      //console.log('test', json, zips)
      return dispatch(recieveGeoZipData(json,msaId))
    })
  }
}

export const loadMetroGeo = (msaId) => {
  return (dispatch) => {
    return fetch(location+'geozipcodes',{
      method: 'POST',
      body: JSON.stringify({
        fips:{
          type: 'metro',
          code: msaId
        }
      })
    })
    .then(response => response.json())
    .then(json =>dispatch(recieveGeoData(json,msaId)))
  }
}

export const loadZipData = (msaId, year) => {
  return (dispatch) => {
    return fetch(location+'details',{
      method: 'POST',
      body: JSON.stringify({
        fips:{
          type: 'metro',
          code: msaId
        },
        year: year
      })
    })
    .then(response => response.json())
    .then(json =>dispatch(recieveZipData(json, msaId, year)))
  }
}

export const loadMetroData = (msaId) => {
  return (dispatch) => {
    return fetch('/data/metroZbp/'+msaId+'.json')
      .then(response => response.json())
      .then(json => dispatch(recieveData(json,msaId)))
  }
}

export const loadMetroDataYear = (msaId, year) => {
  return (dispatch) => {
    return fetch('/data/metroZbp_by_year/'+msaId+'_'+ year+'.json')
      .then(response => response.json())
      .then(json => dispatch(recieveDataWithYear(json,msaId,year)))
  }
}

export const actions = {
  recieveDataWithYear,
  recieveData,
  loadMetroData,
  loadMetroDataYear
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECIEVE_METROZBP_ZIP_DATA]: (state,action) => {
    var newState = Object.assign({},state);
    //console.log('test', action.payload[0].data)
    if(!newState.data[action.payload[2]]) { newState.data[action.payload[2]] = {} }
    newState.data[action.payload[2]][action.payload[1]] = action.payload[0].data;
    return newState;
  },
  [RECIEVE_METROZBP_GEO_ZIP_DATA]: (state,action) => {
    var newState = Object.assign({},state);
    newState.zip[action.payload[1]] = action.payload[0]
    return newState
  },
  [RECIEVE_METROZBP_GEO_DATA]: (state,action) => {
    var newState = Object.assign({},state);
    newState.geo[action.payload[1]] = action.payload[0]
    return newState
  },
  [RECIEVE_METROZBP_DATA]: (state,action) => {
    var newState = Object.assign({},state);
    newState[action.payload[1]] = action.payload[0];
    return newState;
  },
  [RECIEVE_METROZBP_DATA_WITH_YEAR]: (state,action) => {
    var newState = Object.assign({},state);
    if(!newState[action.payload[2]]) { newState[action.payload[2]] = {} }
    newState[action.payload[2]][action.payload[1]] = action.payload[0];
    console.log('test', action.payload[2],action.payload[1])
    return newState;
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {geo:{},zip:{},data:{}};

export default function metroZbpReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
