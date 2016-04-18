import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import counter from './modules/counter'
import geoData from './modules/geoData'
import metros from './modules/msaLookup'

export default combineReducers({
  metros,
  geoData,
  counter,
  router
})
