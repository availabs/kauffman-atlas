import { qwiAPIServer as apiConfig } from '../../../AppConfig'
import { msaToFips } from '../../../support/qwi'

const apiServerAddress = `${apiConfig.hostname}${(apiConfig.port) ? (':' + apiConfig.port) : ''}`


export const QWI_DATA_REQUESTED = 'QWI_DATA_REQUESTED'
export const QWI_DATA_RECEIVED  = 'QWI_DATA_RECEIVED'
export const QWI_MSA_CHANGE     = 'QWI_MSA_CHANGE'
export const QWI_MEASURE_CHANGE = 'QWI_MEASURE_CHANGE'
export const QWI_QUARTER_CHANGE = 'QWI_QUARTER_CHANGE'
export const QWI_ACTION_ERROR   = 'QWI_ACTION_ERROR'




// For internal use.
const qwiActionError = (err) => ({
  type    : QWI_ACTION_ERROR,
  payload : { err, }
})


const dataRequested = (msa, measure) => ({
  type : QWI_DATA_REQUESTED,
  payload : { 
    inventory: { [msa]: { [measure]: 'REQUESTED' } },
  },
})

// For internal use.
const dataReceived = (msa, measure, data) => ({
  type    : QWI_DATA_RECEIVED,
  payload : { 
    inventory: { [msa]: { [measure]: 'RECEIVED' } },
    data, 
  },
})


export const quarterChange = dateObj => ({
  type : QWI_QUARTER_CHANGE,
  payload : { 
    quarter: getQuarterObjFromDateObj(dateObj), 
  },
})


export const msaChange = msa => ({
  type : QWI_MSA_CHANGE,
  payload : { msa, }
})

export const measureChange = measure => ({
  type : QWI_MEASURE_CHANGE,
  payload : { measure, }
})



export const loadData = (msa, measure) => (dispatch, getState) => {

  let state = getState().metroQwiData

  if (state.msa !== msa) {
    dispatch(msaChange(msa))
  }

  if (state.measure !== measure) {
    dispatch(measureChange(measure))
  }

  if (_.has(state.inventory, [msa, measure])) { return }

  dispatch(dataRequested(msa, measure))

  fetch(buildURL(msa, measure))
    .then(handleFetchErrors)
    .then(response => response.json())
    .then(transformJSON)
    .then(data => dispatch(dataReceived(msa, measure, data)))
    .catch(err => dispatch(qwiActionError(err)))
}




// Helper functions-----------------------------------------------------
function getQuarterObjFromDateObj (dateObj) {
  
  let splitDate = d3.time.format("%m-%Y")(dateObj).split('-')

  return {
    qrt : Math.floor(+splitDate[0]/3).toString(),
    yr  : splitDate[1],
  }
}


function buildURL (msa, measure) {
  return `http://${apiServerAddress}/data/firmage1/geography${msaToFips[msa]}${msa}/year20012016/quarter/industry` + 
            `?fields=${measure}&dense=true&flatLeaves=true`
}

function transformJSON (json) { 
  let data =  _.mapKeys(json.data['1'], (v,k) => k.substring(2))
  console.log(data)
  return data
}

function handleFetchErrors (response) {
  if (response.ok) { return response }

  throw new Error(`Fetch response statusText:\n${response.statusText}`)
}
