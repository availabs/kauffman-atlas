/* @flow */
import fetch from 'isomorphic-fetch'
import colorbrewer from 'colorbrewer'
import d3 from 'd3'
import { msaLookup, populationData } from 'static/data/msaDetails'

// ------------------------------------
// Constants
// ------------------------------------

export const RECEIVE_OPPORTUNITY_DATA = 'RECEIVE_OPPORTUNITY_DATA'
export const RECEIVE_FOREIGNBORN_DATA = 'RECEIVE_FOREIGNBORN_DATA'
export const RECEIVE_FLUIDITYCOMPOSITE_DATA = 'RECEIVE_FLUIDITYCOMPOSITE_DATA'



export const actions = {


}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {

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
const _colorFunction = (params,dataset) => {
  var  cityColor;

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

export default function diversityReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
