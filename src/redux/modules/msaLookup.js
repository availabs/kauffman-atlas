import { msaLookup , populationData } from 'static/data/msaDetails'
// ------------------------------------
// Action Handlers
// ------------------------------------
export const RECEIVE_NAICS_KEYS = 'RECEIVE_NAICS_KEYS'

export function recieveData (value) {
  return {
    type: RECEIVE_NAICS_KEYS,
    payload: value
  }
}


export const loadNaicsKeys = () => {
  return (dispatch) => {
    return fetch('/data/naicsKeys.json')
      .then(response => response.json())
      .then(json => dispatch(recieveData(json)))
  }
}

const ACTION_HANDLERS = {
  [RECEIVE_NAICS_KEYS]: (state,action) => {
    let newState = Object.assign({},state);
    newState.naicsKeys = action.payload;
    return newState;
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = Object.keys(msaLookup).reduce((prev,msaid) => {
	if(!prev[msaid]) prev[msaid] = {}
	prev[msaid] = {name: msaLookup[msaid], pop:populationData[msaid]}
	return prev
},{})

export default function msaLookupReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
