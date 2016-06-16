/* @flow */
import fetch from 'isomorphic-fetch'
import {qcewApi} from '../../AppConfig'
import d3 from 'd3'
import _ from 'lodash'


// ------------------------------------
// Constants
// ------------------------------------
export const MSA_CHANGE                       = 'MSA_CHANGE'
export const RECEIVE_METROQCEW_DATA           = 'RECEIVE_METROQCEW_DATA'
export const RECEIVE_METROQCEW_DATA_WITH_YEAR = 'RECEIVE_METROQCEW_DATA_WITH_YEAR'
export const QCEW_NULL_ACTION                 = 'QCEW_NULL_ACTION'
export const SET_QCEW_YEAR_DATA               = 'SET_QCEW_YEAR_DATA'
export const SET_QCEW_COMP_QTR_DATA           = 'SET_QCEW_COMP_QTR_DATA'
export const QCEW_QUARTER_SELECTED            = 'QCEW_QUARTER_SELECTED'
export const QCEW_YEARQUARTER_WHEEL_CHANGE    = 'QCEW_YEARQUARTER_WHEEL_CHANGE'


const industries = [
    '11', '21', '22', '23', '31-33',
    '42', '44-45', '48-49', '51', '52',
    '53', '54', '55', '56', '61', '62', '71',
    '72', '81', '92'
  ]

const msayears = {}
const years = [
    '2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011',
    '2012','2013','2014'
  ]

const fields = [
    'area_fips','qtr','all'
  ]

const zeropad = (code) => {
  let need = 6 - code.length
  while(need > 0){
    code = '0'+ code
    need -= 1
  }
  return code
}

let defIndCodes = industries.map(zeropad);
let fieldString = fields.map(x => 'fields[]='+x).join('&')
// ------------------------------------
// Actions
// ------------------------------------
export const msaChange = (msa) => ({
  type    : MSA_CHANGE,
  payload : msa,
})

export function receiveData (value, msaId) {
  return {
    type: RECEIVE_METROQCEW_DATA,
    payload: [value, msaId]
  }
}

export function receiveDataWithYear (msaId, year, value) {
  return {
    type: RECEIVE_METROQCEW_DATA_WITH_YEAR,
    payload: [value, msaId, year],
  }
}

export function setCurrentMetroYear (msaId,year) {
    return {
  type: SET_QCEW_YEAR_DATA,
  payload: [null,msaId, year],
    }
}

export function setCurrentMetroQuarter(tableData){
    return {
  type: SET_QCEW_COMP_QTR_DATA,
  payload: tableData
    }
}

export function quarterSelected (dateString) {
    return {
  type: QCEW_QUARTER_SELECTED,
  payload: dateString,
    }
}

export const yearQuarterWheelChange = (delta) => ({
  type    : QCEW_YEARQUARTER_WHEEL_CHANGE,
  payload : delta,
})

export function nullAction() {
    return {
  type: QCEW_NULL_ACTION,
    }
}

export const setMetroQuarter = (td) => {
    return (dispatch) => dispatch(setCurrentMetroQuarter(td))
}

export const loadMetroData = (msaId,codes,event) => {

  let ncodes = codes || defIndCodes
  ncodes = ncodes.map(zeropad)

  let indcodes = ncodes.join('');

  msayears[msaId]         = msayears[msaId] || {}
  msayears[msaId].history = msayears[msaId].history || {}
  
  ncodes = ncodes.filter( code => {
    let exists = !msayears[msaId] || !msayears[msaId].history[code]

    msayears[msaId].history[code] = true

    return exists
  })

  if(ncodes.length === 0){
    return (dispatch) => dispatch(nullAction())
  }
  return (dispatch) => {
    let url = qcewApi + 'data/'
    let body = {query:''}
    body.query += 'fips' + 'C' + msaId.slice(0, 4)
    body.query += '/ind' + indcodes + '/yr' + years.join('')
    body.fields = fields 
    body.flat = '&flat=true'
    
    //console.log(url,body)
    
    return fetch(url,{
        method:'POST',
        headers:{
          'Accept':'application/json',
          'Content-Type': 'application/json'
        },
        body:JSON.stringify(body)
    }).then(response => {
      //console.log(response);
      let isOk = response.ok
      ncodes.forEach( code => {
        msayears[msaId].history[code] = (isOk)? true:null
      })
      return response.json()
    }).then(json =>{
      if(!event){
        dispatch(receiveData(json, msaId))
      }
      else{
        dispatch(event(json))
      }
    })
  }
}

export const loadMetroDataYear = (msaId, year, codes) => {
  let ncodes = codes || defIndCodes
  ncodes = ncodes.map(zeropad)
  msayears[msaId] = msayears[msaId] || {}
  msayears[msaId].history = msayears[msaId].history || {}
  
  ncodes = ncodes.filter( code => {
    let exists = !msayears[msaId] ||
      !msayears[msaId].history[code]
    return exists
  })

  if(ncodes.length >0){
    return loadMetroData(msaId,codes,receiveDataWithYear.bind(null,msaId,year))
  }
  return (dispatch) => dispatch(setCurrentMetroYear(msaId,year))  
}

let datamaper = (schema,x) => {
  let t = {}
  schema.forEach((sch,i) => {
    t[sch] = x[i]
  })
  return t
}

let addQcewRows = (state,action) => {
  var newState = Object.assign({}, state)
  let msa = action.payload[1]
  let data = action.payload[0].rows
  let schema = action.payload[0].schema
  data = data.map(datamaper.bind(null,schema))
  if(newState.data && newState.data.length){
    newState.data = newState.data.concat(data)
  }
  else{
    newState.data = data
  }
  return newState
}

let setYearData = (state,action) => {
  let year = action.payload[2]
  let msa = action.payload[1]
  let shell ={}
  shell[msa] = null
  state.yeardata = Object.assign({},shell) || {}
  state.yeardata[msa] = d3.nest()
    .key( x=> x.year )
    .rollup( value => value )
    .map( state.data || [] )
  return state
}

const ACTION_HANDLERS = {
  
  [MSA_CHANGE]: (state, action) => {
    if (action.payload === state.msa) { return state }

    console.log(Object.assign({}, state, { msa: action.payload }))
    return Object.assign({}, state, { msa: action.payload })
  },

  [RECEIVE_METROQCEW_DATA]: (state, action) => {
    return addQcewRows(state,action)
  },
  
  [RECEIVE_METROQCEW_DATA_WITH_YEAR]: (state, action) => {
    let newState = addQcewRows(state, action)
    return setYearData(newState,action)
  },
  
  [SET_QCEW_YEAR_DATA]: (state, action) => {
    return setYearData(state,action)
  },
  
  [QCEW_NULL_ACTION]: (state, action) => {
    return state
  },
  
  [SET_QCEW_COMP_QTR_DATA]: (state, action) => {
    let newState = Object.assign({}, state)
    let data = action.payload

    newState.qtrData = data
    return newState
  },

  [QCEW_QUARTER_SELECTED]: (state, action) => {
    let newState = Object.assign({}, state)
    let qrtDateObj = new Date(action.payload)

    newState.selectedQuarter = {
      year    : qrtDateObj.getFullYear().toString(),
      quarter : Math.ceil((qrtDateObj.getMonth() + 1) / 3).toString(),
    }

    return newState
  },

  [QCEW_YEARQUARTER_WHEEL_CHANGE]: handleYearQuarterWheelChange,
}


function handleYearQuarterWheelChange (state, action) {

  let msa = state.msa

  let yeardata = _.get(state, ['yeardata', msa])

  let lastYearQuarterInData = (() => {
    let year    = _.max(Object.keys(yeardata).map(y => +y))
    let quarter = _.max(_.values(yeardata[year]).map(r => +r.qtr))
   
    return { year, quarter, }
  })()

  let oldYearQuarter = state.selectedQuarter

  if (!oldYearQuarter && oldYearQuarter.quarter) {
    oldYearQuarter = lastYearQuarterInData
  }

  oldYearQuarter.year = +oldYearQuarter.year
  oldYearQuarter.quarter = +oldYearQuarter.quarter

  let delta = action.payload

  if (delta < 0) {

    let firstYearQuarterInData = (() => {
      let year    = _.min(Object.keys(yeardata).map(y    => +y))
      let quarter = _.min(_.values(yeardata[year]).map(r => +r.qtr))
     
      return { year, quarter, }
    })()

  
    if (_.isEqual(oldYearQuarter, firstYearQuarterInData)) {
      return state
    }

    let newYearQuarter = _.clone(oldYearQuarter)

    if (newYearQuarter.quarter > 1) {
      newYearQuarter.quarter -= 1
    }  else {
      newYearQuarter.quarter = 4
      newYearQuarter.year -= 1
    }

    return Object.assign({}, state, { selectedQuarter: _.mapValues(newYearQuarter, _.toString) })
  }

  if (delta > 0) {
  
    if (_.isEqual(oldYearQuarter, lastYearQuarterInData)) {
      return state
    }

    let newYearQuarter = _.clone(oldYearQuarter)

    if (newYearQuarter.quarter < 4) {
      newYearQuarter.quarter += 1
    }  else {
      newYearQuarter.quarter = 1
      newYearQuarter.year += 1
    }

    return Object.assign({}, state, { selectedQuarter: _.mapValues(newYearQuarter, _.toString) })
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
