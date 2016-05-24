/* @flow */
import fetch from 'isomorphic-fetch'
import {qcewApi} from '../../AppConfig'
import d3 from 'd3'
// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_METROQCEW_DATA = 'RECEIVE_METROQCEW_DATA'
export const RECEIVE_METROQCEW_DATA_WITH_YEAR = 'RECEIVE_METROQCEW_DATA_WITH_YEAR'
export const QCEW_NULL_ACTION = 'QCEW_NULL_ACTION'
export const SET_QCEW_YEAR_DATA = 'SET_QCEW_YEAR_DATA'
export const SET_QCEW_COMP_QTR_DATA = 'SET_QCEW_COMP_QTR_DATA'
const industries = [
		'11', '21', '22', '23', '31-33',
		'42', '44-45', '48-49', '51', '52',
		'53', '54', '55', '56', '61', '62', '71',
		'72', '81', '92'
]
let msayears ={}
let years = [
    '2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011',
    '2012','2013','2014'
	    ]


let fields = [
    'area_fips','qtr','industry_codes','year','qtrly_estabs_count',
    'lq_qtrly_estabs_count','month1_emplvl','month2_emplvl',
    'month3_emplvl','lq_month1_emplvl','lq_month2_emplvl',
    'lq_month3_emplvl'
	     ]

let zeropad = (code) => {
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
    msayears[msaId] = msayears[msaId] || {}
    msayears[msaId].history = msayears[msaId].history || {}
    
    ncodes = ncodes.filter( code => {
	let exists = !msayears[msaId] ||
	    !msayears[msaId].history[code]
	msayears[msaId].history[code] = true
	return exists
    })
    if(ncodes.length === 0)
	return (dispatch) => dispatch(nullAction())
    return (dispatch) => {
	let url = qcewApi
	url += 'data/fips' + 'C' + msaId.slice(0, 4)
	url += '/ind' + indcodes + '/yr' + years.join('') +'?'+fieldString
	url += '&flat=true'
	
	console.log(url)
	
	return fetch(url)  
            .then(response => {
		console.log(response);
		let isOk = response.ok
		ncodes.forEach( code =>{
		    msayears[msaId].history[code] = (isOk)? true:null
		})
		return response.json()
	    })
            .then(json =>{

		if(!event)
		    dispatch(receiveData(json, msaId))
		else
		    dispatch(event(json))
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
    if(ncodes.length >0)
	return loadMetroData(msaId,codes,receiveDataWithYear.bind(null,msaId,year))
    
    
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
    else
	newState.data = data
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
	let newState = Object.assign({},state)
	let data = action.payload
	newState.qtrData = data
	return newState
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
