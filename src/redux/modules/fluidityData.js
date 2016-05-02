/* @flow */
import fetch from 'isomorphic-fetch'
import colorbrewer from 'colorbrewer'
import d3 from 'd3'
// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_IRS_DATA = 'RECEIVE_IRS_DATA'
export const RECEIVE_ACS_DATA = 'RECEIVE_ACS_DATA'
export const RECEIVE_INC5000_DATA = 'RECEIVE_INC5000_DATA'
export const RECEIVE_COMPOSITE_DATA = 'RECEIVE_COMPOSITE_DATA'
export const RECEIVE_NETMIGRATIONIRS_DATA = 'RECEIVE_NETMIGRATIONIRS_DATA'
export const RECEIVE_NETMIGRATIONACS_DATA = 'RECEIVE_NETMIGRATIONACS_DATA'
export const RECEIVE_TOTALMIGRATION_DATA = 'RECEIVE_TOTALMIGRATION_DATA'
export const RECEIVE_INFLOWMIGRATION_DATA = 'RECEIVE_INFLOWMIGRATION_DATA'
export const RECEIVE_OUTFLOWMIGRATION_DATA = 'RECEIVE_OUTFLOWMIGRATION_DATA'

export const loadIrsData = () => {
  return (dispatch) => {
    return fetch('/data/irsMigration.json')
      .then(response => response.json())
      .then(json => dispatch(receiveIrsData(json)))
  }
}
export function receiveIrsData (value) {
  return {
    type: RECEIVE_IRS_DATA,
    payload: value
  }
}

export const loadAcsData = () => {
  return (dispatch) => {
    return fetch('/data/acsMigration.json')
      .then(response => response.json())
      .then(json => dispatch(receiveAcsData(json)))
  }
}
export function receiveAcsData (value) {
  return {
    type: RECEIVE_ACS_DATA,
    payload: value
  }
}

export const loadInc5000Data = () => {
  return (dispatch) => {
    return fetch('/data/inc5000.json')
      .then(response => response.json())
      .then(json => dispatch(receiveInc5000Data(json)))
  }
}
export function receiveInc5000Data (value) {
  return {
    type: RECEIVE_INC5000_DATA,
    payload: value
  }
}

export const loadComposite = () => {
  return (dispatch) => {dispatch(getComposite())}
}
export function getComposite () {
  return {
    type: RECEIVE_COMPOSITE_DATA,
    payload: null
  }
}

export const loadNetMigrationIrs = () => {
  return (dispatch) => {dispatch(getNetMigrationIrs())}
}
export function getNetMigrationIrs () {
  return {
    type: RECEIVE_NETMIGRATIONIRS_DATA,
    payload: null
  }
}

export const loadNetMigrationAcs = () => {
  return (dispatch) => {dispatch(getNetMigrationAcs())}
}
export function getNetMigrationAcs () {
  return {
    type: RECEIVE_NETMIGRATIONACS_DATA,
    payload: null
  }
}

export const loadTotalMigration = () => {
  return (dispatch) => {dispatch(getTotalMigration())}
}
export function getTotalMigration () {
  return {
    type: RECEIVE_TOTALMIGRATION_DATA,
    payload: null
  }
}

export const loadInflowMigration = () => {
  return (dispatch) => {dispatch(getInflowMigration())}
}
export function getInflowMigration () {
  return {
    type: RECEIVE_INFLOWMIGRATION_DATA,
    payload: null
  }
}

export const loadOutflowMigration = () => {
  return (dispatch) => {dispatch(getOutflowMigration())}
}
export function getOutflowMigration () {
  return {
    type: RECEIVE_OUTFLOWMIGRATION_DATA,
    payload: null
  }
}

export const actions = {
  loadIrsData,
  receiveIrsData,
  loadAcsData,
  receiveAcsData,
  loadInc5000Data,
  receiveInc5000Data,
  loadComposite,
  getComposite,
  loadNetMigrationIrs,
  getNetMigrationIrs,
  loadNetMigrationAcs,
  getNetMigrationAcs,
  loadTotalMigration,
  getTotalMigration,
  loadInflowMigration,
  getInflowMigration,
  loadOutflowMigration,
  getOutflowMigration
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  // [RECEIVE_FLUIDITY_DATA]: (state,action) => {
  //   var newState = Object.assign({},state);


  //   newState.newValuesData = _processData({data:action.payload,selectedMetric:"newValues"})
  //   newState.shareData = _processData({data:action.payload,selectedMetric:"share"})
  //   newState.compositeData = _processComposite(newState.newValuesData['relative'],newState.shareData['relative']);
  //   newState.loaded = true;

  //   //console.log(newState)

  //   return newState;
  // },
  [RECEIVE_IRS_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    return newState;
  },
  [RECEIVE_ACS_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    return newState;
  },
  [RECEIVE_INC5000_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    return newState;
  },
  [RECEIVE_COMPOSITE_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    return newState;
  },
  [RECEIVE_NETMIGRATIONIRS_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    return newState;
  },
  [RECEIVE_NETMIGRATIONACS_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    return newState;
  },
  [RECEIVE_TOTALMIGRATION_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    return newState;
  },
  [RECEIVE_INFLOWMIGRATION_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    return newState;
  },
  [RECEIVE_OUTFLOWMIGRATION_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    return newState;
  }
}
  const rankCities =  (cities) =>{
      var scope=this,
          years = d3.range(
              [d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.x }); })],
              [d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.x }); })+1]
          );

      years.forEach(function(year){
          var rank = 1;
          //Sort cities according to each year
          cities.sort(sortCities(year));

          //Go through and assign ranks for current year
          cities.forEach(function(city){
              city.values.forEach(function(yearValues){
                  if(yearValues.x == year){
                      yearValues.rank = rank;
                  }
              })
              rank++;
          })
      })          
      return cities;   
  }
  const polishData =  (data,dataset) =>{
    var scope = this;
    var newData = [];

    Object.keys(data).forEach(function(metroArea){
      var name = "undefined";
      if(msaLookup[data[metroArea].key]){
        name = msaLookup[data[metroArea].key]
      }
      if(data[metroArea].length != 0){
          var city = {
            values:null,
            name: name,
            key:data[metroArea].key,
            color:colorFunction(data[metroArea],dataset)
          }

          city.values = data[metroArea].values.map(function(i){
              return {
                  city:city,
                  x:i.x,
                  y:i.y,
                  rank:i.rank,
                  raw:i.raw,
                  color:colorFunction(i,dataset)
              }
          })   
            newData.push(city);           
      }
    });
    return newData;
  }
  const colorFunction = (params,dataset) =>{
      var scope = this,
          cityColor;

      if(params){
          if(dataset == "opportunity" && params.x){
              var color = colorOppGroup(params.x);    
              cityColor = color(params.y);                             
          }
          else if(params.values){
              var valueLength = params.values.length;
              var curRank = params.values[valueLength-1].rank
              var color = colorGroup();
              cityColor = color(curRank);   
          }
      }  

      return cityColor;
  }
  const colorGroup =  () =>{
      var scope = this;

      var colorGroup = d3.scale.linear()
          .domain(d3.range(1,366,(366/9)))
          .range(colorbrewer.Spectral[9]);
      
      return colorGroup;
  }

  const sortCities =  (year) =>{
      var scope = this;
      return function(a,b){
    var aValue,
          bValue;

        a.values.forEach(function(yearValues){
          if(yearValues.x == year){
            aValue = yearValues.y;
          }
        })            
    
        b.values.forEach(function(yearValues){
          if(yearValues.x == year){
            bValue = yearValues.y;
          }
        })       

        if(aValue > bValue){
          return -1;
        }
        if(bValue > aValue){
          return 1;
        }           
                  
        return 0;     
    }
  }







// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  irsLoaded:false,
  acsLoaded:false,
  inc5000Loaded:false
};

export default function fluidityReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
