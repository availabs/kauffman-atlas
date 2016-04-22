import { msaLookup , populationData } from 'static/data/msaDetails'
// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  //[RECEIVE_NATIONAL_DATA]: (state, action) => {{}}   
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
