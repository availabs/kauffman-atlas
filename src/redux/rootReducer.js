import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import counter from './modules/counter'
import geoData from './modules/geoData'
import metroZbpData from './modules/metroZbpData'
import metroGdpData from './modules/metroGdpData'
import metros from './modules/msaLookup'
import densityData from './modules/densityData'
import fluidityData from './modules/fluidityData'
import metroQcewData from './modules/metroQcewData'
import metroQwiData from './modules/metroQwiData'
import diversityData from './modules/diversityData'
import combinedData from './modules/combinedData'
import metroScoresData from './modules/metroScoresData'
import metroTime from './modules/metroTime'
import homeData from './modules/homeData'

export default combineReducers({
  homeData,
  metroTime,
  metroScoresData,
  combinedData,
  diversityData,
  fluidityData,
  densityData,
  metros,
  metroZbpData,
  metroQcewData,
  metroQwiData,
  metroGdpData,
  geoData,
  counter,
  router
})
