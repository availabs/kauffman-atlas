"use strict";

require('es6-promise').polyfill();
require('isomorphic-fetch');
var fs = require('fs');
var colorbrewer = require('colorbrewer');
var d3 = require('d3');

//Data about each MSA
var msaPop = JSON.parse(fs.readFileSync('../src/static/data/msaPop.json')); 
var msaName = JSON.parse(fs.readFileSync('../src/static/data/msaName.json')); 

//For MSA Name and containing state
var fipsToName = {"10": "Delaware","11": "District Of Columbia","12": "Florida","13": "Georgia","15": "Hawaii","16": "Idaho","17": "Illinois","18": "Indiana","19": "Iowa","20": "Kansas","21": "Kentucky","22": "Louisiana","23": "Maine","24": "Maryland","25": "Massachusetts","26": "Michigan","27": "Minnesota","28": "Mississippi","29": "Missouri","30": "Montana","31": "Nebraska","32": "Nevada","33": "New Hampshire","34": "New Jersey","35": "New Mexico","36": "New York","37": "North Carolina","38": "North Dakota","39": "Ohio","40": "Oklahoma","41": "Oregon","42": "Pennsylvania","44": "Rhode Island","45": "South Carolina","46": "South Dakota","47": "Tennessee","48": "Texas","49": "Utah","50": "Vermont","51": "Virginia","53": "Washington","54": "West Virginia","55": "Wisconsin","56": "Wyoming","60": "American Samoa","66": "Guam","69": "Northern Mariana Islands","72": "Puerto Rico","74": "Minor Outlying Islands","78": "Virgin Islands","02": "Alaska","01": "Alabama","06": "California","04": "Arizona","05": "Arkansas","08": "Colorado","09": "Connecticut"}
var abbrToFips = {"AL":"01","NE":"31","AK":"02","NV":"32","AZ":"04","NH":"33","AR":"05","NJ":"34","CA":"06","NM":"35","CO":"08","NY":"36","CT":"09","NC":"37","DE":"10","ND":"38","DC":"11","OH":"39","FL":"12","OK":"40","GA":"13","OR":"41","HI":"15","PA":"42","ID":"16","PR":"72","IL":"17","RI":"44","IN":"18","SC":"45","IA":"19","SD":"46","KS":"20","TN":"47","KY":"21","TX":"48","LA":"22","UT":"49","ME":"23","VT":"50","MD":"24","VA":"51","MA":"25","VI":"78","MI":"26","WA":"53","MN":"27","WV":"54","MS":"28","WI":"55","MO":"29","WY":"56","MT":"30"}

//Density Data
var densityData = JSON.parse(fs.readFileSync('../src/static/data/density_data.json')); 
var processedNewFirms = _processData({data:densityData,selectedMetric:"newValues"});
var processedShareEmp = _processData({data:densityData,selectedMetric:"share"});
var processedDensityComposite = _processComposite(processedNewFirms['relative'],processedShareEmp['relative']);

//Diversity Data
var opportunityData = JSON.parse(fs.readFileSync('../src/static/data/opportunity.json')); 
var foreignbornData = JSON.parse(fs.readFileSync('../src/static/data/foreignborn.json')); 
var processedOpportunity = _processequalOpp(opportunityData)
var processedForeignborn = _processGeneral(foreignbornData,"foreignborn");
var processedDiversityComposite = _processDiversityComposite(processedOpportunity,processedForeignborn);

//Fluidity Data
var fluidityIrsData = JSON.parse(fs.readFileSync('../src/static/data/irsMigration.json')); 
var fluidityInc5000Data = JSON.parse(fs.readFileSync('../src/static/data/inc5000.json'));
var processedInc5000 = _processinc5000(fluidityInc5000Data,processedNewFirms['raw']);
var processedNetMigration = _processdetailMigration(fluidityIrsData,"irsNet");
var processedTotalMigration = _processdetailMigration(fluidityIrsData,"totalMigrationFlow");
var processedInflowMigration = _processdetailMigration(fluidityIrsData,"inflowMigration");
var processedOutflowMigration = _processdetailMigration(fluidityIrsData,"outflowMigration");
var processedFluidityComposite = _processFluidityComposite(processedInc5000,processedNetMigration,processedTotalMigration);

//Combined
var processedCombinedComposite = _processCombinedComposite(processedDensityComposite,processedDiversityComposite,processedFluidityComposite);

fs.writeFileSync("../src/static/data/processedNewFirms.json",JSON.stringify(processedNewFirms));
fs.writeFileSync("../src/static/data/processedShareEmp.json",JSON.stringify(processedShareEmp));
fs.writeFileSync("../src/static/data/processedDensityComposite.json",JSON.stringify(processedDensityComposite));

fs.writeFileSync("../src/static/data/processedOpportunity.json",JSON.stringify(processedOpportunity));
fs.writeFileSync("../src/static/data/processedForeignborn.json",JSON.stringify(processedForeignborn));
fs.writeFileSync("../src/static/data/processedDiversityComposite.json",JSON.stringify(processedDiversityComposite));

fs.writeFileSync("../src/static/data/processedInc5000.json",JSON.stringify(processedInc5000));
fs.writeFileSync("../src/static/data/processedNetMigration.json",JSON.stringify(processedNetMigration));
fs.writeFileSync("../src/static/data/processedTotalMigration.json",JSON.stringify(processedTotalMigration));
fs.writeFileSync("../src/static/data/processedInflowMigration.json",JSON.stringify(processedInflowMigration));
fs.writeFileSync("../src/static/data/processedOutflowMigration.json",JSON.stringify(processedOutflowMigration));
fs.writeFileSync("../src/static/data/processedFluidityComposite.json",JSON.stringify(processedFluidityComposite));

fs.writeFileSync("../src/static/data/processedCombinedComposite.json",JSON.stringify(processedCombinedComposite));


//Want to build an array of objects
//Each object will have its own file
//One object per MSA

var msaArray = [];

var thrice = 0;
Object.keys(msaPop).forEach(msaId => {
  if(thrice < 0){
    var curMsaObj = {};

    //Start of Population + name + statename
    curMsaObj['pop'] = msaPop[msaId];
    curMsaObj['name'] = msaName[msaId];
    curMsaObj['stateAbbr'] = [];
    curMsaObj['stateFips'] = [];
    curMsaObj['stateName'] = []; 

    if(msaName[msaId]){
      msaName[msaId].split(', ')[1].split('-').forEach(stateAbbr => {
        curMsaObj['stateAbbr'].push(stateAbbr);
        curMsaObj['stateFips'].push(abbrToFips[stateAbbr]);
        curMsaObj['stateName'].push(fipsToName[abbrToFips[stateAbbr]])    
      })    
    }
    //End of Population + name + statename

    //Start of density data
    curMsaObj['density'] = {};
    curMsaObj['density']['newFirms'] = {};
    curMsaObj['density']['shareEmp'] = {};
    curMsaObj['density']['composite'];

    processedNewFirms['raw'].forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['density']['newFirms']['raw'] = metro;        
      }
    })
    processedNewFirms['relative'].forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['density']['newFirms']['relative'] = metro;        
      }
    })
    processedShareEmp['raw'].forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['density']['shareEmp']['raw'] = metro;        
      }
    })
    processedShareEmp['relative'].forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['density']['shareEmp']['relative'] = metro;        
      }
    })
    processedDensityComposite.forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['density']['composite'] = metro;        
      }
    })
    //End of density data

    //Start of Diversity Data
    curMsaObj['diversity'] = {};
    curMsaObj['diversity']['opportunity'];
    curMsaObj['diversity']['foreignborn'] = {};
    curMsaObj['diversity']['composite'];

    processedOpportunity.forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['diversity']['opportunity'] = metro;        
      }
    })
    processedForeignborn['raw'].forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['diversity']['foreignborn']['raw'] = metro;        
      }
    })
    processedForeignborn['relative'].forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['diversity']['foreignborn']['relative'] = metro;        
      }
    })
    processedDiversityComposite.forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['diversity']['composite'] = metro;        
      }
    })
    //End of Diversity Data

    //Start of Fluidity Data
    curMsaObj['fluidity'] = {};
    curMsaObj['fluidity']['highGrowth'] = {};
    curMsaObj['fluidity']['netMigration'] = {};
    curMsaObj['fluidity']['totalMigration'] = {};
    curMsaObj['fluidity']['inflowMigration'] = {};
    curMsaObj['fluidity']['outflowMigration'] = {};
    curMsaObj['fluidity']['composite'];

    processedInc5000['raw'].forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['fluidity']['highGrowth']['raw'] = metro;        
      }
    })
    processedInc5000['relative'].forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['fluidity']['highGrowth']['relative'] = metro;        
      }
    })
    processedNetMigration['raw'].forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['fluidity']['netMigration']['raw'] = metro;        
      }
    })
    processedNetMigration['relative'].forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['fluidity']['netMigration']['relative'] = metro;        
      }
    })
    processedTotalMigration['raw'].forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['fluidity']['totalMigration']['raw'] = metro;        
      }
    })
    processedTotalMigration['relative'].forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['fluidity']['totalMigration']['relative'] = metro;        
      }
    })
    processedInflowMigration['raw'].forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['fluidity']['inflowMigration']['raw'] = metro;        
      }
    })
    processedInflowMigration['relative'].forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['fluidity']['inflowMigration']['relative'] = metro;        
      }
    })
    processedOutflowMigration['raw'].forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['fluidity']['outflowMigration']['raw'] = metro;        
      }
    })
    processedOutflowMigration['relative'].forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['fluidity']['outflowMigration']['relative'] = metro;        
      }
    })
    processedFluidityComposite.forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['fluidity']['composite'] = metro;        
      }
    })
    //End of Fluidity Data

    //Start of Combined
    curMsaObj['combined'] = {};
    curMsaObj['combined']['composite'];
    processedCombinedComposite.forEach(metro => {
      if(metro.key == msaId){
        curMsaObj['combined']['composite'] = metro;        
      }
    })
    //End of Combined



    //Writing to File
    fs.writeFileSync("data/metros/" + msaId + ".json",JSON.stringify(curMsaObj));   
  }
  thrice++;
})


//Processing Functions

function _processData(props) {
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
              if(!newFirmData[metroAreaId][rowData["year2"]]){
                  newFirmData[metroAreaId][rowData["year2"]] = {};
              } 
              if(dataset == "newValues"){
                newFirmData[metroAreaId][rowData["year2"]][firmAge] = rowData["firms"];                      
              }
              else{                       
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
      var curRelativeCoord={"x":+year,"y":-1},
          curRawCoord={"x":+year,"y":-1},
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
          if(msaPop[msaId] && msaPop[msaId][year]){
            pop = msaPop[msaId][year];
            pop1000 = (pop/1000);                   
          }
          else{
            pop1000=0;
          }

          if(pop1000 == 0){
            newPer1000 = -1;
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
function _rankCities(cities){
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
function _polishData(data,dataset){
  var newData = [];

  Object.keys(data).forEach(metroArea => {
    var name = "undefined";
    if(msaName[data[metroArea].key]){
      name = msaName[data[metroArea].key]
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
function _colorFunction(params,dataset){
    var cityColor;

    if(params){
        if(dataset == "opportunity" && params.x){
            var color = _colorOppGroup(params.x);    
            cityColor = color(params.y);                             
        }
        else if(params.values && params.values.length > 0){
            var valueLength = params.values.length;
            var curRank = params.values[valueLength-1].rank
            var color = _colorGroup();
            cityColor = color(curRank);   
        }
    }  

    return cityColor;
}
function _colorGroup(){
    var _colorGroup = d3.scale.quantile()
        .domain(d3.range(1,366,(366/9)))
        .range(["#996b25", "#c58a30", "#dea44a", "#e2ae5e", "#b1bbcf", "#97a5bf", "#7d8faf", "#64728c", "#3e4757"]) 
    
    return _colorGroup;
}
function _colorOppGroup(group){
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
function _sortCities(year){

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
function _sortMsaCities(){
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
function _processComposite(newFirms,share){

  var filteredShare = share.map(metroArea => {
    metroArea.values = metroArea.values.filter(yearValue => {
      return yearValue.y >= 0;
    })
    return metroArea
  })

  var filteredNewFirms = newFirms.map(metroArea => {
    metroArea.values = metroArea.values.filter(yearValue => {
      return yearValue.y >= 0;
    })
    return metroArea;
  })

  filteredShare.sort(_sortMsaCities());
  filteredNewFirms.sort(_sortMsaCities());

  var compositeCityRanks = [];

  var newFirmScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(filteredNewFirms, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                  d3.max(filteredNewFirms, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                  )

  var shareScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(filteredShare, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                  d3.max(filteredShare, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                  )

  filteredNewFirms.forEach(newFirmItem => {
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

  var filteredCityRanks = compositeCityRanks.filter(metro => {
    if(metro.values.length == 0){
      return false;
    }
    else{
      return true;
    }
  })


  compositeCityRanks = _rankCities(filteredCityRanks);
  var graphData = _polishData(compositeCityRanks,"densityComposite");

  return graphData;
}

function _processequalOpp(data){
  var msaGains = {};


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

function _convertToCoordinateArray(data,dataset){
    var finalData = [];
    var years = d3.range(1990,2013);

    Object.keys(data).forEach(msaId => {
        var valueArray = [];

        if(dataset == 'opportunity'){
          Object.keys(data[msaId]).forEach(oppYear => {
            if(data[msaId][oppYear]){
              valueArray.push( {x:oppYear,y:+data[msaId][oppYear]});                 
            }
            else{
              valueArray.push( {x:+oppYear,y:null});   
            }
          })
        }
        else{
          years.forEach(year => {
            if(dataset != "inc5000"){
              if(data[msaId][year]){
                valueArray.push( {x:+year,y:+Math.round(+data[msaId][year])});                   
              }
              else{
                valueArray.push( {x:+year,y:-1});            
              }
            }
            else{
              if(data[msaId][year]){
                valueArray.push( {x:+year,y:+data[msaId][year]});                  
              }
              else{
                valueArray.push( {x:+year,y:-1});                  
              }
            }           
          })          
        }


        if(valueArray.length != 0){
         finalData.push({key:msaId,values:valueArray,area:false});                
        }
    })

    return finalData;
}

function _relativeAgainstPopulation(graphRawData){
  var maxYear = d3.max(graphRawData, function(c) { return d3.max(c.values, function(v) { return v.x }); })
  
  var years = d3.range(1990,2013);

  var graphRelativeData = graphRawData.map(metroArea => {
      var newValues = [];

      years.forEach(year => {
        var newCoord = {x:year, y:-1};
        var curVal = -1;

        metroArea.values.forEach(yearVal => {
          if(yearVal.x == year){
            curVal = yearVal.y
          }
        })

        if(msaPop[metroArea.key]){
            if(msaPop[metroArea.key][year]){
              if(curVal != -1){
                var newY = curVal / msaPop[metroArea.key][year];
                newCoord = {x: year, y:newY};                 
              }              
            }
        }
        newValues.push(newCoord);   
      })

      return ({key:metroArea.key,values:newValues,area:false});                
  })

  return graphRelativeData;
}

function _processGeneral(data,dataset){
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

function _trimYears(years,cities){

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

function _processDiversityComposite(opportunity,foreignbornObj){

  var foreignborn = foreignbornObj['relative'];

  var lowOpp = opportunity.map((city) => {
    var newValues = city.values.filter((value) => {
      return value.x == "lowIncome"
    })

    return {color:city.color,key:city.key,name:city.name,values:newValues}

  })
  var highOpp = opportunity.map((city) => {
    var newValues = city.values.filter((value) => {
      return value.x == "highIncome"
    })

    return {color:city.color,key:city.key,name:city.name,values:newValues}

  })

  var cityFilteredLowOpp = [],
      cityFilteredHighOpp = [],
      cityFilteredForeignborn = [];
  var compositeCityRanks = [];

  for(var i=0; i<lowOpp.length; i++){
    for(var j=0; j<foreignborn.length; j++){
      if(lowOpp[i].key == foreignborn[j].key){
        cityFilteredLowOpp.push(lowOpp[i]); 
        cityFilteredHighOpp.push(highOpp[i]);
        cityFilteredForeignborn.push(foreignborn[j])
      }      
    }
  }

  cityFilteredLowOpp.sort(_sortMsaCities());
  cityFilteredHighOpp.sort(_sortMsaCities());
  cityFilteredForeignborn.sort(_sortMsaCities());

  cityFilteredForeignborn.forEach(metroArea => {
    metroArea.values = metroArea.values.filter(yearValue => {
      return yearValue.y >= 0;
    })
  })

  var lowOppScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(cityFilteredLowOpp, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                  d3.max(cityFilteredLowOpp, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                  )
  var highOppScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(cityFilteredHighOpp, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                  d3.max(cityFilteredHighOpp, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                  )  
  var foreignBornScale = d3.scale.linear()
  .range([0,100])
  .domain(      [d3.min(cityFilteredForeignborn, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                d3.max(cityFilteredForeignborn, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                )  




  for(var i=0; i<cityFilteredForeignborn.length;i++){
    var resultValues = [];
    if(cityFilteredForeignborn[i].key == cityFilteredLowOpp[i].key){
      if(cityFilteredHighOpp[i].values.length > 0 && cityFilteredLowOpp[i].values.length > 0){
        for(var j=0; j<cityFilteredForeignborn[i]['values'].length; j++){
          //console.log( foreignBornScale(cityFilteredForeignborn[i].values[j].y), highOppScale(cityFilteredHighOpp[i].values[0].y), lowOppScale(cityFilteredLowOpp[i].values[0].y))
          resultValues.push({x:cityFilteredForeignborn[i].values[j].x,y:((foreignBornScale(cityFilteredForeignborn[i].values[j].y) + highOppScale(cityFilteredHighOpp[i].values[0].y) + lowOppScale(cityFilteredLowOpp[i].values[0].y))/3)})      
        }         
      }

      compositeCityRanks.push({key:cityFilteredForeignborn[i]['key'],values:resultValues})          
    }
  }


  var filteredCityRanks = compositeCityRanks.filter(metro => {
    if(metro.values.length == 0){
      return false;
    }
    else{
      return true;
    }
  })

  //console.log(compositeCityRanks[0]);

  compositeCityRanks = _rankCities(filteredCityRanks);
  var graphData = _polishData(compositeCityRanks,"diversityComposite");



  return graphData;
}

function _processinc5000(data,newFirms){

  var finalData = _convertToCoordinateArray(data,"inc5000");
  var rankedData = _rankCities(finalData);
  var polishedData = _polishData(rankedData,"inc5000");

  var totalEmp = {};

  var years = d3.range(1990,2013);

  newFirms.forEach(city => {

      //Iterating through every year within a metro area
      var valueObject = {};
      Object.keys(city.values).forEach(yearValue => {
          //Want to return: x:year y:percent
          valueObject[city.values[yearValue].x] = null;
          valueObject[city.values[yearValue].x] = city.values[yearValue].y;
      })

      //Only return once per metroArea
      totalEmp[city.key] = {key:city.key,values:valueObject,area:false};                    
  })

  var graphRawData = polishedData;

  var graphRelativeData = graphRawData.map(metroArea => {

      var newValues = years.map(year => {
              var newCoord = {x:year, y:null};
              var curVal = null;

              metroArea.values.forEach(yearValue => {
                if(yearValue.x == year){
                  curVal = yearValue.y
                }
              })              


              if(totalEmp[metroArea.key] && totalEmp[metroArea.key]["values"][year] && curVal != null){
                  var newY = +curVal / totalEmp[metroArea.key]["values"][year];
                  newCoord.y = newY;
              }
              return newCoord;
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

function _processdetailMigration(data,dataset){
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
          else{
            valueArray.push({x:+curYear,y:null});                    
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

function _processFluidityComposite(inc5000,irsNet,totalMigration){

  var filteredRawInc = inc5000.raw.map(metroArea => {
    metroArea.values = metroArea.values.filter(yearValue => {
      return !(yearValue.y == null || yearValue.y == -1)
    })
    return metroArea
  })

  var filteredRelInc = inc5000.relative.map(metroArea => {
    metroArea.values = metroArea.values.filter(yearValue => {
      return !(yearValue.y == null || yearValue.y == -1)
    })
    return metroArea;
  })

  var filteredIrsNet = irsNet['relative'].map(metroArea => {
    metroArea.values = metroArea.values.filter(yearValue => {
      return !(yearValue.y == null || yearValue.y == -1)
    })
    return metroArea
  })

  var filteredTotalMigrationFlow = totalMigration['relative'].map(metroArea => {
    metroArea.values = metroArea.values.filter(yearValue => {
      return !(yearValue.y == null || yearValue.y == -1)
    })
    return metroArea;
  })





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
            console.log(cityFilteredIrsNet[i].values.length,cityFilteredTotalMigrationFlow[i].values.length,cityFilteredRawInc[i].values.length,cityFilteredRelInc[i].values.length)

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

function _processCombinedComposite(density,diversity,fluidity){
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
      if(yearCityFilteredDiversity[i].values.length > 0){
      for(var j=0; j<yearCityFilteredDensity[i]['values'].length; j++){
        resultValues.push({x:yearCityFilteredDensity[i].values[j].x,y:((densityScale(yearCityFilteredDensity[i].values[j].y) + fluidityScale(yearCityFilteredFluidity[i].values[j].y)+ diversityScale(yearCityFilteredDiversity[i].values[j].y))/3)})      
      }         
      }

      compositeCityRanks.push({key:yearCityFilteredDensity[i]['key'],values:resultValues})          
    }
  }

  compositeCityRanks = _rankCities(compositeCityRanks);
  var graphData = _polishData(compositeCityRanks,"fluidityComposite");

  return graphData;
}