import _ from 'lodash'

import { firmageLabels } from '../../../support/qwi'

import { 
  QWI_MSA_CHANGE,
  QWI_MEASURE_CHANGE,
  QWI_RATIOS_BY_FIRMAGE_DATA_REQUESTED,
  QWI_RATIOS_BY_FIRMAGE_DATA_RECEIVED,
  QWI_RAW_DATA_REQUESTED,
  QWI_RAW_DATA_RECEIVED,
  QWI_LINEGRAPH_FOCUS_CHANGE,
  QWI_LINEGRAPH_YEARQUARTER_CHANGE,
  QWI_YEARQUARTER_WHEEL_CHANGE,
  QWI_OVERVIEW_TABLE_SORT_FIELD_CHANGE,
  QWI_FIRMAGE_SELECTED,
  QWI_FIRMAGE_WHEEL_CHANGE,
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

  firmage: '1',

  overviewTable: {
    sortField: 'Location Quotient',
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
  return state
}


const handleLineGraphYearQuarterChange = (state, action) => {

  let yearQuarter = action.payload.yearQuarter

  if (!_.isEmpty(_.get(state, ['data', 'raw', state.msa, yearQuarter.year, yearQuarter.quarter]))) {
    return setStateField(state, 'lineGraphs.tooltip.yearQuarter', action.payload.yearQuarter)
  }

  return state
}

const handleYearQuarterWheelChange = (state, action) => {

  let msa = state.msa
  let measure = state.measure

  let rawData = _.get(state, ['data', 'raw', msa])

  let lastYearQuarterInData = (() => {
    let year = _.max(Object.keys(rawData).map(y => +y))
    let quarter = _.max(Object.keys(rawData[year]).map(q => +q))
   
    return { 
      year,
      quarter,
    }
  })()

  let oldYearQuarter = state.lineGraphs.tooltip.yearQuarter

  if (oldYearQuarter.year === null) {
    oldYearQuarter = lastYearQuarterInData
  }

  let delta = action.payload.delta

  if (delta < 0) {
    let firstYearQuarterInData = (() => {
      let year = _.min(Object.keys(rawData).map(y => +y))
      let quarter = _.min(Object.keys(rawData[year]).map(q => +q))
     
      return { 
        year,
        quarter,
      }
    })()

  
    if (_.isEqual(oldYearQuarter, firstYearQuarterInData)) {
      return state
    }

    let newYearQuarter = _.clone(oldYearQuarter)
    newYearQuarter.year = +newYearQuarter.year
    newYearQuarter.quarter = +newYearQuarter.quarter
    

    if (newYearQuarter.quarter > 1) {
      newYearQuarter.quarter -= 1
    }  else {
      newYearQuarter.quarter = 4
      newYearQuarter.year -= 1
    }
    
    return setStateField(state, 'lineGraphs.tooltip.yearQuarter', newYearQuarter)

  }

  if (delta > 0) {
  
    if (_.isEqual(oldYearQuarter, lastYearQuarterInData)) {
      return state
    }

    let newYearQuarter = _.clone(oldYearQuarter)
    newYearQuarter.year = +newYearQuarter.year
    newYearQuarter.quarter = +newYearQuarter.quarter

    if (newYearQuarter.quarter < 4) {
      newYearQuarter.quarter += 1
    }  else {
      newYearQuarter.quarter = 1
      newYearQuarter.year += 1
    }
    
    return setStateField(state, 'lineGraphs.tooltip.yearQuarter', newYearQuarter)

  }
}


const updateFirmage = (state, newFirmage) => {

  let newState = setStateField(state, 'firmage', newFirmage)

  let oldFirmage = state.firmage
  let oldFirmageLabel = firmageLabels[oldFirmage].trim()
  let newFirmageLabel = firmageLabels[newFirmage]

  if (state === newState) {
    return state
  }

  let oldOverviewTableSortField = state.overviewTable.sortField

  let newOverviewTableSortField = oldOverviewTableSortField.replace(oldFirmageLabel, newFirmageLabel)

  newState = setStateField(newState, 'overviewTable.sortField', newOverviewTableSortField)

  return newState
}

const handleFirmageChange = (state, action) => updateFirmage(state, action.payload.firmage)

const handleFirmageWheelChange = (state, action) => {
  let oldFirmage = parseInt(state.firmage)
  //let newFirmage = (((((oldFirmage - 1 + action.payload.delta)%5)+5)%5) + 1).toString()
  let newFirmage = (((((oldFirmage + action.payload.delta)%6)+6)%6)).toString()
  return updateFirmage(state, newFirmage)
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

  [QWI_YEARQUARTER_WHEEL_CHANGE]: handleYearQuarterWheelChange,

  [QWI_LINEGRAPH_YEARQUARTER_CHANGE]: handleLineGraphYearQuarterChange,

  [QWI_FIRMAGE_SELECTED]: handleFirmageChange,

  [QWI_FIRMAGE_WHEEL_CHANGE]: handleFirmageWheelChange,

  [QWI_ACTION_ERROR]: handleActionError,
}



export const metroQwiReducer = (state = initialState, action) => {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
