import { msaLookup , populationData } from 'static/data/msaDetails'
import {SimpleTrie} from 'support/simpletrie'
import _ from 'lodash'
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

let naicsRangeHelper = (trie,prefix,depth) =>{
    prefix = prefix.split('-')
    let numCodes = prefix.map(x => parseInt(x))
    let exact = (x) => x.length!==6	
    if(numCodes.length === 1)
	return trie.gQuery(prefix,depth,exact)    
    else{
	let query = _.range(numCodes[0],numCodes[1]+1).map(x=> x+'')
	return trie.gQuery(query,depth,exact)
    }
}

const ACTION_HANDLERS = {
  [RECEIVE_NAICS_KEYS]: (state,action) => {
      let newState = Object.assign({},state);
      newState.naicsKeys = action.payload;
      newState.naicsLookup = new SimpleTrie()
      newState.naicsLookup.Query = naicsRangeHelper.bind(null,newState.naicsLookup)
      Object.keys(newState.naicsKeys)
	  .sort((a,b)=> a.length-b.length)
	  .forEach( key =>{
	      if(key.indexOf('-') !== -1)
		  return
	      newState.naicsLookup.addString(key)
	  })
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
