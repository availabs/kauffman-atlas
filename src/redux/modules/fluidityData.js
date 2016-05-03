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
    console.log("action datastore");
    var newState = Object.assign({},state);

    newState.irsRawData = action.payload['irs'];
    newState.irsLoaded = true;

    newState.acsRawData = action.payload['acs'];
    newState.acsLoaded = true;


    //Need to add INC5000
    if(newState.irsLoaded && newState.acsLoaded){
      newState.fluLoaded = true;
    }
    

    console.log("loadirs datastore action recFluidData",newState);
    return newState;
  },
  [RECEIVE_IRS_DATA]: (state,action) => {
    console.log("action datastore");
    var newState = Object.assign({},state);

    newState.irsRawData = action.payload;
    newState.irsLoaded = true;

    //Need to add INC5000
    if(newState.irsLoaded && newState.acsLoaded){
      newState.fluLoaded = true;
    }
    

    console.log("loadirs datastore",newState);
    return newState;
  },
  [RECEIVE_ACS_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.acsRawData = action.payload;
    newState.acsLoaded = true;

    //Need to add INC5000    
    if(newState.irsLoaded && newState.acsLoaded){
      newState.fluLoaded = true;
    }

    return newState;
  },
  [RECEIVE_INC5000_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.inc5000RawData = action.payload.incData;
    newState.inc5000 = processinc5000(newState.inc5000RawData,action.payload.newValuesData['raw']);
    newState.inc5000Loaded = true;
    
    return newState;
  },
  [RECEIVE_COMPOSITE_DATA]: (state,action) => {
    var newState = Object.assign({},state);
    console.log("compositeState checkign inc", state);
    if(!newState.irsNet){
      if(!newState.irsRawData){
        console.log("loading irs data in composite");
        loadIrsData()
      }
      newState.irsNet = processdetailMigration(newState.irsRawData,"irsNet");
    }
    if(!newState.acsNet){
      newState.acsNet = processGeneral(newState.acsRawData,"acsNet");
    }
    if(!newState.totalMigrationFlow){
      newState.totalMigrationFlow = processdetailMigration(newState.irsRawData,"totalMigrationFlow");
    }
    if(!newState.inflowMigration){
      newState.inflowMigration = processdetailMigration(newState.irsRawData,"inflowMigration");
    }
    if(!newState.outflowMigration){
      newState.outflowMigration = processdetailMigration(newState.irsRawData,"outflowMigration");
    }

    newState.compositeData = _processComposite(newState);


    return newState;
  },
  [RECEIVE_NETMIGRATIONIRS_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.irsNet = processdetailMigration(newState.irsRawData,"irsNet");

    console.log("irsnet datastore",newState);
    return newState;
  },
  [RECEIVE_NETMIGRATIONACS_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.acsNet = processGeneral(newState.acsRawData,"acsNet");

    return newState;
  },
  [RECEIVE_TOTALMIGRATION_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.totalMigrationFlow = processdetailMigration(newState.irsRawData,"totalMigrationFlow");

    return newState;
  },
  [RECEIVE_INFLOWMIGRATION_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.inflowMigration = processdetailMigration(newState.irsRawData,"inflowMigration");

    return newState;
  },
  [RECEIVE_OUTFLOWMIGRATION_DATA]: (state,action) => {
    var newState = Object.assign({},state);

    newState.outflowMigration = processdetailMigration(newState.irsRawData,"outflowMigration");

    return newState;
  }
}
const _processComposite = (newState) => {

  console.log(newState.inc5000.raw);

  var filteredRawInc = trimYears(([1990,2012]),newState.inc5000.raw);
  var filteredRelInc = trimYears(([1990,2012]),newState.inc5000.relative);
  var filteredIrsNet = trimYears(([1990,2012]),newState.irsNet['relative']);
  var filteredAcsNet = trimYears(([1990,2012]),newState.acsNet['relative']);
  var filteredTotalMigrationFlow = trimYears(([1990,2012]),newState.totalMigrationFlow['relative']);
  var filteredInflowMigration = trimYears(([1990,2012]),newState.inflowMigration['relative']);
  var filteredOutflowMigration = trimYears(([1990,2012]),newState.outflowMigration['relative']);

  var compositeCityRanks = [];

  var irsNetScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(filteredIrsNet, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                  d3.max(filteredIrsNet, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                  )
  var acsNetScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(filteredAcsNet, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                  d3.max(filteredAcsNet, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                  )
  var totalMigrationScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(filteredTotalMigrationFlow, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                  d3.max(filteredTotalMigrationFlow, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                  )  
  var inflowMigrationScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(filteredInflowMigration, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                  d3.max(filteredInflowMigration, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                  )  
  var outflowMigrationScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(filteredOutflowMigration, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                  d3.max(filteredOutflowMigration, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                  )   
  var rawIncScale = d3.scale.linear()
  .range([0,100])
  .domain(      [d3.min(filteredRawInc, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                d3.max(filteredRawInc, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                )  
  var relIncScale = d3.scale.linear()
  .range([0,100])
  .domain(      [d3.min(filteredRelInc, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                d3.max(filteredRelInc, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                )  

  filteredIrsNet.sort(sortMsaCities());
  filteredAcsNet.sort(sortMsaCities());
  filteredTotalMigrationFlow.sort(sortMsaCities());
  filteredInflowMigration.sort(sortMsaCities());
  filteredOutflowMigration.sort(sortMsaCities());
  filteredRawInc.sort(sortMsaCities());
  filteredRelInc.sort(sortMsaCities());


  for(var i=0; i<filteredIrsNet.length;i++){
      var resultValues = [];
      for(var j=0; j<filteredIrsNet[i]['values'].length; j++){
        resultValues.push({x:filteredIrsNet[i].values[j].x,y:((irsNetScale(filteredIrsNet[i].values[j].y) + acsNetScale(filteredAcsNet[i].values[j].y) + totalMigrationScale(filteredTotalMigrationFlow[i].values[j].y) + inflowMigrationScale(filteredInflowMigration[i].values[j].y) + outflowMigrationScale(filteredOutflowMigration[i].values[j].y))/5)})      
      } 
      compositeCityRanks.push({key:filteredIrsNet[i]['key'],values:resultValues})
  }


  compositeCityRanks = rankCities(compositeCityRanks);
  var graphData = polishData(compositeCityRanks,"fluidityComposite");
  return graphData;
}

const trimYears = (years,cities) => {

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

const convertToCoordinateArray = (data,dataset) => {
    var scope = this,
        finalData = [];

    Object.keys(data).forEach(function(msaId){
        var valueArray = [];
        Object.keys(data[msaId]).forEach(function(year){
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
const relativeAgainstPopulation = (graphRawData) => {
  var scope = this,
      maxYear = d3.max(graphRawData, function(c) { return d3.max(c.values, function(v) { return v.x }); })
  
  //Current Population dataset only goes to 2014        
  if(maxYear > 2012){
      maxYear = 2012;
  }

  var graphRelativeData = graphRawData.map(function(metroArea){
      var newValues = [];
      metroArea.values.forEach(function(yearVal){
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
const processGeneral = (data,dataset) => {
    console.log("processgeneral");
    var finalData = convertToCoordinateArray(data);

    var rankedData = rankCities(finalData);
    var polishedData = polishData(rankedData,dataset);
    var graphRawData = polishedData;

    var graphRelativeData = [];
    graphRelativeData = relativeAgainstPopulation(graphRawData);

    if(graphRelativeData && graphRelativeData.length > 0){
        var rankedData2 = rankCities(graphRelativeData);
        var polishedData2 = polishData(rankedData2,("relative"+dataset));

        var graphData = {};
        graphData["raw"] = graphRawData;
        graphData["relative"] = polishedData2;
        return graphData;                
    }
}

const processdetailMigration = (data,dataset) => {
  var scope = this, 
      reducedData = {},
      finalData = [];
      console.log("processdetailMigration")

  Object.keys(data).forEach(function(msaId){
      var valueArray = [];
      Object.keys(data[msaId]).forEach(function(year){
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

  var rankedData = rankCities(finalData);
  var polishedData = polishData(rankedData,dataset);

  polishedData.forEach(function(metroArea){
      metroArea.values.sort(function(a,b){
          return a.x - b.x
      })
  })

  var graphRawData = polishedData;

  var graphRelativeData = [];
  graphRelativeData = relativeAgainstPopulation(graphRawData);

  if(graphRelativeData && graphRelativeData.length > 0){
      var rankedData2 = rankCities(graphRelativeData);
      var polishedData2 = polishData(rankedData2,("relative"+dataset));

      var graphData = {};
      graphData["raw"] = graphRawData;
      graphData["relative"] = polishedData2;
      return graphData;                
  }             
}

const processinc5000 = (data,newFirms) => {
  console.log("processinc5000");

  var finalData = convertToCoordinateArray(data,"inc5000");
  var rankedData = rankCities(finalData);
  var polishedData = polishData(rankedData,"inc5000");

  var totalEmp = {};

  newFirms.forEach(function(city){

      //Iterating through every year within a metro area
      var valueObject = {};
      Object.keys(city.values).forEach(function(yearValue){
          //Want to return: x:year y:percent
          valueObject[city.values[yearValue].x] = 0;
          valueObject[city.values[yearValue].x] = city.values[yearValue].y;
      })

      //Only return once per metroArea
      totalEmp[city.key] = {key:city.key,values:valueObject,area:false};                    
  })

  var graphRawData = polishedData;

  var graphRelativeData = graphRawData.map(function(metroArea){
      var newValues = [];
      metroArea.values.forEach(function(yearVal){
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
  graphRelativeData2 = relativeAgainstPopulation(graphRawData);

  if(graphRelativeData2 && graphRelativeData2.length > 0){
      var rankedData2 = rankCities(graphRelativeData);
      var polishedData2 = polishData(rankedData2,"relativeInc5000");

      var rankedData3 = rankCities(graphRelativeData2);
      var polishedData3 = polishData(rankedData3,"relativeInc5000");

      var graphData = {};
      graphData["raw"] = graphRawData;
      graphData["relative"] = polishedData2;
      graphData["relative2"] = polishedData3;

      return graphData;               
  }
}


const rankCities =  (cities) => {
      var years = d3.range(
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
  var  cityColor;

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
    var colorGroup = d3.scale.linear()
        .domain(d3.range(1,366,(366/9)))
        .range(colorbrewer.Spectral[9]);
    
    return colorGroup;
}

const sortCities =  (year) =>{
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

const sortMsaCities =  () =>{
    return function(a,b){
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
