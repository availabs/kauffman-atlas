/* @flow */
import fetch from 'isomorphic-fetch'
import { msaLookup, populationData } from 'static/data/msaDetails'
import colorbrewer from 'colorbrewer'
import d3 from 'd3'
// ------------------------------------
// Constants
// ------------------------------------
export const RECIEVE_FLUIDITY_DATA = 'RECIEVE_FLUIDITY_DATA'

// ------------------------------------
// Actions
// ------------------------------------
// NOTE: "Action" is a Flow interface defined in https://github.com/TechnologyAdvice/flow-interfaces
// If you're unfamiliar with Flow, you are completely welcome to avoid annotating your code, but
// if you'd like to learn more you can check out: flowtype.org.
// DOUBLE NOTE: there is currently a bug with babel-eslint where a `space-infix-ops` error is
// incorrectly thrown when using arrow functions, hence the oddity.
export function recieveData (value) {
  return {
    type: RECIEVE_FLUIDITY_DATA,
    payload: value
  }
}

// This is a thunk, meaning it is a function that immediately
// returns a function for lazy evaluation. It is incredibly useful for
// creating async actions, especially when combined with redux-thunk!
// NOTE: This is solely for demonstration purposes. In a real application,
// you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
// reducer take care of this logic.
export const loadFluidityData = () => {
  return (dispatch) => {
    return fetch('/data/density_data.json')
      .then(response => response.json())
      .then(json => dispatch(recieveData(json)))
  }
}

export const actions = {
  recieveData,
  loadFluidityData
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECIEVE_FLUIDITY_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.newValuesData = _processData({data:action.payload,selectedMetric:"newValues"})
    newState.shareData = _processData({data:action.payload,selectedMetric:"share"})
    newState.compositeData = _processComposite(newState.newValuesData['relative'],newState.shareData['relative']);
    newState.loaded = true;

    //console.log(newState)

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
  loaded:false
};

export default function fluidityReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
