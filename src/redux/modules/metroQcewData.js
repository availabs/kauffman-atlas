/* @flow */
import fetch from 'isomorphic-fetch'
import {qcewApi} from '../../AppConfig'
// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_METROQCEW_DATA = 'RECEIVE_METROQCEW_DATA'
export const RECEIVE_METROQCEW_DATA_WITH_YEAR = 'RECEIVE_METROQCEW_DATA_WITH_YEAR'

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
    payload: [value, msaId, year]
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

const ACTION_HANDLERS = {
    [RECEIVE_METROQCEW_DATA]: (state, action) => {
      var newState = Object.assign({}, state)
      newState.data = action.payload[0]
      return newState
    },
    [RECEIVE_METROQCEW_DATA_WITH_YEAR]: (state, action) => {
      var newState = Object.assign({}, state)
      newState.data = action.payload
      return newState
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
