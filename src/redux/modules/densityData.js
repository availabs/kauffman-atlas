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
export const RECEIVE_COMPOSITE_DATA = 'RECEIVE_COMPOSITE_DATA'

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

export function getComposite () {
  return {
    type: RECEIVE_COMPOSITE_DATA,
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

export const loadComposite = () => {
  return (dispatch) => {dispatch(getComposite())}
}


export const actions = {
  receiveData,
  loadDensityData,
  loadNewValues,
  getNewValues,
  loadShare,
  getShare,
  loadComposite,
  getComposite
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECEIVE_DENSITY_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.rawData = action.payload;
    newState.loaded = true;

    //console.log(newState)

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
  [RECEIVE_COMPOSITE_DATA]: (state,action) => {
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
    var filteredShare = share.map(function(city){
      var withinBounds;

      city.values = city.values.filter(function(yearVal){
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

    newFirms.forEach(function(item){
        for(var i=0; i<filteredShare.length;i++){
            if(item.key == filteredShare[i].key){

                var resultValues = [];

                item.values.forEach(function(itemValues){
                    for(var j=0;j<filteredShare[i].values.length;j++){
                        if(itemValues.x == filteredShare[i].values[j].x){
                            resultValues.push({x:itemValues.x,y:((newFirmScale(itemValues.y) + shareScale((filteredShare[i].values[j].y))) /2 )})
                        }
                    }
                })
                compositeCityRanks.push({key:item.key,values:resultValues})
            }
        }
    })

    compositeCityRanks = rankCities(compositeCityRanks);
    var graphData = polishData(compositeCityRanks,"densityComposite");
    return graphData;
  }

  const _processData =  (props) =>{
    let data = props.data,
        dataset = props.selectedMetric;

    let scope = this,
        ages = d3.range(12),
        newFirmData = {};


    Object.keys(data).forEach(function(firmAge){
        Object.keys(data[firmAge]).forEach(function(metroAreaId){
            //If we havent gotten to this MSA yet
            if(!newFirmData[metroAreaId]){
                newFirmData[metroAreaId] = {};
            }

            //Iterating through every year for a given firm age in a metro area
            data[firmAge][metroAreaId].forEach(function(rowData){
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
    var relativeChartData = Object.keys(newFirmData).map(function(msaId){
        //Iterating through every year within a metro area
        var rawValueArray = [];
        var relativeValueArray = Object.keys(newFirmData[msaId]).map(function(year){
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

    var rankedData = rankCities(relativeChartData);
    var polishedData = polishData(rankedData,("relative"+dataset));

    var rankedData2 = rankCities(rawChartData);
    var polishedData2 = polishData(rankedData2,dataset)

    var graphData = {};
    graphData['raw'] = polishedData2;
    graphData['relative'] = polishedData;
    

    return graphData;
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

export default function densityReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
