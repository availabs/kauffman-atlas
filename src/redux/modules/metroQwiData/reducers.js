import _ from 'lodash'


import { 
  QWI_MSA_CHANGE,
  QWI_MEASURE_CHANGE,
  QWI_RATIOS_BY_FIRMAGE_DATA_REQUESTED,
  QWI_RATIOS_BY_FIRMAGE_DATA_RECEIVED,
  QWI_RAW_DATA_REQUESTED,
  QWI_RAW_DATA_RECEIVED,
  QWI_LINEGRAPH_FOCUS_CHANGE,
  QWI_LINEGRAPH_YEARQUARTER_CHANGE,
  QWI_OVERVIEW_TABLE_SORT_FIELD_CHANGE,
  QWI_RADAR_GRAPH_FIRMAGE_CHANGE,
  QWI_ACTION_ERROR,
} from './actions'


const initialState = {

  msa: '',
  measure: '',
  
  data: {
    raw: {},
    ratiosByFirmage: {},
  },
  
  lineGraphs: {
    focused: 'qwi-rawData-linegraph',
    tooltip: {
      yearQuarter: {
        year:    null,
        quarter: null,
      },
    }
  },

  radarGraphs: {
    firmage: '1',
  },

  overviewTable: {
    yearQuarter: {
      year:    null,
      quarter: null,
    },
    sortField: 'measures',
  },
  
  inventory: {
    raw: {},
    ratiosByFirmage: {},
  },
}



// CONSIDER: Mutates state, but cloneDeep may be more costly than it's worth.
const setStateField = (state, fieldPath, fieldValue) => 
  _.isEqual(_.get(state, fieldPath), fieldValue) ? state : _.set(_.clone(state), fieldPath, fieldValue)

   
const handleActionError = (state, action) => {
  console.error(action.payload.err.stack)
  return state
}


const handleLineGraphYearQuarterChange = (state, action) => {

  let yearQuarter = action.payload.yearQuarter

  if (!_.isEmpty(_.get(state, ['data', 'raw', state.msa, yearQuarter.year, yearQuarter.quarter]))) {
    return setStateField(state, 'lineGraphs.tooltip.yearQuarter', action.payload.yearQuarter)
  }

  return state
}

const handleRadarsChartFirmageChange = (state, action) => {
  let oldFirmage = parseInt(state.radarGraphs.firmage)
  let newFirmage = (((((oldFirmage - 1 + action.payload.delta)%5)+5)%5) + 1).toString()
  return setStateField(state, 'radarGraphs.firmage', newFirmage)
}

const updateInventory = (dataType, value, state, action) => {
  let path = ['inventory', dataType, action.payload.msa, action.payload.measure]

  return (_.get(state, path) === value) ? state : _.set(_.clone(state), path, value)
}


const receiveData = (dataType, state, action) => {
  let updatedState = updateInventory(dataType, 'RECEIVED', state, action)

  return (state === updatedState) ? state : _.merge(updatedState, { data: { [dataType]: action.payload.data } })
}


const setMSA = (state, action) => setStateField(state, 'msa', action.payload.msa)

const setMeasure = (state, action) => setStateField(state, 'measure', action.payload.measure)

const setFocusedLineGraph = (state, action) => 
        setStateField(state, 'lineGraphs.focused', action.payload.focusedGraph)

const setOverviewTableSortField = (state, action) => 
        setStateField(state, 'overviewTable.sortField', action.payload.sortField)



export const ACTION_HANDLERS = {
  [QWI_MSA_CHANGE]: setMSA,

  [QWI_MEASURE_CHANGE]: setMeasure,

  [QWI_RATIOS_BY_FIRMAGE_DATA_REQUESTED]: updateInventory.bind(null, 'ratiosByFirmage', 'REQUESTED'),
  [QWI_RATIOS_BY_FIRMAGE_DATA_RECEIVED]: receiveData.bind(null, 'ratiosByFirmage'),

  [QWI_RAW_DATA_REQUESTED]: updateInventory.bind(null, 'raw', 'REQUESTED'),
  [QWI_RAW_DATA_RECEIVED]: receiveData.bind(null, 'raw'),

  [QWI_LINEGRAPH_FOCUS_CHANGE]: setFocusedLineGraph,

  [QWI_OVERVIEW_TABLE_SORT_FIELD_CHANGE]: setOverviewTableSortField,

  [QWI_LINEGRAPH_YEARQUARTER_CHANGE]: handleLineGraphYearQuarterChange,

  [QWI_RADAR_GRAPH_FIRMAGE_CHANGE]: handleRadarsChartFirmageChange,

  [QWI_ACTION_ERROR]: handleActionError,
}



export const metroQwiReducer = (state = initialState, action) => {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
