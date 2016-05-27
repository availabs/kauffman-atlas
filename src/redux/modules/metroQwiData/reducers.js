import { RECEIVE_METRO_QWI_DATA, SET_QWI_COMP_QTR_DATA, QWI_ACTION_ERROR } from './actions'


import { industryTitles } from './constants'


const receiveQwiData = (state, action) => {
  let newState = Object.assign(({}, state))

  let newData = _.mapKeys(action.payload.data, (v,k) => k.substring(2))

  _.defaultsDeep(newState.data, newData)

  return newState
}


//const setYearData = (state,action) => {
    //let year = action.payload[2]
    //let msaId = action.payload[1]
    //let shell ={}

    //shell[msaId] = null
    //state.yeardata = Object.assign({},shell) || {}
    //state.yeardata[msaId] = d3.nest()
        //.key( x=> x.year )
        //.rollup( value => value )
        //.map( state.data || [] )
    //return state
//}



export const ACTION_HANDLERS = {
  [RECEIVE_METRO_QWI_DATA]: (state, action) => {
    return receiveQwiData(state, action)
  },

  [SET_QWI_COMP_QTR_DATA]: (state, action) => {
    let newState = Object.assign({},state)
    let data = action.payload
    newState.qtrData = data
    return newState
  },

  [QWI_ACTION_ERROR]: (state, action) => {
    console.error(action.payload.err.stack) 

    return state
  }
}



let initialState = {
  data : {},
  industryTitles,
}


export const metroQwiReducer = (state = initialState, action) => {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
