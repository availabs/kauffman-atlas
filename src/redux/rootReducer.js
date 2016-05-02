import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import counter from './modules/counter'
import geoData from './modules/geoData'
import metroZbpData from './modules/metroZbpData'
import metros from './modules/msaLookup'
import densityData from './modules/densityData'
import fluidityData from './modules/fluidityData'

export default combineReducers({
  fluidityData,
  densityData,
  metros,
  metroZbpData,
  geoData,
  counter,
  router
})
