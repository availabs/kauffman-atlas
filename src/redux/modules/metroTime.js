/* @flow */
import fetch from 'isomorphic-fetch'
// ------------------------------------
// Constants
// ------------------------------------
export const SET_METRO_YEAR = 'SET_METRO_YEAR'

export function setYearAction (data) {
    return {
	payload:data,
	type: SET_METRO_YEAR
    }
}

export const setYear = (year) => {
    return (dispatch) => dispatch(setYearAction(year))
}

const ACTION_HANDLERS = {

    [SET_METRO_YEAR]: (state, action) => {
	let newState = Object.assign({},state)
	newState.year = Object.assign({},newState.year)
	let data = action.payload
	newState.year[data.key] = data.value
	return newState
    },
}

// ------------------------------
// Reducer
// ------------------------------
const initialState = {year:{current:'2012',syear:'2001'}}

export default function metroTimeReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
