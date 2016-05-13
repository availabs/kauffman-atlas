/* @flow */
import fetch from 'isomorphic-fetch'
import {qcewApi} from '../../AppConfig'
// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_METROQCEW_DATA = 'RECEIVE_METROQCEW_DATA'
export const RECEIVE_METROQCEW_DATA_WITH_YEAR = 'RECEIVE_METROQCEW_DATA_WITH_YEAR'
export const REQUEST_METROQCEW_DATA_WITH_YEAR = 'REQUEST_METROQCEW_DATA_WITH_YEAR'
const industries = [
		'11', '21', '22', '23', '31', '32', '33',
		'42', '44', '45', '48', '49', '51', '52',
		'53', '54', '55', '56', '61', '62', '71',
		'72', '81', '92'
]

var defIndCodes = industries.map(code => '0000'+code);

// ------------------------------------
// Actions
// ------------------------------------
export function receiveData (value, msaId) {
  return {
    type: RECEIVE_METROQCEW_DATA,
    payload: [value, msaId]
  }
}

export function receiveDataWithYear (value, msaId, year) {
  return {
    type: RECEIVE_METROQCEW_DATA_WITH_YEAR,
    payload: [value, msaId, year],
  }
}

export const loadMetroData = (msaId) => {
	var indcodes = defIndCodes.join('');
  return (dispatch) => {
    return fetch(qcewApi + 'data/fips' + 'C' + msaId.slice(0, 4) + '/ind' + indcodes)
           .then(response => response.json() )
           .then(json =>  dispatch(receiveData(json, msaId)) )
  }
}

export const loadMetroDataYear = (msaId, year) => {
		var indcodes = defIndCodes.join('');
		if(!year)
				throw "Attempted to load qcew year data with no year"
		let query = qcewApi + 'data/fips' + 'C' + msaId.slice(0,4) + '/yr' +
				year + '/ind' + indcodes + '?fields[]=all'
		console.log(JSON.stringify(query))
		
		return (dispatch) => {
				return fetch(query)
				            .then(response => response.json() )
				            .then(json => dispatch(receiveDataWithYear(json,msaId,year)) )
		}
}

const ACTION_HANDLERS = {
    [RECEIVE_METROQCEW_DATA]: (state, action) => {
	var newState = Object.assign({}, state)
	let msa = action.payload[1]
	let colors = d3.scale.category20()
	newState.data = action.payload[0]
	newState.data[0].values.map((ind,i) => {
	    ind.color = colors(i%20)
	    return ind
	})
		
	return newState
    },
    [RECEIVE_METROQCEW_DATA_WITH_YEAR]: (state, action) => {
	var newState = Object.assign({}, state)
	let msa = action.payload[1]
	let year = action.payload[2]
				
	newState.yeardata = newState.yeardata || {}
	newState.yeardata[year] = action.payload[0][0]
	console.log(action.payload[0][0].key)
	newState.yeardata[year].values[0].values.map((ind,i) => {
	    ind.color = d3.scale.category20()(i%20)
	    return ind
	})
	
      return newState
    },
    [REQUEST_METROQCEW_DATA_WITH_YEAR] : (state, action) => {
	var newState = Object.assign({}, state)
	let msa = action.payload[0]
	let year = action.payload[1]
	newState.year_requests = newState.year_requests || {}
	newState.year_requests[msa] = newState.year_requests[msa] || {}
	newState.year_requests[msa][year] = 
	    newState.year_requests[msa][year]|| 'loading'
    }
    
}

// ------------------------------
// Reducer
// ------------------------------
const initialState = {}

export default function metroQcewReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
