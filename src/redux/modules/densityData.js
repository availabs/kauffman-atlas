/* @flow */
import fetch from 'isomorphic-fetch'
import { msaLookup, populationData } from 'static/data/msaDetails'
import colorbrewer from 'colorbrewer'
import d3 from 'd3'
// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_DENSITY_DATA = 'RECEIVE_DENSITY_DATA'
export const RECEIVE_NEWVALUES_DATA = 'RECEIVE_NEWVALUES_DATA'
export const RECEIVE_SHARE_DATA = 'RECEIVE_SHARE_DATA'
export const RECEIVE_DENSITYCOMPOSITE_DATA = 'RECEIVE_DENSITYCOMPOSITE_DATA'

// ------------------------------------
// Actions
// ------------------------------------
// NOTE: "Action" is a Flow interface defined in https://github.com/TechnologyAdvice/flow-interfaces
// If you're unfamiliar with Flow, you are completely welcome to avoid annotating your code, but
// if you'd like to learn more you can check out: flowtype.org.
// DOUBLE NOTE: there is currently a bug with babel-eslint where a `space-infix-ops` error is
// incorrectly thrown when using arrow functions, hence the oddity.
export function receiveData (value) {
  return {
    type: RECEIVE_DENSITY_DATA,
    payload: value
  }
}

export function getNewValues () {
  return {
    type: RECEIVE_NEWVALUES_DATA,
    payload: null
  }
}

export function getShare () {
  return {
    type: RECEIVE_SHARE_DATA,
    payload: null
  }
}

export function getDensityComposite () {
  return {
    type: RECEIVE_DENSITYCOMPOSITE_DATA,
    payload: null
  }
}

// This is a thunk, meaning it is a function that immediately
// returns a function for lazy evaluation. It is incredibly useful for
// creating async actions, especially when combined with redux-thunk!
// NOTE: This is solely for demonstration purposes. In a real application,
// you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
// reducer take care of this logic.
export const loadDensityData = () => {
  return (dispatch) => {
    return fetch('/data/density_data.json')
      .then(response => response.json())
      .then(json => dispatch(receiveData(json)))
  }
}

export const loadNewValues = () => {
  return (dispatch) => {dispatch(getNewValues())}
}

export const loadShare = () => {
  return (dispatch) => {dispatch(getShare())}
}

export const loadDensityComposite = () => {
  return (dispatch) => {dispatch(getDensityComposite())}
}


export const actions = {
  receiveData,
  loadDensityData,
  loadNewValues,
  getNewValues,
  loadShare,
  getShare,
  loadDensityComposite,
  getDensityComposite
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECEIVE_DENSITY_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.rawData = action.payload;
    newState.loaded = true;

    console.log("loaded density data");

    return newState;
  },
  [RECEIVE_NEWVALUES_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.newValuesData = _processData({data:state.rawData,selectedMetric:"newValues"})

    return newState;
  },
  [RECEIVE_SHARE_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.shareData = _processData({data:state.rawData,selectedMetric:"share"})

    return newState;
  },
  [RECEIVE_DENSITYCOMPOSITE_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    if(!newState.newValuesData){
      newState.newValuesData = _processData({data:state.rawData,selectedMetric:"newValues"})
    }
    if(!newState.shareData){
      newState.shareData = _processData({data:state.rawData,selectedMetric:"share"})
    }
    newState.compositeData = _processComposite(newState.newValuesData['relative'],newState.shareData['relative']);

    return newState;
  }
}

const _processComposite = (newFirms,share) => {
  var filteredShare = share.map(city => {
    var withinBounds;

    city.values = city.values.filter(yearVal => {
        if(yearVal.x >= 1990){
          return true;
        }
        else{
          return false;
        }
    })
    return city;
  })

  var compositeCityRanks = [];

  var newFirmScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(newFirms, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                  d3.max(newFirms, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                  )

  var shareScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(filteredShare, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                  d3.max(filteredShare, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                  )

  newFirms.forEach(newFirmItem => {
      for(var i=0; i<filteredShare.length;i++){
          if(newFirmItem.key == filteredShare[i].key){

              var resultValues = [];

              newFirmItem.values.forEach(newFirmItemValues => {
                  for(var j=0;j<filteredShare[i].values.length;j++){
                      if(newFirmItemValues.x == filteredShare[i].values[j].x){
                          resultValues.push({x:newFirmItemValues.x,y:((newFirmScale(newFirmItemValues.y) + shareScale((filteredShare[i].values[j].y))) /2 )})
                      }
                  }
              })
              compositeCityRanks.push({key:newFirmItem.key,values:resultValues})
          }
      }
  })

  compositeCityRanks = _rankCities(compositeCityRanks);
  var graphData = _polishData(compositeCityRanks,"densityComposite");
  return graphData;
}

const _processData = (props) => {
  let data = props.data,
      dataset = props.selectedMetric,
      ages = d3.range(12),
      newFirmData = {};


  Object.keys(data).forEach(firmAge => {
      Object.keys(data[firmAge]).forEach(metroAreaId => {
          //If we havent gotten to this MSA yet
          if(!newFirmData[metroAreaId]){
              newFirmData[metroAreaId] = {};
          }

          //Iterating through every year for a given firm age in a metro area
          data[firmAge][metroAreaId].forEach(rowData => {
              if(dataset == "newValues"){
                  if(rowData["year2"]>= 1990 && rowData["year2"]<= 2009){
                      if(!newFirmData[metroAreaId][rowData["year2"]]){
                          newFirmData[metroAreaId][rowData["year2"]] = {};
                      }
                      newFirmData[metroAreaId][rowData["year2"]][firmAge] = rowData["firms"]; 
                  }                      
              }
              else{
                  if(!newFirmData[metroAreaId][rowData["year2"]]){
                      newFirmData[metroAreaId][rowData["year2"]] = {};
                  }                        
                  newFirmData[metroAreaId][rowData["year2"]][firmAge] = rowData["emp"];
              }
          })
      })
  })  

  var rawChartData = [];

  //Every msa represented as:
  //{values:[{x:val,y:val}....],key=msa,}
  //Want to return 1 (x,y) object for each year, where x=year and y=new firms per 1000 people
  var relativeChartData = Object.keys(newFirmData).map(msaId => {
      //Iterating through every year within a metro area
      var rawValueArray = [];
      var relativeValueArray = Object.keys(newFirmData[msaId]).map(year => {
          var curRelativeCoord={"x":+year,"y":0},
              curRawCoord={"x":+year,"y":0},
              newFirmSum = 0,
              newPer1000 = 0,
              pop = 0,
              pop1000 = 0,
              totalEmploySum = 0,
              share = 0;

          //Creates number of new firms for that year
          ages.forEach(function(age){
              if(newFirmData[msaId][year][age] && (age < 2)){
                  newFirmSum = newFirmSum + +newFirmData[msaId][year][age];
              }

              if(dataset == "share"){
                  if(newFirmData[msaId][year][age]){
                      totalEmploySum = totalEmploySum + +newFirmData[msaId][year][age];                   
                  }                            
              }
          })

          if(dataset == "share"){
              share = newFirmSum/totalEmploySum;

              curRawCoord["y"] = newFirmSum
              curRelativeCoord["y"] = share;

              //Want to return: x:year y:percent
              rawValueArray.push(curRawCoord);
              return curRelativeCoord;
          }
          else{
              if(populationData[msaId] && populationData[msaId][year]){
                  pop = populationData[msaId][year];
                  pop1000 = (pop/1000);                   
              }
              else{
                  pop1000=0;
              }

              if(pop1000 == 0){
                  newPer1000 = 0;
              }
              else{

                  newPer1000 = newFirmSum/pop1000;
              }
              
              curRelativeCoord["y"] = newPer1000;
              curRawCoord["y"] = newFirmSum;

              //Want to return: x:year y:percent
              rawValueArray.push(curRawCoord);                            
              return curRelativeCoord;                        
          }
      })

      //Only return once per metroArea
      rawChartData.push({key:msaId,values:rawValueArray,area:false})
      return {key:msaId,values:relativeValueArray,area:false};
  })

  var rankedData = _rankCities(relativeChartData);
  var polishedData = _polishData(rankedData,("relative"+dataset));

  var rankedData2 = _rankCities(rawChartData);
  var polishedData2 = _polishData(rankedData2,dataset)

  var graphData = {};
  graphData['raw'] = polishedData2;
  graphData['relative'] = polishedData;
  

  return graphData;
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
            var color = colorOppGroup(params.x);    
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
    var _colorGroup = d3.scale.linear()
        .domain(d3.range(1,366,(366/9)))
        .range(colorbrewer.Spectral[9]);
    
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

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  loaded:false
};

export default function densityReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
