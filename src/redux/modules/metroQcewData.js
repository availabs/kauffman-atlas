/* @flow */
import fetch from 'isomorphic-fetch'
import {qcewApi} from '../../AppConfig'
import NaicsTree from '../../support/NaicsTree'
import d3 from 'd3'
import _ from 'lodash'


// ------------------------------------
// Constants
// ------------------------------------
export const MSA_CHANGE                       = 'MSA_CHANGE'
export const RECEIVE_METROQCEW_DATA           = 'RECEIVE_METROQCEW_DATA'
export const RECEIVE_METROQCEW_DATA_WITH_YEAR = 'RECEIVE_METROQCEW_DATA_WITH_YEAR'
export const QCEW_NULL_ACTION                 = 'QCEW_NULL_ACTION'
export const QCEW_QUARTER_SELECTED            = 'QCEW_QUARTER_SELECTED'
export const QCEW_YEARQUARTER_WHEEL_CHANGE    = 'QCEW_YEARQUARTER_WHEEL_CHANGE'


const industries = [
    '11', '21', '22', '23', '31-33',
    '42', '44-45', '48-49', '51', '52',
    '53', '54', '55', '56', '61', '62', '71',
    '72', '81', '92'
  ]

const msayears = {}

const years = _.map(_.range(2001, 2015), _.toString)

const fields = [
  'area_fips',
  'qtr',
  'all',
]

let startEconQuarter = {
  year: 2001,
  quarter: 1,
}

let endEconQuarter = {
  year: 2014,
  quarter: 4,
}

const measures = [
  'month1_emplvl',
  'month2_emplvl',
  'month3_emplvl',
  'lq_month1_emplvl',
  'lq_month2_emplvl',
  'lq_month3_emplvl',

  'avg_wkly_wage',
  'lq_avg_wkly_wage',

  'qtrly_estabs_count',
  'lq_qtrly_estabs_count',

  'total_qtrly_wages',
  'lq_total_qtrly_wages',
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
let fieldString = fields.map(x => `fields[]=${x}`).join('&')

const byMSANaicsTrees = {}

// ------------------------------------
// Actions
// ------------------------------------
export const msaChange = (msa) => ({
  type    : MSA_CHANGE,
  payload : { msa, },
})

export const receiveData = (data, msa) => ({
  type    : RECEIVE_METROQCEW_DATA,
  payload : { data, msa, },
})

export const quarterSelected = (dateString) => ({
  type    : QCEW_QUARTER_SELECTED,
  payload : { dateString, },
})

export const econQuarterWheelChange = (delta) => ({
  type    : QCEW_YEARQUARTER_WHEEL_CHANGE,
  payload : { delta, },
})

export const nullAction = () => ({ type: QCEW_NULL_ACTION, })



export const loadMetroData = (msa, codes) => {

  let ncodes = (codes || defIndCodes).map(zeropad)

  let indcodes = ncodes.join('');

  msayears[msa] = msayears[msa] || {}
  msayears[msa].history = msayears[msa].history || {}
  
  // Determine which codes to request
  ncodes = ncodes.filter( code => {
    let exists = msayears[msa].history[code]

    msayears[msa].history[code] = true

    return !exists
  })

  if(ncodes.length === 0){
    return (dispatch) => dispatch(nullAction())
  }

  return (dispatch) => {

    let url = `${qcewApi}data/`

    let body = {
      query  : `fipsC${msa.slice(0, 4)}/ind${indcodes}/yr${years.join('')}`,
      fields : fields,
      flat   : '&flat=true',
    }

    let postObj = { 
      method : 'POST',
      headers : {
        'Accept'       : 'application/json',
        'Content-Type' : 'application/json'
      },
      body : JSON.stringify(body), 
    }

    let respHandler = (response) => {
      let isOk = response.ok

      ncodes.forEach( code => {
        // Update the history to account for errors.
        msayears[msa].history[code] = (isOk)? true : null
      })

      return response.json()
    }


    let url2 = `${qcewApi}data/fipsC${msa.slice(0, 4)}/ind${indcodes}/yr${years.join('')}/qtr1234/` +
               `?${measures.map((m) => `fields[]=${m}`).join('&')}`
               
    fetch(url2).then(r => r.json()).then((respData) => {
      if (!byMSANaicsTrees[msa]) {
        byMSANaicsTrees[msa] = new NaicsTree(startEconQuarter, endEconQuarter)
      }

      let data = restructureResponse(respData[0].values)

console.log(data)

      let transformers = {

        emplvl: {
          input: [
            'month1_emplvl',
            'month2_emplvl',
            'month3_emplvl',
          ],

          f : (emps) => _(emps).filter(Number.isFinite).mean(),
        },

        lq_emplvl: {
          input: [
            'lq_month1_emplvl',
            'lq_month2_emplvl',
            'lq_month3_emplvl',
          ],

          f : (lq_emps) => _(lq_emps).filter(Number.isFinite).mean(),
        },

        avg_wkly_wage    : null,
        lq_avg_wkly_wage : null,

        qtrly_estabs_count    : null,
        lq_qtrly_estabs_count : null,

        total_qtrly_wages    : null,
        lq_total_qtrly_wages : null,
      }

      byMSANaicsTrees[msa].insertData(data, transformers)
    }).then(() => console.log(byMSANaicsTrees[msa].root))

    return fetch(url, postObj).then(respHandler)
                              .then((data) => dispatch(receiveData(data, msa)))
  }
}


let datamaper = (schema,x) => {
  let t = {}
  schema.forEach((sch,i) => {
    t[sch] = x[i]
  })
  return t
}

let addQcewRows = (state, action) => {

  let newState = Object.assign({}, state)
   
  let msa    = action.payload.msa
  let rows   = action.payload.data.rows
  let schema = action.payload.data.schema

  let data = rows.map(datamaper.bind(null, schema))

  newState.data = (newState.data && newState.data.length) ? newState.data.concat(data) : data

  let nestedData = d3.nest()
                     .key(x => x.year)
                     .rollup(value => value)
                     .map(data)

  newState.yeardata = state.yeardata || {}
  let yearlyDataForMSA = newState.yeardata[msa] || (newState.yeardata[msa] = {})

  _.forEach(nestedData, (dataForYear, year) => {
    yearlyDataForMSA[year] = (yearlyDataForMSA[year] || (yearlyDataForMSA[year] = [])).concat(dataForYear)
  })
  
  return newState
}



const ACTION_HANDLERS = {
  
  [MSA_CHANGE]: (state, action) => {
    return (action.payload.msa === state.msa) ? state : Object.assign({}, state, { msa: action.payload.msa })
  },

  [RECEIVE_METROQCEW_DATA]: addQcewRows,

  [QCEW_NULL_ACTION]: (state) => state,

  [QCEW_QUARTER_SELECTED]: (state, action) => {
    let newState = Object.assign({}, state)
    let qrtDateObj = new Date(action.payload.dateString)

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

  let delta = action.payload.delta

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

function restructureResponse (values) {

  return values.reduce((acc, val) => {
    if (val.key && val.values) {
      acc[val.key] = restructureResponse(val.values)
      return acc
    }

    return val
  }, {})
}



// ------------------------------
// Reducer
// ------------------------------
const initialState = {
  selectedQuarter : {
    year : '2010',
    quarter : '1',
  } 
}

export default function metroQcewReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
