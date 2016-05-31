import _ from 'lodash'

import { QWI_DATA_REQUESTED, 
         QWI_DATA_RECEIVED, 
         QWI_MSA_CHANGE, 
         QWI_MEASURE_CHANGE, 
         QWI_QUARTER_CHANGE, 
         QWI_ACTION_ERROR } from './actions'


const initialState = {
  data : {},
  msa  : '',
  quarter : {
    yr  : null,
    qtr : null,
  },
  measure : {},
  inventory : {},
}



const insertNewData = (state, action) => _.merge(_.clone(state), action.payload)


const setStateField = (field, state, action) => 
  _.isEqual(state[field], action.payload[field]) ? state : _.merge(_.clone(state), action.payload)

   
const handleActionError = (state, action) => {
  console.error(action.payload.err.stack)
  return state
}



export const ACTION_HANDLERS = {

  [QWI_DATA_REQUESTED]: setStateField.bind(null, 'inventory'),

  [QWI_DATA_RECEIVED]: insertNewData,

  [QWI_MSA_CHANGE]: setStateField.bind(null, 'msa'),

  [QWI_QUARTER_CHANGE]: setStateField.bind(null, 'quarter'),

  [QWI_MEASURE_CHANGE]: setStateField.bind(null, 'measure'),

  [QWI_ACTION_ERROR]: handleActionError,
}



export const metroQwiReducer = (state = initialState, action) => {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
