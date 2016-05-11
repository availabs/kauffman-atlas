/* @flow */
import fetch from 'isomorphic-fetch'
import colorbrewer from 'colorbrewer'
import d3 from 'd3'
import { loadDensityData,loadNewValues} from 'redux/modules/densityData'
import { msaLookup, populationData } from 'static/data/msaDetails'

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_IRS_DATA = 'RECEIVE_IRS_DATA'
export const RECEIVE_ACS_DATA = 'RECEIVE_ACS_DATA'
export const RECEIVE_INC5000_DATA = 'RECEIVE_INC5000_DATA'
export const RECEIVE_FLUIDITY_DATA = 'RECEIVE_FLUIDITY_DATA'
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
  return (dispatch,getState) => {
    var state = getState();
    if(!state.densityData.loaded){
       dispatch(loadDensityData())
        .then(() => dispatch(loadNewValues()))
        .then(() => { 
          state = getState();
          return fetch('/data/inc5000.json')
            .then(response => response.json())
            .then(incJson => dispatch(receiveInc5000Data(incJson, state.densityData.newValuesData)))
        })
    }
    else if(!state.densityData.newValuesData){
      dispatch(loadNewValues())
        .then(() => {
          state = getState();
          return fetch('/data/inc5000.json')
            .then(response => response.json())
            .then(incJson => dispatch(receiveInc5000Data(incJson, state.densityData.newValuesData)))
        })
    }
    else{
      state = getState();
      return fetch('/data/inc5000.json')
        .then(response => response.json())
        .then(incJson => dispatch(receiveInc5000Data(incJson, state.densityData.newValuesData)))
    }
  }
}
export function receiveInc5000Data (incJson,newValuesData) {
  return {
    type: RECEIVE_INC5000_DATA,
    payload: {incData:incJson,newValuesData:newValuesData}
  }
}

export const loadFluidityData = () => {
  return (dispatch) => {
    return fetch('/data/acsMigration.json')
      .then(response => response.json())
      .then(acsJson => {
        fetch('/data/irsMigration.json')
          .then(response => response.json())
          .then(irsJson => {
            dispatch(loadInc5000Data())
            .then(() => dispatch(receiveFluidityData(acsJson,irsJson)))
          })
      })
  }
}
export function receiveFluidityData (acs,irs) {
  return {
    type:  RECEIVE_FLUIDITY_DATA,
    payload: {'acs':acs,'irs':irs}
  }
}

export const loadFluidityComposite = () => {
  return (dispatch,getState) => {
    var state = getState();
    if(!state.inc5000Loaded){
      return dispatch(loadInc5000Data())
        .then(() => dispatch(getFluidityComposite()))
    }
    else{
      return dispatch(getFluidityComposite());
    }
  }
}
export function getFluidityComposite () {
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
  loadFluidityData,
  receiveFluidityData,
  loadFluidityComposite,
  getFluidityComposite,
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
  [RECEIVE_FLUIDITY_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.irsRawData = action.payload['irs'];
    newState.irsLoaded = true;

    newState.acsRawData = action.payload['acs'];
    newState.acsLoaded = true;

    console.log("loaded fluidity data");

    if(newState.irsLoaded && newState.acsLoaded && newState.inc5000Loaded){
      newState.fluLoaded = true;
    }
    
    return newState;
  },
  [RECEIVE_IRS_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.irsRawData = action.payload;
    newState.irsLoaded = true;

    if(newState.irsLoaded && newState.acsLoaded && newState.inc5000Loaded){
      newState.fluLoaded = true;
    }
    
    return newState;
  },
  [RECEIVE_ACS_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.acsRawData = action.payload;
    newState.acsLoaded = true;

    //Need to add INC5000    
    if(newState.irsLoaded && newState.acsLoaded && newState.inc5000Loaded){
      newState.fluLoaded = true;
    }

    return newState;
  },
  [RECEIVE_INC5000_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.inc5000RawData = action.payload.incData;
    newState.inc5000 = _processinc5000(newState.inc5000RawData,action.payload.newValuesData['raw']);
    newState.inc5000Loaded = true;
    
    return newState;
  },
  [RECEIVE_COMPOSITE_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    if(!newState.irsNet){
      if(!newState.irsRawData){

        loadIrsData()
      }
      newState.irsNet = _processdetailMigration(newState.irsRawData,"irsNet");
    }
    if(!newState.acsNet){
      newState.acsNet = _processGeneral(newState.acsRawData,"acsNet");
    }
    if(!newState.totalMigrationFlow){
      newState.totalMigrationFlow = _processdetailMigration(newState.irsRawData,"totalMigrationFlow");
    }
    if(!newState.inflowMigration){
      newState.inflowMigration = _processdetailMigration(newState.irsRawData,"inflowMigration");
    }
    if(!newState.outflowMigration){
      newState.outflowMigration = _processdetailMigration(newState.irsRawData,"outflowMigration");
    }

    newState.compositeData = _processComposite(newState);


    return newState;
  },
  [RECEIVE_NETMIGRATIONIRS_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.irsNet = _processdetailMigration(newState.irsRawData,"irsNet");

    return newState;
  },
  [RECEIVE_NETMIGRATIONACS_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.acsNet = _processGeneral(newState.acsRawData,"acsNet");

    return newState;
  },
  [RECEIVE_TOTALMIGRATION_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.totalMigrationFlow = _processdetailMigration(newState.irsRawData,"totalMigrationFlow");

    return newState;
  },
  [RECEIVE_INFLOWMIGRATION_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.inflowMigration = _processdetailMigration(newState.irsRawData,"inflowMigration");

    return newState;
  },
  [RECEIVE_OUTFLOWMIGRATION_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.outflowMigration = _processdetailMigration(newState.irsRawData,"outflowMigration");

    return newState;
  }
}
const _processComposite = (newState) => {

  var filteredRawInc = _trimYears(([2007,2009]),newState.inc5000.raw);
  var filteredRelInc = _trimYears(([2007,2009]),newState.inc5000.relative);
  var filteredIrsNet = _trimYears(([2007,2009]),newState.irsNet['relative']);
  var filteredTotalMigrationFlow = _trimYears(([2007,2009]),newState.totalMigrationFlow['relative']);

  var cityFilteredIrsNet = [],
      cityFilteredTotalMigrationFlow = [],
      cityFilteredRawInc = [],
      cityFilteredRelInc = [];



  for(var i=0; i<filteredIrsNet.length; i++){

    for(var j=0; j<filteredRawInc.length; j++){
      if(filteredIrsNet[i].key == filteredRawInc[j].key){
        cityFilteredIrsNet.push(filteredIrsNet[i]); 
        cityFilteredTotalMigrationFlow.push(filteredTotalMigrationFlow[i]);
        cityFilteredRawInc.push(filteredRawInc[j])
        cityFilteredRelInc.push(filteredRelInc[j])
      }      
    }
  }

  var compositeCityRanks = [];

  var irsNetScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(cityFilteredIrsNet, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                  d3.max(cityFilteredIrsNet, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                  )
  var totalMigrationScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(cityFilteredTotalMigrationFlow, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                  d3.max(cityFilteredTotalMigrationFlow, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                  )  
  var rawIncScale = d3.scale.linear()
  .range([0,100])
  .domain(      [d3.min(cityFilteredRawInc, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                d3.max(cityFilteredRawInc, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                )  
  var relIncScale = d3.scale.linear()
  .range([0,100])
  .domain(      [d3.min(cityFilteredRelInc, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                d3.max(cityFilteredRelInc, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                )  

  cityFilteredIrsNet.sort(_sortMsaCities());
  cityFilteredTotalMigrationFlow.sort(_sortMsaCities());
  cityFilteredRawInc.sort(_sortMsaCities());
  cityFilteredRelInc.sort(_sortMsaCities());


  for(var i=0; i<cityFilteredIrsNet.length;i++){
    var resultValues = [];
    if(cityFilteredIrsNet[i].key == cityFilteredRawInc[i].key){
      for(var j=0; j<cityFilteredIrsNet[i]['values'].length; j++){
        resultValues.push({x:cityFilteredIrsNet[i].values[j].x,y:((irsNetScale(cityFilteredIrsNet[i].values[j].y) + totalMigrationScale(cityFilteredTotalMigrationFlow[i].values[j].y) + relIncScale(cityFilteredRelInc[i].values[j].y)+ rawIncScale(cityFilteredRawInc[i].values[j].y))/4)})      
      } 
      compositeCityRanks.push({key:cityFilteredIrsNet[i]['key'],values:resultValues})          
    }
  }


  compositeCityRanks = _rankCities(compositeCityRanks);
  var graphData = _polishData(compositeCityRanks,"fluidityComposite");
  return graphData;
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

const _processdetailMigration = (data,dataset) => {
  var reducedData = {},
      finalData = [];

  Object.keys(data).forEach(msaId => {
      var valueArray = [];
      Object.keys(data[msaId]).forEach(year => {
          if(data[msaId][year]){
              if(data[msaId][year]['outflow']){
                  if(year > 12){
                      var curYear = "19" + year;
                  }
                  else{
                      var curYear = "20" + year;
                  }

                  var curValue = 0;
                  if(dataset == "outflowMigration"){
                      curValue = +data[msaId][year]['outflow']['individuals']
                  }
                  else{
                      curValue += +data[msaId][year]['inflow']['individuals']

                      if(dataset == "totalMigrationFlow"){
                          curValue += +data[msaId][year]['outflow']['individuals']
                      }
                      if(dataset == "irsNet"){
                          curValue -= +data[msaId][year]['outflow']['individuals']
                      }
                  }

                  valueArray.push( {x:+curYear,y:curValue});                        
              }                
          }
      })

      if(valueArray.length != 0){
       finalData.push({key:msaId,values:valueArray,area:false});                
      }
  })

  var rankedData = _rankCities(finalData);
  var polishedData = _polishData(rankedData,dataset);

  polishedData.forEach(metroArea => {
      metroArea.values.sort((a,b) => {
          return a.x - b.x
      })
  })

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

const _processinc5000 = (data,newFirms) => {

  var finalData = _convertToCoordinateArray(data,"inc5000");
  var rankedData = _rankCities(finalData);
  var polishedData = _polishData(rankedData,"inc5000");

  var totalEmp = {};

  newFirms.forEach(city => {

      //Iterating through every year within a metro area
      var valueObject = {};
      Object.keys(city.values).forEach(yearValue => {
          //Want to return: x:year y:percent
          valueObject[city.values[yearValue].x] = 0;
          valueObject[city.values[yearValue].x] = city.values[yearValue].y;
      })

      //Only return once per metroArea
      totalEmp[city.key] = {key:city.key,values:valueObject,area:false};                    
  })

  var graphRawData = polishedData;

  var graphRelativeData = graphRawData.map(metroArea => {
      var newValues = [];
      metroArea.values.forEach(yearVal => {
          if(yearVal.x < 2010){
              var newCoord = {x:yearVal.x, y:0};

              if(totalEmp[metroArea.key] && totalEmp[metroArea.key]["values"][yearVal.x]){
                  var newY = +yearVal.y / totalEmp[metroArea.key]["values"][yearVal.x];
                  newCoord = {x: yearVal.x, y:newY};
              }
              newValues.push(newCoord);                       
          }     
      })

       return ({key:metroArea.key,values:newValues,area:false});                
  })

  var graphRelativeData2 = [];
  graphRelativeData2 = _relativeAgainstPopulation(graphRawData);

  if(graphRelativeData2 && graphRelativeData2.length > 0){
      var rankedData2 = _rankCities(graphRelativeData);
      var polishedData2 = _polishData(rankedData2,"relativeInc5000");

      var rankedData3 = _rankCities(graphRelativeData2);
      var polishedData3 = _polishData(rankedData3,"relativeInc5000");

      var graphData = {};
      graphData["raw"] = graphRawData;
      graphData["relative"] = polishedData2;
      graphData["relative2"] = polishedData3;

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
const initialState = {
  irsLoaded:false,
  acsLoaded:false,
  inc5000Loaded:false
};

export default function fluidityReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
