#!/usr/bin/env node
"use strict";

require('es6-promise').polyfill();
require('isomorphic-fetch');
var fs = require('fs');
var d3 = require('d3');
var _ = require('lodash')

//Data about each MSA
var msaPop = JSON.parse(fs.readFileSync('../src/static/data/msaPop.json')); 
var msaName = JSON.parse(fs.readFileSync('../src/static/data/msaName.json')); 

//For MSA Name and containing state
var fipsToName = {"10": "Delaware","11": "District Of Columbia","12": "Florida","13": "Georgia","15": "Hawaii","16": "Idaho","17": "Illinois","18": "Indiana","19": "Iowa","20": "Kansas","21": "Kentucky","22": "Louisiana","23": "Maine","24": "Maryland","25": "Massachusetts","26": "Michigan","27": "Minnesota","28": "Mississippi","29": "Missouri","30": "Montana","31": "Nebraska","32": "Nevada","33": "New Hampshire","34": "New Jersey","35": "New Mexico","36": "New York","37": "North Carolina","38": "North Dakota","39": "Ohio","40": "Oklahoma","41": "Oregon","42": "Pennsylvania","44": "Rhode Island","45": "South Carolina","46": "South Dakota","47": "Tennessee","48": "Texas","49": "Utah","50": "Vermont","51": "Virginia","53": "Washington","54": "West Virginia","55": "Wisconsin","56": "Wyoming","60": "American Samoa","66": "Guam","69": "Northern Mariana Islands","72": "Puerto Rico","74": "Minor Outlying Islands","78": "Virgin Islands","02": "Alaska","01": "Alabama","06": "California","04": "Arizona","05": "Arkansas","08": "Colorado","09": "Connecticut"}
var abbrToFips = {"AL":"01","NE":"31","AK":"02","NV":"32","AZ":"04","NH":"33","AR":"05","NJ":"34","CA":"06","NM":"35","CO":"08","NY":"36","CT":"09","NC":"37","DE":"10","ND":"38","DC":"11","OH":"39","FL":"12","OK":"40","GA":"13","OR":"41","HI":"15","PA":"42","ID":"16","PR":"72","IL":"17","RI":"44","IN":"18","SC":"45","IA":"19","SD":"46","KS":"20","TN":"47","KY":"21","TX":"48","LA":"22","UT":"49","ME":"23","VT":"50","MD":"24","VA":"51","MA":"25","VI":"78","MI":"26","WA":"53","MN":"27","WV":"54","MS":"28","WI":"55","MO":"29","WY":"56","MT":"30"}

var qwiShareEmpFileNameBase = '../src/static/data/shareOfEmploymentInNewFirms-QWI_'

//Density Data
var densityData = JSON.parse(fs.readFileSync('../src/static/data/density_data.json')); 
var shareEmpNewFirmsQWI_All = 
      JSON.parse(fs.readFileSync(qwiShareEmpFileNameBase + 'AllSectors.json'))
var shareEmpNewFirmsQWI_HighTech = 
      JSON.parse(fs.readFileSync(qwiShareEmpFileNameBase + 'HighTech.json'))
var shareEmpNewFirmsQWI_ExceptAccomAndRetail = 
      JSON.parse(fs.readFileSync(qwiShareEmpFileNameBase + 'AllExceptAccommodationAndRetailSectors.json'))

var processedNewFirms = _processData({data:densityData,selectedMetric:"newValues"});
var processedShareEmpNewFirmsQWI_All = _processGeneral(shareEmpNewFirmsQWI_All,"qwiDensity");
var coloredShareEmpNewFirmsQWI_All = _polishData(processedShareEmpNewFirmsQWI_All['raw'],"qwiDensity");
var processedShareEmpNewFirmsQWI_HighTech = _processGeneral(shareEmpNewFirmsQWI_HighTech,"qwiDensity");
var coloredShareEmpNewFirmsQWI_HighTech = _polishData(processedShareEmpNewFirmsQWI_HighTech['raw'],"qwiDensity");
var processedShareEmpNewFirmsQWI_ExceptAccomAndRetail = _processGeneral(shareEmpNewFirmsQWI_ExceptAccomAndRetail,"qwiDensity");
var coloredShareEmpNewFirmsQWI_ExceptAccomAndRetail = _polishData(processedShareEmpNewFirmsQWI_ExceptAccomAndRetail['raw'],"qwiDensity");
var processedDensityComposite = _processComposite(processedNewFirms['relative'],coloredShareEmpNewFirmsQWI_All,coloredShareEmpNewFirmsQWI_HighTech,coloredShareEmpNewFirmsQWI_ExceptAccomAndRetail);


//Diversity Data
var opportunityData = JSON.parse(fs.readFileSync('../src/static/data/opportunity.json')); 
var foreignbornData = JSON.parse(fs.readFileSync('../src/static/data/foreignborn.json')); 
var empVarianceData = JSON.parse(fs.readFileSync('../src/static/data/empLocationQuotientVarianceAcrossSubsectors.json'));
var processedOpportunity = _processequalOpp(opportunityData)
var processedForeignborn = _processGeneral(foreignbornData,"foreignborn");
var specialization = _.mapValues(empVarianceData, dataByYear => _(dataByYear).pick(_.range(2002, 2017)).mapValues(index => index.hhi_2 * 100).value())
var processedEmpVariance = processGeneral2(specialization, true);
var coloredEmpVariance = _polishData(processedEmpVariance['raw'],"empVariance");
var processedDiversityComposite = _processDiversityComposite(processedOpportunity,processedForeignborn,coloredEmpVariance);

//Fluidity Data
var fluidityIrsData = JSON.parse(fs.readFileSync('../src/static/data/irsMigration.json')); 
var fluidityInc5000Data = JSON.parse(fs.readFileSync('../src/static/data/inc5000.json'));
var annualChurnData = JSON.parse(fs.readFileSync('../src/static/data/churn.json'));
var processedInc5000 = _processinc5000(fluidityInc5000Data,processedNewFirms['raw']);
var processedNetMigration = _processdetailMigration(fluidityIrsData,"irsNet");
var processedTotalMigration = _processdetailMigration(fluidityIrsData,"totalMigrationFlow");
var processedInflowMigration = _processdetailMigration(fluidityIrsData,"inflowMigration");
var processedOutflowMigration = _processdetailMigration(fluidityIrsData,"outflowMigration");
var processedAnnualChurn = processGeneral2(annualChurnData);
var coloredAnnualChurn = _polishData(processedAnnualChurn['raw'],"annualChurn")
var processedFluidityComposite = _processFluidityComposite(processedInc5000,processedNetMigration,processedTotalMigration,coloredAnnualChurn);

//Combined
var processedCombinedComposite = _processCombinedComposite(processedDensityComposite,processedDiversityComposite,processedFluidityComposite);

//Density
fs.writeFileSync("../src/static/data/processedNewFirms.json",JSON.stringify(processedNewFirms));
fs.writeFileSync("../src/static/data/processedShareEmp.json",JSON.stringify(coloredShareEmpNewFirmsQWI_All));
fs.writeFileSync("../src/static/data/processedShareEmpNewFirmsQWI_HighTech.json",JSON.stringify(coloredShareEmpNewFirmsQWI_HighTech));
fs.writeFileSync("../src/static/data/processedShareEmpNewFirmsQWI_ExceptAccomAndRetail.json",JSON.stringify(coloredShareEmpNewFirmsQWI_ExceptAccomAndRetail));
fs.writeFileSync("../src/static/data/processedDensityComposite.json",JSON.stringify(processedDensityComposite));

//Diversity
fs.writeFileSync("../src/static/data/processedOpportunity.json",JSON.stringify(processedOpportunity));
fs.writeFileSync("../src/static/data/processedForeignborn.json",JSON.stringify(processedForeignborn));
fs.writeFileSync("../src/static/data/processedEmpVariance.json",JSON.stringify(coloredEmpVariance));
fs.writeFileSync("../src/static/data/processedDiversityComposite.json",JSON.stringify(processedDiversityComposite));

//Fluidity
fs.writeFileSync("../src/static/data/processedInc5000.json",JSON.stringify(processedInc5000));
fs.writeFileSync("../src/static/data/processedNetMigration.json",JSON.stringify(processedNetMigration));
fs.writeFileSync("../src/static/data/processedTotalMigration.json",JSON.stringify(processedTotalMigration));
fs.writeFileSync("../src/static/data/processedInflowMigration.json",JSON.stringify(processedInflowMigration));
fs.writeFileSync("../src/static/data/processedOutflowMigration.json",JSON.stringify(processedOutflowMigration));
fs.writeFileSync("../src/static/data/processedAnnualChurn.json",JSON.stringify(coloredAnnualChurn));
fs.writeFileSync("../src/static/data/processedFluidityComposite.json",JSON.stringify(processedFluidityComposite));

//Combined
fs.writeFileSync("../src/static/data/processedCombinedComposite.json",JSON.stringify(processedCombinedComposite));


//Want to build an array of objects
//Each object will have its own file
//One object per MSA

Object.keys(msaPop).forEach(msaId => {

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
  curMsaObj['density']['shareEmpQWI_HighTech'] = {};
  curMsaObj['density']['shareEmpQWI_ExceptAccomAndRetail'] = {};
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
  coloredShareEmpNewFirmsQWI_All.forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['density']['shareEmp']['relative'] = metro;        
    }
  })
  processedShareEmpNewFirmsQWI_HighTech['raw'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['density']['shareEmpQWI_HighTech']['raw'] = metro;        
    }
  })
  processedShareEmpNewFirmsQWI_ExceptAccomAndRetail['raw'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['density']['shareEmpQWI_ExceptAccomAndRetail']['raw'] = metro;        
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
  curMsaObj['diversity']['empLQVariance'] = {};
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
  processedEmpVariance['raw'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['diversity']['empLQVariance']['raw'] = metro;        
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
  curMsaObj['fluidity']['churn'] = {};
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
  processedAnnualChurn['raw'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['fluidity']['churn']['raw'] = metro;        
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
  fs.writeFileSync("../src/static/data/metros/" + msaId + ".json",JSON.stringify(curMsaObj));   


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
function _rankCities(cities,dataset){
  if(dataset == "opportunity"){
    var years = ['lowIncome','highIncome','combined'];
  }
  else{
    var years = d3.range(
            [d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.x }); })],
            [d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.x }); })+1]
        );    
  }

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
          color:_colorFunction(data[metroArea],data,dataset)
        }

        city.values = data[metroArea].values.map(i => {
          //only place we can modify the annualchurn data
          if(dataset == "annualChurn"){
            return {
              x:i.x,
              y:(i.y * 100),
              rank:i.rank,
              raw:i.raw
            }
          }
          else{
            return {
              x:i.x,
              y:i.y,
              rank:i.rank,
              raw:i.raw
            }            
          }
             
        })   
        newData.push(city);           
    }
  });
  return newData;
}
function _colorFunction(params,data,dataset){
    var cityColor;

    if(params){
        if(dataset == "opportunity" && params.x && (params.x == "lowIncome" || params.x == "highIncome")){
            var color = _colorOppGroup(params.x);    
            cityColor = color(params.y);                             
        }
        else if(params.values && params.values.length > 0){
            var valueLength = params.values.length;
            var curRank = params.values[valueLength-1].y
            var color = _colorGroup(data,dataset);
            cityColor = color(curRank);   
        }
    }  

    return cityColor;
}
function _colorGroup(data,dataset){
  let valueArray = [];

  data.forEach(metro => {
    if(metro.values[metro.values.length-1]){
     valueArray.push(metro.values[metro.values.length-1].y)       
   }
  })

  if(dataset=="empVariance"){
    var _colorGroupScale = d3.scale.quantile()
        .domain(d3.range(d3.min(valueArray),d3.max(valueArray),((d3.max(valueArray)-d3.min(valueArray))/9)))
        .range((["#996b25", "#c58a30", "#dea44a", "#e2ae5e", "#b1bbcf", "#97a5bf", "#7d8faf", "#64728c", "#3e4757"]))      
  }
  else{
    var _colorGroupScale = d3.scale.quantile()
        .domain(d3.range(d3.min(valueArray),d3.max(valueArray),((d3.max(valueArray)-d3.min(valueArray))/9)))
        .range((["#996b25", "#c58a30", "#dea44a", "#e2ae5e", "#b1bbcf", "#97a5bf", "#7d8faf", "#64728c", "#3e4757"]).reverse())      
  }



  return _colorGroupScale;
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
function _processComposite(newFirms,share,highTech,noAccomRetail){

  var filteredShare = share.filter(metroArea => {
    metroArea.values = metroArea.values.filter(yearValue => {
      return yearValue.y >= 0;
    })
    return (metroArea.values.length > 0)
  })

  var filteredNewFirms = newFirms.filter(metroArea => {
    metroArea.values = metroArea.values.filter(yearValue => {
      return yearValue.y >= 0;
    })
    return (metroArea.values.length > 0);
  })

  var filteredHighTech = highTech.filter(metroArea => {
    metroArea.values = metroArea.values.filter(yearValue => {
      return yearValue.y >= 0;
    })
    return (metroArea.values.length > 0);
  })

  var filteredNoAccomRetail = noAccomRetail.filter(metroArea => {
    metroArea.values = metroArea.values.filter(yearValue => {
      return yearValue.y >= 0;
    })
    return (metroArea.values.length > 0);
  })




  var cityFilteredShare = [],
      cityFilteredNewFirms = [],
      cityFilteredHighTech = [],
      cityFilteredNoAccomRetail = [];

  for(var i=0; i<filteredShare.length; i++){
    for(var j=0; j<filteredNewFirms.length; j++){
      if(filteredShare[i].key == filteredNewFirms[j].key){
        for(var k=0; k<filteredHighTech.length; k++){
          if(filteredShare[i].key == filteredHighTech[k].key){
            for(var l=0; l<filteredNoAccomRetail.length; l++){
              if(filteredShare[i].key == filteredNoAccomRetail[l].key){
                cityFilteredShare.push(filteredShare[i]); 
                cityFilteredNewFirms.push(filteredNewFirms[j])
                cityFilteredHighTech.push(filteredHighTech[k]) 
                cityFilteredNoAccomRetail.push(filteredNoAccomRetail[l]);    
              }
            }                     
          }
        }
      }
    }
  }

  var shareYearRange = ([d3.min(cityFilteredShare, function(c) { return d3.min(c.values, function(v) { return v.x }); }),
                    d3.max(cityFilteredShare, function(c) { return d3.max(c.values, function(v) { return v.x }); })]                  )
  var newFirmsYearRange = ([d3.min(cityFilteredNewFirms, function(c) { return d3.min(c.values, function(v) { return v.x }); }),
                    d3.max(cityFilteredNewFirms, function(c) { return d3.max(c.values, function(v) { return v.x }); })])
  var highTechYearRange = ([d3.min(cityFilteredHighTech, function(c) { return d3.min(c.values, function(v) { return v.x }); }),
                    d3.max(cityFilteredHighTech, function(c) { return d3.max(c.values, function(v) { return v.x }); })])
  var noAccomRetailYearRange = ([d3.min(cityFilteredNoAccomRetail, function(c) { return d3.min(c.values, function(v) { return v.x }); }),
                    d3.max(cityFilteredNoAccomRetail, function(c) { return d3.max(c.values, function(v) { return v.x }); })])

  var minYear = d3.max([shareYearRange[0],newFirmsYearRange[0],highTechYearRange[0],noAccomRetailYearRange[0]])
  var maxYear = d3.min([shareYearRange[1],newFirmsYearRange[1],highTechYearRange[1],noAccomRetailYearRange[1]])

  var yearCityFilteredShare = _trimYears(([minYear,maxYear]),cityFilteredShare);
  var yearCityFilteredNewFirms = _trimYears(([minYear,maxYear]),cityFilteredNewFirms);
  var yearCityFilteredHighTech = _trimYears(([minYear,maxYear]),cityFilteredHighTech);
  var yearCityFilteredNoAccomRetail = _trimYears(([minYear,maxYear]),cityFilteredNoAccomRetail);

  yearCityFilteredShare.sort(_sortMsaCities());
  yearCityFilteredNewFirms.sort(_sortMsaCities());
  yearCityFilteredHighTech.sort(_sortMsaCities());
  yearCityFilteredNoAccomRetail.sort(_sortMsaCities());

  var compositeCityRanks = [];

  var shareScale = d3.scale.linear()
    .range([0,100])
    .domain([d3.min(yearCityFilteredShare, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
            d3.max(yearCityFilteredShare, function(c) { return d3.max(c.values, function(v) { return v.y }); })])

  var newFirmsScale = d3.scale.linear()
    .range([0,100])
    .domain([d3.min(yearCityFilteredNewFirms, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
            d3.max(yearCityFilteredNewFirms, function(c) { return d3.max(c.values, function(v) { return v.y }); })])

  var highTechScale = d3.scale.linear()
    .range([0,100])
    .domain([d3.min(yearCityFilteredHighTech, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
            d3.max(yearCityFilteredHighTech, function(c) { return d3.max(c.values, function(v) { return v.y }); })])

  //var noAccomRetailScale = d3.scale.linear()
    //.range([0,100])
    //.domain([d3.min(yearCityFilteredNoAccomRetail, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
            //d3.max(yearCityFilteredNoAccomRetail, function(c) { return d3.max(c.values, function(v) { return v.y }); })])




  for(var i=0; i<yearCityFilteredShare.length;i++){
    var resultValues = [],
      newFirmObj= {},
      highTechObj = {},
      noAccomRetailObj = {};

    for(var j=0; j<yearCityFilteredShare[i]['values'].length; j++){
      var curYear = yearCityFilteredShare[i]['values'][j].x

      for(var k = 0; k<yearCityFilteredNewFirms[i]['values'].length; k++){
        if(yearCityFilteredNewFirms[i]['values'][k].x == curYear){
          newFirmObj[curYear] = yearCityFilteredNewFirms[i]['values'][k].y
        }
      }
      if(!newFirmObj[curYear]){
        newFirmObj[curYear] = 0;
      }

      for(var k = 0; k<yearCityFilteredHighTech[i]['values'].length; k++){
        if(yearCityFilteredHighTech[i]['values'][k].x == curYear){
          highTechObj[curYear] = yearCityFilteredHighTech[i]['values'][k].y
        }
      }
      if(!highTechObj[curYear]){
        highTechObj[curYear] = 0;
      }  

      for(var k = 0; k<yearCityFilteredNoAccomRetail[i]['values'].length; k++){
        if(yearCityFilteredNoAccomRetail[i]['values'][k].x == curYear){
          noAccomRetailObj[curYear] = yearCityFilteredNoAccomRetail[i]['values'][k].y
        }
      }
      if(!noAccomRetailObj[curYear]){
        noAccomRetailObj[curYear] = 0;
      }  

      var compositeValue = (
        shareScale(yearCityFilteredShare[i].values[j].y) +      
        newFirmsScale(newFirmObj[curYear]) +
        highTechScale(highTechObj[curYear])
            )/3

      resultValues.push({x:curYear,y:compositeValue})      
    }
    compositeCityRanks.push({key:yearCityFilteredShare[i]['key'],values:resultValues})          
  }



  compositeCityRanks = _rankCities(compositeCityRanks);
  var graphData = _polishData(compositeCityRanks,"densityComposite");

  return graphData;
}

function _processequalOpp(data){
  var msaGains = {};


  //filter out null rows
  Object.keys(data).forEach(function(msaId){
      if(data[msaId]["highIncome"] !== null && data[msaId]["lowIncome"] !== null){
          msaGains[msaId] = {};
          msaGains[msaId] = data[msaId];
          msaGains[msaId]['combined'] = (msaGains[msaId]['lowIncome'] + msaGains[msaId]['highIncome'])/2 
      }

  })

  var finalData = _convertToCoordinateArray(msaGains,"opportunity");
  
  var rankedData = _rankCities(finalData,"opportunity");

  var polishedData = _polishData(rankedData,"opportunity");

  return polishedData;
}

function _convertToCoordinateArray(data,dataset){
    var finalData = [];
    if(dataset == 'inc5000'){
      var years = d3.range(1990,2016);      
    }
    else if(dataset == "qwiDensity"){
      var years = d3.range(1991,2016)
    }
    else{
      var years = d3.range(1990,2015);            
    }

    Object.keys(data).forEach(msaId => {
        var valueArray = [];

        if(dataset == 'opportunity'){
          Object.keys(data[msaId]).forEach(oppYear => {
            if(typeof data[msaId][oppYear] == "number"){
              valueArray.push( {x:oppYear,y:(+data[msaId][oppYear] * 100)});                 
            }
            else{
              valueArray.push( {x:+oppYear,y:null});   
            }
          })
        }
        else if (dataset == "qwiDensity"){
          years.forEach(year => {
              var curYear = year-1;
              if(typeof +data[msaId][year] == "number" && +data[msaId][year] > 0){
                valueArray.push( {x:+curYear,y:(+data[msaId][year] * 100)});                  
              }
          })
        }
        else{
          years.forEach(year => {
            if(dataset != "inc5000"){
              if(typeof +data[msaId][year] == "number"){
                valueArray.push( {x:+year,y:+Math.round(+data[msaId][year])});                   
              }
              else{
                valueArray.push( {x:+year,y:-1});            
              }
            }
            else{
              if(typeof +data[msaId][year] == "number"){
                valueArray.push( {x:+year,y:+data[msaId][year]});                  
              }
              else{
                valueArray.push( {x:+year,y:0});                  
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
  
  var years = d3.range(1990,(maxYear+1));

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
                newCoord = {x: year, y:(newY * 100)};                 
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
    var finalData = _convertToCoordinateArray(data,dataset);

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

function _processDiversityComposite(opportunity,foreignbornObj,empVariance){

  var foreignborn = foreignbornObj['relative'];

  var opp = opportunity.map((city) => {
    let newCity = {
      name:city.name,
      key:city.key,
      color:city.color,
      values:[]
    }
    var newValues = city.values.filter((value) => {
      return value.x == "combined"
    })
    newCity.values = newValues;
    return newCity;
  })

  var cityFilteredOpp = [],
      cityFilteredForeignborn = [],
      cityFilteredEmpVariance = [];
  var compositeCityRanks = [];

  for(var i=0; i<opp.length; i++){
    for(var j=0; j<foreignborn.length; j++){
      if(opp[i].key == foreignborn[j].key){
        for(var k=0; k< empVariance.length; k++){
          if(empVariance[k].key == opp[i].key){
            cityFilteredOpp.push(opp[i]); 
            cityFilteredForeignborn.push(foreignborn[j])
            cityFilteredEmpVariance.push(empVariance[k])
          }
        }
      }      
    }
  }



  cityFilteredForeignborn.forEach(metroArea => {
    metroArea.values = metroArea.values.filter(yearValue => {
      return yearValue.y >= 0;
    })
  })


  var foriegnBornyearRange = ([d3.min(cityFilteredForeignborn, function(c) { return d3.min(c.values, function(v) { return v.x }); }),
                    d3.max(cityFilteredForeignborn, function(c) { return d3.max(c.values, function(v) { return v.x }); })])
  var empVarianceyearRange = ([d3.min(cityFilteredEmpVariance, function(c) { return d3.min(c.values, function(v) { return v.x }); }),
                    d3.max(cityFilteredEmpVariance, function(c) { return d3.max(c.values, function(v) { return v.x }); })])





  var minYear = d3.max([foriegnBornyearRange[0],empVarianceyearRange[0]])
  var maxYear = d3.min([foriegnBornyearRange[1],empVarianceyearRange[1]])

  var yearCityFilteredForiegnBorn = _trimYears(([minYear,maxYear]),cityFilteredForeignborn);
  var yearCityFilteredEmpVariance = _trimYears(([minYear,maxYear]),cityFilteredEmpVariance);




  var oppScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(cityFilteredOpp, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                  d3.max(cityFilteredOpp, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                  )
  var foreignBornScale = d3.scale.linear()
  .range([0,100])
  .domain(      [d3.min(yearCityFilteredForiegnBorn, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                d3.max(yearCityFilteredForiegnBorn, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                )  

  var empVarianceScale = d3.scale.linear()
  .range([100,0])
  .domain(      [d3.min(yearCityFilteredEmpVariance, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                d3.max(yearCityFilteredEmpVariance, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                )  
  
  cityFilteredOpp.sort(_sortMsaCities());
  cityFilteredForeignborn.sort(_sortMsaCities());
  cityFilteredEmpVariance.sort(_sortMsaCities());

  for(var i=0; i<yearCityFilteredForiegnBorn.length;i++){
    var resultValues = [],
      empVarObj= {};

    for(var j=0; j<yearCityFilteredForiegnBorn[i]['values'].length; j++){
      var curYear = yearCityFilteredForiegnBorn[i]['values'][j].x

      for(var k = 0; k<yearCityFilteredEmpVariance[i]['values'].length; k++){
        if(yearCityFilteredEmpVariance[i]['values'][k].x == curYear){
          empVarObj[curYear] = yearCityFilteredEmpVariance[i]['values'][k].y
        }
      }
      if(!empVarObj[curYear]){
        empVarObj[curYear] = 0;
      }

      var compositeValue = (
        foreignBornScale(yearCityFilteredForiegnBorn[i].values[j].y) +      
        oppScale(cityFilteredOpp[i].values[0].y) +
        empVarianceScale(empVarObj[curYear]) 
            )/3

      resultValues.push({x:curYear,y:compositeValue})      
    }
    compositeCityRanks.push({key:yearCityFilteredForiegnBorn[i]['key'],values:resultValues})          
  }

  var filteredCityRanks = compositeCityRanks.filter(metro => {
    if(metro.values.length == 0){
      return false;
    }
    else{
      return true;
    }
  })



  compositeCityRanks = _rankCities(filteredCityRanks);
  var graphData = _polishData(compositeCityRanks,"diversityComposite");



  return graphData;
}

function _processinc5000(data,newFirms){

  var finalData = _convertToCoordinateArray(data,"inc5000");
  var rankedData = _rankCities(finalData);
  var polishedData = _polishData(rankedData,"inc5000");

  var totalEmp = {};

  var years = d3.range(2007,2014);

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


              if(totalEmp[metroArea.key] && totalEmp[metroArea.key]["values"][year] && curVal != -1){
                  var newY = +curVal / totalEmp[metroArea.key]["values"][year];
                  newCoord.y = (newY*100);
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
  var finalData = [];

  Object.keys(data).forEach(msaId => {
      var valueArray = [];
      Object.keys(data[msaId]).forEach(year => {
          if(typeof +data[msaId][year] == "number"){
              if(data[msaId][year]['outflow']){
                  if(year > 13){
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

function _processFluidityComposite(inc5000,irsNet,totalMigration,annualChurn){
  // ???
  var filteredRawInc = inc5000.raw.filter((/*metroArea*/) => {
    return true;
  })

  var filteredRelInc = inc5000.relative.filter(metroArea => {
    metroArea.values = metroArea.values.filter(yearValue => {
      return !(yearValue.y == null || yearValue.y == -1)
    })
    return (metroArea.values.length > 0)
  })


  var filteredIrsNet = irsNet['relative'].filter(metroArea => {
    metroArea.values = metroArea.values.filter(yearValue => {
      return !(yearValue.y == null || yearValue.y == -1)
    })
    return (metroArea.values.length > 0)
  })

  var filteredTotalMigrationFlow = totalMigration['relative'].filter(metroArea => {
    metroArea.values = metroArea.values.filter(yearValue => {
      return !(yearValue.y == null || yearValue.y == -1)
    })
    return (metroArea.values.length > 0);
  })

  var filteredAnnualChurn = annualChurn.filter(metroArea => {
    metroArea.values = metroArea.values.filter(yearValue => {
      return !(yearValue.y == null || yearValue.y == -1)
    })
    return (metroArea.values.length > 0);
  })



  var cityFilteredIrsNet = [],
      cityFilteredTotalMigrationFlow = [],
      cityFilteredRawInc = [],
      cityFilteredRelInc = [],
      cityFilteredAnnualChurn = [];

  for(var i=0; i<filteredIrsNet.length; i++){
    for(var j=0; j<filteredRawInc.length; j++){
      if(filteredIrsNet[i].key == filteredRawInc[j].key){
        for(var k=0; k<filteredRelInc.length; k++){
          if(filteredIrsNet[i].key == filteredRelInc[k].key){
            for(var l=0; l<filteredAnnualChurn.length; l++){
              if(filteredIrsNet[i].key == filteredAnnualChurn[l].key){
                cityFilteredIrsNet.push(filteredIrsNet[i]); 
                cityFilteredTotalMigrationFlow.push(filteredTotalMigrationFlow[i]);
                cityFilteredRawInc.push(filteredRawInc[j])
                cityFilteredRelInc.push(filteredRelInc[k])
                cityFilteredAnnualChurn.push(filteredAnnualChurn[l])
              }              
            }            
          }
        }
      }
    }
  }


  var compositeCityRanks = [];

  var irsNetYearRange = ([d3.min(cityFilteredIrsNet, function(c) { return d3.min(c.values, function(v) { return v.x }); }),
                    d3.max(cityFilteredIrsNet, function(c) { return d3.max(c.values, function(v) { return v.x }); })]
                    )
  var totalMigrationyearRange = ([d3.min(cityFilteredTotalMigrationFlow, function(c) { return d3.min(c.values, function(v) { return v.x }); }),
                    d3.max(cityFilteredTotalMigrationFlow, function(c) { return d3.max(c.values, function(v) { return v.x }); })])
  var rawIncyearRange = ([2007,
                  d3.max(cityFilteredRawInc, function(c) { return d3.max(c.values, function(v) { return v.x }); })])
  var relIncyearRange = ([2007,
                  d3.max(cityFilteredRelInc, function(c) { return d3.max(c.values, function(v) { return v.x }); })])
  
  var annualChurnYearRange = ([d3.min(cityFilteredAnnualChurn, function(c) { return d3.min(c.values, function(v) { return v.x }); }),
                    d3.max(cityFilteredAnnualChurn, function(c) { return d3.max(c.values, function(v) { return v.x }); })]
                    )


  var minYear = d3.max([irsNetYearRange[0],totalMigrationyearRange[0],rawIncyearRange[0],relIncyearRange[0],annualChurnYearRange[0]])
  var maxYear = d3.min([irsNetYearRange[1],totalMigrationyearRange[1],rawIncyearRange[1],relIncyearRange[1],annualChurnYearRange[1]])

  var yearCityFilteredIrsNet = _trimYears(([minYear,maxYear]),cityFilteredIrsNet);
  var yearCityFilteredTotalMigrationFlow = _trimYears(([minYear,maxYear]),cityFilteredTotalMigrationFlow);
  var yearCityFilteredRawInc = _trimYears(([minYear,maxYear]),cityFilteredRawInc);
  var yearCityFilteredRelInc = _trimYears(([minYear,maxYear]),cityFilteredRelInc);
  var yearCityFilteredAnnualChurn = _trimYears(([minYear,maxYear]),cityFilteredAnnualChurn);

  var irsNetScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(yearCityFilteredIrsNet, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                  d3.max(yearCityFilteredIrsNet, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                  )
  var totalMigrationScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(yearCityFilteredTotalMigrationFlow, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                  d3.max(yearCityFilteredTotalMigrationFlow, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                  )  
  var rawIncScale = d3.scale.linear()
  .range([0,100])
  .domain(      [d3.min(yearCityFilteredRawInc, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                d3.max(yearCityFilteredRawInc, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                )  
  var relIncScale = d3.scale.linear()
  .range([0,100])
  .domain(      [d3.min(yearCityFilteredRelInc, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                d3.max(yearCityFilteredRelInc, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                )  
  var annualChurnScale = d3.scale.linear()
  .range([0,100])
  .domain(      [d3.min(yearCityFilteredAnnualChurn, function(c) { return d3.min(c.values, function(v) { return v.y }); }),
                d3.max(yearCityFilteredAnnualChurn, function(c) { return d3.max(c.values, function(v) { return v.y }); })]
                )  

  yearCityFilteredIrsNet.sort(_sortMsaCities());
  yearCityFilteredTotalMigrationFlow.sort(_sortMsaCities());
  yearCityFilteredRawInc.sort(_sortMsaCities());
  yearCityFilteredRelInc.sort(_sortMsaCities());
  yearCityFilteredAnnualChurn.sort(_sortMsaCities());

  for(var i=0; i<yearCityFilteredIrsNet.length;i++){
    var resultValues = [];
    if(yearCityFilteredIrsNet[i].key == yearCityFilteredRawInc[i].key){
      var rawObj= {}
      var relObj = {}
      var churnObj = {}

      for(var j=0; j<yearCityFilteredIrsNet[i]['values'].length; j++){

        for(var k = 0; k<yearCityFilteredRawInc[i]['values'].length; k++){
          if(yearCityFilteredRawInc[i]['values'][k].x == yearCityFilteredIrsNet[i]['values'][j].x){
            rawObj[yearCityFilteredRawInc[i]['values'][k].x] = yearCityFilteredRawInc[i]['values'][k].y
            relObj[yearCityFilteredRawInc[i]['values'][k].x] = yearCityFilteredRelInc[i]['values'][k].y
          }
        }

        if(!rawObj[yearCityFilteredIrsNet[i]['values'][j].x]){
          rawObj[yearCityFilteredIrsNet[i]['values'][j].x] = 0;
          relObj[yearCityFilteredIrsNet[i]['values'][j].x] = 0;
        }

        for(var k = 0; k<yearCityFilteredAnnualChurn[i]['values'].length; k++){
          if(yearCityFilteredAnnualChurn[i]['values'][k].x == yearCityFilteredIrsNet[i]['values'][j].x){
            churnObj[yearCityFilteredAnnualChurn[i]['values'][k].x] = yearCityFilteredAnnualChurn[i]['values'][k].y
          }
        }

        if(!churnObj[yearCityFilteredIrsNet[i]['values'][j].x]){
          churnObj[yearCityFilteredIrsNet[i]['values'][j].x] = 0;
        }  
        resultValues.push({x:yearCityFilteredIrsNet[i].values[j].x,y:((irsNetScale(yearCityFilteredIrsNet[i].values[j].y) + totalMigrationScale(yearCityFilteredTotalMigrationFlow[i].values[j].y) + relIncScale(relObj[yearCityFilteredIrsNet[i]['values'][j].x])+ rawIncScale(rawObj[yearCityFilteredIrsNet[i]['values'][j].x]) + annualChurnScale(churnObj[yearCityFilteredIrsNet[i]['values'][j].x]))/5)})      
      }
      compositeCityRanks.push({key:yearCityFilteredIrsNet[i]['key'],values:resultValues})          
    }
  }


  compositeCityRanks = _rankCities(compositeCityRanks);
  var graphData = _polishData(compositeCityRanks,"fluidityComposite");
  return graphData;
}


/**
 * Parameter: data { msa: { year: <turnovrs> } }
 */
function processGeneral2 (data, sortNondescending) {

  //Begin: Helpers -----------------------------------------------------------
  const getRankingsByYear = data => {

    const byYearRankings = _.reduce(data, (acc, annualMeasureForMSA, msaCode) => {
      _.forEach(annualMeasureForMSA, (measureValue, year) => {
        (acc[year] || (acc[year] = [])).push({ msa: msaCode, value: measureValue })
      })

      return acc
    }, {})

    const comparator = (a,b) => {
      let aVal = (Number.isFinite(a.value)) ? a.value : Number.NEGATIVE_INFINITY
      let bVal = (Number.isFinite(b.value)) ? b.value : Number.NEGATIVE_INFINITY

      return ((sortNondescending ? -1 : 1) * (bVal - aVal))
    }


    // Sort (in-place) each year's list of {msa, value} objects.
    _.forEach(byYearRankings, msaMeasureArrForYear => msaMeasureArrForYear.sort(comparator))

    return byYearRankings
  }


  // For each year, create a table of MSA -> rank.
  const getMSAByYearRankingTables = byYearRankings => 
    _.mapValues(byYearRankings, (sortedMeasureForYear) => {

      let h = _.head(sortedMeasureForYear)
      let previousMeasureValue = h.value
      let rank = 1

      return _.reduce(_.tail(sortedMeasureForYear), (acc, d, i) => {
        // All MSAs with same measure value should be tied in rank.
        if (previousMeasureValue !== d.value) {
          // As we are using tail on a zero-indexed array, the ordinal # of an element is the index + 2.
          rank = (i + 2)
        }

        acc[d.msa] = rank
        previousMeasureValue = d.value

        return acc
      }, { [h.msa]: rank })
    })
  //End: Helpers -----------------------------------------------------------


  const rankingsByYear = getRankingsByYear(data)

  const msaByYearRankingTables = getMSAByYearRankingTables(rankingsByYear)

  // We order the metros in the output file by their ranking in the last year with data.
  const lastYearRankings = rankingsByYear[_.max(_.keys(rankingsByYear))].map(d => d.msa)

  return {
    raw : _.map(lastYearRankings, msa => ({
              key : msa,
              name: msaName[msa],
              values: _.sortBy(_.map(data[msa], (tovr, yr) => ({
                x: +yr, 
                y: tovr, 
                rank: msaByYearRankingTables[yr][msa],
              })),'x')
          }))
  }
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


  var cityFilteredDiversityYearRange = ([d3.min(cityFilteredDiversity, function(c) { return d3.min(c.values, function(v) { return v.x }); }),
                    d3.max(cityFilteredDiversity, function(c) { return d3.max(c.values, function(v) { return v.x }); })]
                    )
  var cityFilteredFluidityYearRange = ([d3.min(cityFilteredFluidity, function(c) { return d3.min(c.values, function(v) { return v.x }); }),
                    d3.max(cityFilteredFluidity, function(c) { return d3.max(c.values, function(v) { return v.x }); })])
  var cityFilteredDensityYearRange = ([d3.min(cityFilteredDensity, function(c) { return d3.min(c.values, function(v) { return v.x }); }),
                  d3.max(cityFilteredDensity, function(c) { return d3.max(c.values, function(v) { return v.x }); })])

  var minYear = d3.max([cityFilteredDiversityYearRange[0],cityFilteredFluidityYearRange[0],cityFilteredDensityYearRange[0]])
  var maxYear = d3.min([cityFilteredDiversityYearRange[1],cityFilteredFluidityYearRange[1],cityFilteredDensityYearRange[1]])

  var yearCityFilteredDiversity = _trimYears(([minYear,maxYear]),cityFilteredDiversity);
  var yearCityFilteredFluidity = _trimYears(([minYear,maxYear]),cityFilteredFluidity);
  var yearCityFilteredDensity = _trimYears(([minYear,maxYear]),cityFilteredDensity);




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

