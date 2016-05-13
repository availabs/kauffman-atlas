/* @flow */
import fetch from 'isomorphic-fetch'
import colorbrewer from 'colorbrewer'
import d3 from 'd3'
import { loadDensityData,loadDensityComposite } from 'redux/modules/densityData'
import { loadFluidityData,loadFluidityComposite } from 'redux/modules/fluidityData'
import { loadDiversityData,loadDiversityComposite } from 'redux/modules/diversityData'
import { msaLookup, populationData } from 'static/data/msaDetails'
// ------------------------------------
// Constants
// ------------------------------------

export const RECEIVE_COMBINEDCOMPOSITE_DATA = 'RECEIVE_COMBINEDCOMPOSITE_DATA'

export const loadCombinedComposite = () => {
  return (dispatch,getState) => {
    console.log("should have all data here combo comp",getState())
    var state = getState()
    return dispatch(getCombinedComposite(state.densityData.compositeData,state.fluidityData.compositeData,state.diversityData.diversitycomposite))     
  }
}

export function getCombinedComposite (density,fluidity,diversity) {
  return {
    type: RECEIVE_COMBINEDCOMPOSITE_DATA,
    payload: {density:density,fluidity:fluidity,diversity:diversity}
  }
}


export const actions = {
  loadCombinedComposite,
  getCombinedComposite
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECEIVE_COMBINEDCOMPOSITE_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    console.log("receive combined composite data",action.payload);

    var density = action.payload.density,
        fluidity = action.payload.fluidity,
        diversity = action.payload.diversity;



    var cityFilteredDensity = [],
        cityFilteredDiversity = [],
        cityFilteredFluidity = [];

    var compositeCityRanks = [];

    for(var i=0; i<diversity.length; i++){
      for(var j=0; j<density.length; j++){
        for(var k=0; k<fluidity.length; k++){
          if(diversity[i].key == density[j].key && diversity[i].key == fluidity[k].key){
            cityFilteredDiversity.push(diversity[i]); 
            cityFilteredFluidity.push(fluidity[k]);
            cityFilteredDensity.push(density[j])
          }              
        }
      }
    }


  var yearCityFilteredDiversity = _trimYears(([2009,2009]),cityFilteredDiversity);
  var yearCityFilteredFluidity = _trimYears(([2009,2009]),cityFilteredFluidity);
  var yearCityFilteredDensity = _trimYears(([2009,2009]),cityFilteredDensity);

    var densityScale = d3.scale.linear()
      .range([0,100])
      .domain(      [d3.min(yearCityFilteredDensity, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                    d3.max(yearCityFilteredDensity, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                    )
    var diversityScale = d3.scale.linear()
      .range([0,100])
      .domain(      [d3.min(yearCityFilteredDiversity, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                    d3.max(yearCityFilteredDiversity, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                    )  
    var fluidityScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(yearCityFilteredFluidity, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                  d3.max(yearCityFilteredFluidity, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                  )  

    yearCityFilteredDensity.sort(_sortMsaCities());
    yearCityFilteredDiversity.sort(_sortMsaCities());
    yearCityFilteredFluidity.sort(_sortMsaCities());

    for(var i=0; i<yearCityFilteredDensity.length;i++){
      var resultValues = [];
      if(yearCityFilteredDensity[i].key == yearCityFilteredDiversity[i].key && yearCityFilteredFluidity[i].key){
        for(var j=0; j<yearCityFilteredDensity[i]['values'].length; j++){
          resultValues.push({x:yearCityFilteredDensity[i].values[j].x,y:((densityScale(yearCityFilteredDensity[i].values[j].y) + fluidityScale(yearCityFilteredFluidity[i].values[j].y)+ diversityScale(yearCityFilteredDiversity[i].values[j].y))/3)})      
        } 
        compositeCityRanks.push({key:yearCityFilteredDensity[i]['key'],values:resultValues})          
      }
    }

    compositeCityRanks = _rankCities(compositeCityRanks);
    var graphData = _polishData(compositeCityRanks,"fluidityComposite");

    newState.combinedcomposite = graphData

    return newState;
  }
}


const _trimYears = (years,cities) => {

  var filteredCities = cities.map(city => {
    var newValues = []

    city.values.forEach(yearValue => {
      if(yearValue.x >= years[0] && yearValue.x <= years[1]){
        newValues.push(yearValue);
      }
    })
    var newCity = {
      color:city.color,
      key:city.key,
      name:city.name,
      values:newValues
    }
    return newCity;
  })


  return filteredCities;
}

const _rankCities = (cities) => {
      var years = d3.range(
            [d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.x }); })],
            [d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.x }); })+1]
        );

    years.forEach(year => {
        var rank = 1;
        //Sort cities according to each year
        cities.sort(_sortCities(year));

        //Go through and assign ranks for current year
        cities.forEach(city => {
            city.values.forEach(yearValues => {
                if(yearValues.x == year){
                    yearValues.rank = rank;
                }
            })
            rank++;
        })
    })          
    return cities;   
}
const _polishData = (data,dataset) => {
  var newData = [];

  Object.keys(data).forEach(metroArea => {
    var name = "undefined";
    if(msaLookup[data[metroArea].key]){
      name = msaLookup[data[metroArea].key]
    }
    if(data[metroArea].length != 0){
        var city = {
          values:null,
          name: name,
          key:data[metroArea].key,
          color:_colorFunction(data[metroArea],dataset)
        }

        city.values = data[metroArea].values.map(i => {
            return {
                city:city,
                x:i.x,
                y:i.y,
                rank:i.rank,
                raw:i.raw,
                color:_colorFunction(i,dataset)
            }
        })   
          newData.push(city);           
    }
  });
  return newData;
}


const _colorFunction = (params,dataset) => {
    var cityColor;

    if(params){
        if(dataset == "opportunity" && params.x){
            var color = _colorOppGroup(params.x);    
            cityColor = color(params.y);                             
        }
        else if(params.values){
            var valueLength = params.values.length;
            var curRank = params.values[valueLength-1].rank
            var color = _colorGroup();
            cityColor = color(curRank);   
        }
    }  

    return cityColor;
}

const _colorGroup = () => {
    var _colorGroup = d3.scale.quantile()
        .domain(d3.range(1,366,(366/9)))
        .range(["#996b25", "#c58a30", "#dea44a", "#e2ae5e", "#b1bbcf", "#97a5bf", "#7d8faf", "#64728c", "#3e4757"]) 
    
    return _colorGroup;
}

const _sortCities = (year) => {
    return (a,b) => {
  var aValue,
        bValue;

      a.values.forEach(yearValues => {
        if(yearValues.x == year){
          aValue = yearValues.y;
        }
      })            
  
      b.values.forEach(yearValues => {
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

const _sortMsaCities = () => {
    return (a,b) => {
      if(a.key > b.key){
        return -1;
      }
      if(b.key > a.key){
        return 1;
      }           
                
      return 0;     
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {};

export default function combinedReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
