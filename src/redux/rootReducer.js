import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import counter from './modules/counter'
import geoData from './modules/geoData'
import metroZbpData from './modules/metroZbpData'
import metros from './modules/msaLookup'

export default combineReducers({
  metros,
  metroZbpData,
  geoData,
  counter,
  router
})
