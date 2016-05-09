/* @flow */
import fetch from 'isomorphic-fetch'
import colorbrewer from 'colorbrewer'
import d3 from 'd3'
import { loadDensityData,loadDensityComposite } from 'redux/modules/densityData'
import { loadFluidityData,loadFluidityComposite } from 'redux/modules/fluidityData'
import { loadDiversityData,loadDiversityComposite } from 'redux/modules/diversityData'

// ------------------------------------
// Constants
// ------------------------------------

export const RECEIVE_COMBINED_DATA = 'RECEIVE_COMBINED_DATA'
export const RECEIVE_COMBINEDCOMPOSITE_DATA = 'RECEIVE_COMBINEDCOMPOSITE_DATA'



export const loadCombinedData = () => {
  return (dispatch,getState) => {
    var state = getState();

    if(!state.densityData.loaded){
      console.log("getting density in combo")
       dispatch(loadDensityData())
        .then(() => dispatch(loadDensityComposite()))
    }
    else if(!state.densityData.compositeData){
      dispatch(loadDensityComposite())
    }
    if(!state.fluidityData.loaded){
      console.log("getting fluid in combo")
       dispatch(loadFluidityData())
        .then(() => dispatch(loadFluidityComposite()))
    }
    else if(!state.fluidityData.compositeData){
      dispatch(loadFluidityComposite())
    }
    if(!state.diversityData.loaded){
      console.log("getting div in combo")
       dispatch(loadDiversityData())
        .then(() => dispatch(loadDiversityComposite()))
    }
    else if(!state.diversityData.diversitycomposite){
      dispatch(loadDiversityComposite())
    }      
    console.log(getState())
    return dispatch(receiveCombinedData())  
  }
}
export function receiveCombinedData () {
  return {
    type: RECEIVE_COMBINED_DATA,
    payload: null
  }
}

export const loadCombinedComposite = () => {
  return (dispatch,getState) => {
    console.log("should have all data here combo comp",getState())
    return dispatch(getCombinedComposite())     
  }
}

export function getCombinedComposite () {
  return {
    type: RECEIVE_COMBINEDCOMPOSITE_DATA,
    payload: null
  }
}


export const actions = {
  receiveCombinedData,
  loadCombinedData,
  loadCombinedComposite,
  getCombinedComposite
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECEIVE_COMBINED_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    console.log("loaded combined data");

    newState.combinedLoaded = true;

    return newState;
  },
  [RECEIVE_COMBINEDCOMPOSITE_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    console.log("receive combined composite data");

    newState.combinedcomposite = ['testing']

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

const _processequalOpp = (data) => {
  var msaGains = {};

  console.log("processequalOpp");
  //filter out null rows
  Object.keys(data).forEach(function(msaId){
      if(data[msaId]["highIncome"] != null && data[msaId]["lowIncome"] != null){
          msaGains[msaId] = {};
          msaGains[msaId] = data[msaId];
      }

  })

  var finalData = _convertToCoordinateArray(msaGains,"opportunity");
  
  finalData.sort(_sortCities("lowIncome"));
  var polishedData = _polishData(finalData,"opportunity");

  return polishedData;
}

const _convertToCoordinateArray = (data,dataset) => {
    var finalData = [];

    Object.keys(data).forEach(msaId => {
        var valueArray = [];
        Object.keys(data[msaId]).forEach(year => {
            if(dataset != "opportunity"){
                if(dataset != "inc5000"){
                  valueArray.push( {x:+year,y:+Math.round(+data[msaId][year])});                   
                }
                else{
                    valueArray.push( {x:+year,y:+data[msaId][year]});          
                }
            }
            else{
                valueArray.push( {x:year,y:+data[msaId][year]});  
            } 
        })

        if(valueArray.length != 0){
         finalData.push({key:msaId,values:valueArray,area:false});                
        }
    })

    return finalData;
}
const _relativeAgainstPopulation = (graphRawData) => {
  var maxYear = d3.max(graphRawData, function(c) { return d3.max(c.values, function(v) { return v.x }); })
  
  //Current Population dataset only goes to 2014        
  if(maxYear > 2012){
      maxYear = 2012;
  }

  var graphRelativeData = graphRawData.map(metroArea => {
      var newValues = [];
      metroArea.values.forEach(yearVal => {
          if(yearVal.x <= maxYear){
              var newCoord = {x:yearVal.x, y:0};

              if(populationData[metroArea.key]){
                  if(populationData[metroArea.key][yearVal.x]){
                      var newY = yearVal.y / populationData[metroArea.key][yearVal.x];
                      newCoord = {x: yearVal.x, y:newY};                                
                  }
              }
              newValues.push(newCoord);   
          }
      })
      return ({key:metroArea.key,values:newValues,area:false});                
  })

  return graphRelativeData;
}

const _processGeneral = (data,dataset) => {
    var finalData = _convertToCoordinateArray(data);

    var rankedData = _rankCities(finalData);
    var polishedData = _polishData(rankedData,dataset);
    var graphRawData = polishedData;

    var graphRelativeData = [];
    graphRelativeData = _relativeAgainstPopulation(graphRawData);

    if(graphRelativeData && graphRelativeData.length > 0){
        var rankedData2 = _rankCities(graphRelativeData);
        var polishedData2 = _polishData(rankedData2,("relative"+dataset));

        var graphData = {};
        graphData["raw"] = graphRawData;
        graphData["relative"] = polishedData2;
        return graphData;                
    }
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

const _colorOppGroup = (group) => {
    if(group == "lowIncome"){
        var colorGroup = d3.scale.linear()
            .domain([-.2,.2])
            .range(['red','green']);
    }
    if(group == "highIncome"){
        var colorGroup = d3.scale.linear()
           .domain([-.1,.1])
           .range(['red','green']);           
    }

    return colorGroup;
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
