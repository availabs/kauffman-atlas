import _ from 'lodash'


import { 
  QWI_DATA_REQUESTED,
  QWI_DATA_RECEIVED,
  QWI_MSA_CHANGE,
  QWI_MEASURE_CHANGE,
  QWI_LINEGRAPH_FOCUS_CHANGE,
  QWI_OVERVIEW_TABLE_SORT_FIELD_CHANGE,
  QWI_QUARTER_CHANGE,
  QWI_ACTION_ERROR
} from './actions'


const initialState = {
  data : {
    raw: {},
    ratiosByFirmage: {},
  },
  msa  : '',
  quarter : {
    yr  : null,
    qtr : null,
  },
  measure : '',
  inventory : {
    raw: {},
    ratiosByFirmage: {},
  },
  focusedLineGraph : 'qwi-rawData-linegraph',
  overviewTableSortField : 'measure',
}



// CONSIDER: cloneDeep may be more costly than it's worth.
const insertNewData = (state, action) => {
  //let newState = _.merge(_.cloneDeep(state), action.payload)
  let newState = _.merge(_.clone(state), action.payload)
  console.log(newState)
  return newState
}


// CONSIDER: cloneDeep may be more costly than it's worth.
const setStateField = (field, state, action) => 
  //_.isEqual(state[field], action.payload[field]) ? state : _.merge(_.cloneDeep(state), action.payload)
  _.isEqual(state[field], action.payload[field]) ? state : _.merge(_.clone(state), action.payload)

   
const handleActionError = (state, action) => {
  console.error(action.payload.err.stack)
  return state
}



export const ACTION_HANDLERS = {

  [QWI_DATA_REQUESTED]: setStateField.bind(null, 'inventory'),

  [QWI_DATA_RECEIVED]: insertNewData,

  [QWI_MSA_CHANGE]: setStateField.bind(null, 'msa'),

  [QWI_LINEGRAPH_FOCUS_CHANGE]: setStateField.bind(null, 'focusedLineGraph'),

  [QWI_OVERVIEW_TABLE_SORT_FIELD_CHANGE]: setStateField.bind(null, 'overviewTableSortField'),

  [QWI_QUARTER_CHANGE]: setStateField.bind(null, 'quarter'),

  [QWI_MEASURE_CHANGE]: setStateField.bind(null, 'measure'),

  [QWI_ACTION_ERROR]: handleActionError,
}



export const metroQwiReducer = (state = initialState, action) => {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
