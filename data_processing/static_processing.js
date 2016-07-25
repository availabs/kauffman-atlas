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
var empVarianceData = JSON.parse(fs.readFileSync('../src/static/data/economySpecializationStatistics.json'));
var processedOpportunity = _processequalOpp(opportunityData)
var processedForeignborn = _processGeneral(foreignbornData,"foreignborn");
var empVariances = _.mapValues(empVarianceData, dataByYear => _.mapValues(dataByYear, index => index.lqEmpVariance))
var processedEmpVariance = processGeneral2(empVariances, true);
var coloredEmpVariance = _polishData(processedEmpVariance['raw'],"empVariance");
var empHHIValues =  _.mapValues(empVarianceData, dataByYear => _.mapValues(dataByYear, index => (index.hhi_2 * 10000)))
var processedEmpHHI = processGeneral2(empHHIValues, true);
var coloredEmpHHI = _polishData(processedEmpHHI['raw'],"empHHI");
var processedDiversityComposite = _processDiversityComposite(processedOpportunity,processedForeignborn,coloredEmpVariance,coloredEmpHHI);


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
fs.writeFileSync("../src/static/data/processedEmpHHI.json",JSON.stringify(coloredEmpHHI));
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

var natObj = {};

natObj['pop'] = {};
natObj['name'] = "National";
natObj['stateAbbr'] = ["U.S.A"];
natObj['stateFips'] = ["00"];
natObj['stateName'] = ["U.S.A"]; 
natObj['count'] = 0

natObj['density'] = {};
natObj['density']['newFirms'] = {};
natObj['density']['newFirms']['raw'] = {};
natObj['density']['newFirms']['raw']['values'] = [];
natObj['density']['newFirms']['relative'] = {};
natObj['density']['newFirms']['relative']['values'] = [];
natObj['density']['shareEmp'] = {};
natObj['density']['shareEmp']['relative'] = {};
natObj['density']['shareEmp']['relative']['values'] = [];
natObj['density']['shareEmpQWI_HighTech'] = {};
natObj['density']['shareEmpQWI_HighTech']['raw'] = {};
natObj['density']['shareEmpQWI_HighTech']['raw']['values'] = [];
natObj['density']['shareEmpQWI_ExceptAccomAndRetail'] = {};
natObj['density']['shareEmpQWI_ExceptAccomAndRetail']['raw'] = {};
natObj['density']['shareEmpQWI_ExceptAccomAndRetail']['raw']['values'] = [];
natObj['density']['composite'] = {};
natObj['density']['composite']['values'] = [];

natObj['diversity'] = {};
natObj['diversity']['opportunity'] = {};
natObj['diversity']['opportunity']['values'] = [];
natObj['diversity']['foreignborn'] = {};
natObj['diversity']['foreignborn']['raw'] = {};
natObj['diversity']['foreignborn']['raw']['values'] = [];
natObj['diversity']['foreignborn']['relative'] = {};
natObj['diversity']['foreignborn']['relative']['values'] = [];
natObj['diversity']['empLQVariance'] = {};
natObj['diversity']['empLQVariance']['raw'] = {};
natObj['diversity']['empLQVariance']['raw']['values'] = [];
natObj['diversity']['empHHI'] = {};
natObj['diversity']['empHHI']['raw'] = {};
natObj['diversity']['empHHI']['raw']['values'] = [];
natObj['diversity']['composite'] = {};
natObj['diversity']['composite']['values'] = [];

natObj['fluidity'] = {};
natObj['fluidity']['highGrowth'] = {};
natObj['fluidity']['highGrowth']['raw'] = {};
natObj['fluidity']['highGrowth']['raw']['values'] = [];
natObj['fluidity']['highGrowth']['relative'] = {};
natObj['fluidity']['highGrowth']['relative']['values'] = [];
natObj['fluidity']['netMigration'] = {};
natObj['fluidity']['netMigration']['raw'] = {};
natObj['fluidity']['netMigration']['raw']['values'] = [];
natObj['fluidity']['netMigration']['relative'] = {};
natObj['fluidity']['netMigration']['relative']['values'] = [];
natObj['fluidity']['totalMigration'] = {};
natObj['fluidity']['totalMigration']['raw'] = {};
natObj['fluidity']['totalMigration']['raw']['values'] = [];
natObj['fluidity']['totalMigration']['relative'] = {};
natObj['fluidity']['totalMigration']['relative']['values'] = [];
natObj['fluidity']['inflowMigration'] = {};
natObj['fluidity']['inflowMigration']['raw'] = {};
natObj['fluidity']['inflowMigration']['raw']['values'] = [];
natObj['fluidity']['inflowMigration']['relative'] = {};
natObj['fluidity']['inflowMigration']['relative']['values'] = [];
natObj['fluidity']['outflowMigration'] = {};
natObj['fluidity']['outflowMigration']['raw'] = {};
natObj['fluidity']['outflowMigration']['raw']['values'] = [];
natObj['fluidity']['outflowMigration']['relative'] = {};
natObj['fluidity']['outflowMigration']['relative']['values'] = [];
natObj['fluidity']['churn'] = {};
natObj['fluidity']['churn']['raw'] = {};
natObj['fluidity']['churn']['raw']['values'] = [];
natObj['fluidity']['composite'] = {};
natObj['fluidity']['composite']['values'] = [];

natObj['combined'] = {};
natObj['combined']['composite'] = {};
natObj['combined']['composite']['values'] = [];

natObj['density']['newFirms']['raw']['key'] = "national";
natObj['density']['newFirms']['relative']['key'] = "national"
natObj['density']['shareEmp']['relative']['key'] = "national"
natObj['density']['shareEmpQWI_HighTech']['raw']['key'] = "national"
natObj['density']['shareEmpQWI_ExceptAccomAndRetail']['raw']['key'] = "national"
natObj['density']['composite']['key'] = "national"
natObj['diversity']['opportunity']['key'] = "national"
natObj['diversity']['foreignborn']['raw']['key'] = "national"
natObj['diversity']['foreignborn']['relative']['key'] = "national"
natObj['diversity']['empLQVariance']['raw']['key'] = "national"
natObj['diversity']['empHHI']['raw']['key'] = "national"
natObj['diversity']['composite']['key'] = "national"
natObj['fluidity']['highGrowth']['raw']['key'] = "national"
natObj['fluidity']['highGrowth']['relative']['key'] = "national"
natObj['fluidity']['netMigration']['raw']['key'] = "national"
natObj['fluidity']['netMigration']['relative']['key'] = "national"
natObj['fluidity']['totalMigration']['raw']['key'] = "national"
natObj['fluidity']['totalMigration']['relative']['key'] = "national"
natObj['fluidity']['inflowMigration']['raw']['key'] = "national"
natObj['fluidity']['inflowMigration']['relative']['key'] = "national"
natObj['fluidity']['outflowMigration']['raw']['key'] = "national"
natObj['fluidity']['outflowMigration']['relative']['key'] = "national"
natObj['fluidity']['churn']['raw']['key'] = "national"
natObj['fluidity']['composite']['key'] = "national"
natObj['combined']['composite']['key'] = "national";

natObj['density']['newFirms']['raw']['name'] = "National";
natObj['density']['newFirms']['relative']['name'] = "National"
natObj['density']['shareEmp']['relative']['name'] = "National"
natObj['density']['shareEmpQWI_HighTech']['raw']['name'] = "National"
natObj['density']['shareEmpQWI_ExceptAccomAndRetail']['raw']['name'] = "National"
natObj['density']['composite']['name'] = "National"
natObj['diversity']['opportunity']['name'] = "National"
natObj['diversity']['foreignborn']['raw']['name'] = "National"
natObj['diversity']['foreignborn']['relative']['name'] = "National"
natObj['diversity']['empLQVariance']['raw']['name'] = "National"
natObj['diversity']['empHHI']['raw']['name'] = "National"
natObj['diversity']['composite']['name'] = "National"
natObj['fluidity']['highGrowth']['raw']['name'] = "National"
natObj['fluidity']['highGrowth']['relative']['name'] = "National"
natObj['fluidity']['netMigration']['raw']['name'] = "National"
natObj['fluidity']['netMigration']['relative']['name'] = "National"
natObj['fluidity']['totalMigration']['raw']['name'] = "National"
natObj['fluidity']['totalMigration']['relative']['name'] = "National"
natObj['fluidity']['inflowMigration']['raw']['name'] = "National"
natObj['fluidity']['inflowMigration']['relative']['name'] = "National"
natObj['fluidity']['outflowMigration']['raw']['name'] = "National"
natObj['fluidity']['outflowMigration']['relative']['name'] = "National"
natObj['fluidity']['churn']['raw']['name'] = "National"
natObj['fluidity']['composite']['name'] = "National"
natObj['combined']['composite']['name'] = "National";


natObj['density']['newFirms']['raw']['color'] = "#000";
natObj['density']['newFirms']['relative']['color'] = "#000"
natObj['density']['shareEmp']['relative']['color'] = "#000"
natObj['density']['shareEmpQWI_HighTech']['raw']['color'] = "#000"
natObj['density']['shareEmpQWI_ExceptAccomAndRetail']['raw']['color'] = "#000"
natObj['density']['composite']['color'] = "#000"
natObj['diversity']['opportunity']['color'] = "#000"
natObj['diversity']['foreignborn']['raw']['color'] = "#000"
natObj['diversity']['foreignborn']['relative']['color'] = "#000"
natObj['diversity']['empLQVariance']['raw']['color'] = "#000"
natObj['diversity']['empHHI']['raw']['color'] = "#000"
natObj['diversity']['composite']['color'] = "#000"
natObj['fluidity']['highGrowth']['raw']['color'] = "#000"
natObj['fluidity']['highGrowth']['relative']['color'] = "#000"
natObj['fluidity']['netMigration']['raw']['color'] = "#000"
natObj['fluidity']['netMigration']['relative']['color'] = "#000"
natObj['fluidity']['totalMigration']['raw']['color'] = "#000"
natObj['fluidity']['totalMigration']['relative']['color'] = "#000"
natObj['fluidity']['inflowMigration']['raw']['color'] = "#000"
natObj['fluidity']['inflowMigration']['relative']['color'] = "#000"
natObj['fluidity']['outflowMigration']['raw']['color'] = "#000"
natObj['fluidity']['outflowMigration']['relative']['color'] = "#000"
natObj['fluidity']['churn']['raw']['color'] = "#000"
natObj['fluidity']['composite']['color'] = "#000"
natObj['combined']['composite']['color'] = "#000";


Object.keys(msaPop).forEach(msaId => {

  var curMsaObj = {};

  //Start of Population + name + statename
  curMsaObj['pop'] = msaPop[msaId];
  curMsaObj['name'] = msaName[msaId];
  curMsaObj['stateAbbr'] = [];
  curMsaObj['stateFips'] = [];
  curMsaObj['stateName'] = []; 

  Object.keys(msaPop[msaId]).forEach(year => {
    if(!natObj['pop'][year]){
      natObj['pop'][year] = 0;
    }
    natObj['pop'][year] += msaPop[msaId][year];
  })

  natObj['count'] += 1;


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

      metro.values.forEach(yearVal => {
        if(!natObj['density']['newFirms']['raw']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['density']['newFirms']['raw']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['density']['newFirms']['raw']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['density']['newFirms']['raw']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['density']['newFirms']['raw']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  processedNewFirms['relative'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['density']['newFirms']['relative'] = metro;  

      metro.values.forEach(yearVal => {
        if(!natObj['density']['newFirms']['relative']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['density']['newFirms']['relative']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['density']['newFirms']['relative']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['density']['newFirms']['relative']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['density']['newFirms']['relative']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  coloredShareEmpNewFirmsQWI_All.forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['density']['shareEmp']['relative'] = metro;        


      metro.values.forEach(yearVal => {
        if(!natObj['density']['shareEmp']['relative']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['density']['shareEmp']['relative']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['density']['shareEmp']['relative']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['density']['shareEmp']['relative']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['density']['shareEmp']['relative']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  processedShareEmpNewFirmsQWI_HighTech['raw'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['density']['shareEmpQWI_HighTech']['raw'] = metro;        

      metro.values.forEach(yearVal => {
        if(!natObj['density']['shareEmpQWI_HighTech']['raw']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['density']['shareEmpQWI_HighTech']['raw']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['density']['shareEmpQWI_HighTech']['raw']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['density']['shareEmpQWI_HighTech']['raw']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['density']['shareEmpQWI_HighTech']['raw']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  processedShareEmpNewFirmsQWI_ExceptAccomAndRetail['raw'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['density']['shareEmpQWI_ExceptAccomAndRetail']['raw'] = metro;      

      metro.values.forEach(yearVal => {
        if(!natObj['density']['shareEmpQWI_ExceptAccomAndRetail']['raw']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['density']['shareEmpQWI_ExceptAccomAndRetail']['raw']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['density']['shareEmpQWI_ExceptAccomAndRetail']['raw']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['density']['shareEmpQWI_ExceptAccomAndRetail']['raw']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['density']['shareEmpQWI_ExceptAccomAndRetail']['raw']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  processedDensityComposite.forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['density']['composite'] = metro;        
      metro.values.forEach(yearVal => {
        if(!natObj['density']['composite']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['density']['composite']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['density']['composite']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['density']['composite']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['density']['composite']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  //End of density data


  //Start of Diversity Data
  curMsaObj['diversity'] = {};
  curMsaObj['diversity']['opportunity'];
  curMsaObj['diversity']['foreignborn'] = {};
  curMsaObj['diversity']['empLQVariance'] = {};
  curMsaObj['diversity']['empHHI'] = {};
  curMsaObj['diversity']['composite'];

  processedOpportunity.forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['diversity']['opportunity'] = metro;   

      metro.values.forEach(yearVal => {
        if(!natObj['diversity']['opportunity']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['diversity']['opportunity']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['diversity']['opportunity']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['diversity']['opportunity']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['diversity']['opportunity']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  processedForeignborn['raw'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['diversity']['foreignborn']['raw'] = metro;   

      metro.values.forEach(yearVal => {
        if(typeof yearVal.y == "number"){
          if(!natObj['diversity']['foreignborn']['raw']['values'].filter(d => d.x == yearVal.x)[0]){
            natObj['diversity']['foreignborn']['raw']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
          }
          else{
            natObj['diversity']['foreignborn']['raw']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
            natObj['diversity']['foreignborn']['raw']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
            natObj['diversity']['foreignborn']['raw']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
          }      
        }
      })
    }
  })
  processedForeignborn['relative'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['diversity']['foreignborn']['relative'] = metro;      

      metro.values.forEach(yearVal => {
        if(typeof yearVal.y == "number"){
          if(!natObj['diversity']['foreignborn']['relative']['values'].filter(d => d.x == yearVal.x)[0]){
            natObj['diversity']['foreignborn']['relative']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
          }
          else{
            natObj['diversity']['foreignborn']['relative']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
            natObj['diversity']['foreignborn']['relative']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
            natObj['diversity']['foreignborn']['relative']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
          }
        }
      })
    }
  })
  coloredEmpVariance.forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['diversity']['empLQVariance']['raw'] = metro; 

      metro.values.forEach(yearVal => {
        if(!natObj['diversity']['empLQVariance']['raw']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['diversity']['empLQVariance']['raw']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['diversity']['empLQVariance']['raw']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['diversity']['empLQVariance']['raw']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['diversity']['empLQVariance']['raw']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  coloredEmpHHI.forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['diversity']['empHHI']['raw'] = metro;    

      metro.values.forEach(yearVal => {
        if(!natObj['diversity']['empHHI']['raw']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['diversity']['empHHI']['raw']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['diversity']['empHHI']['raw']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['diversity']['empHHI']['raw']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['diversity']['empHHI']['raw']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })

    }
  })
  processedDiversityComposite.forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['diversity']['composite'] = metro;      

      metro.values.forEach(yearVal => {
        if(!natObj['diversity']['composite']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['diversity']['composite']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['diversity']['composite']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['diversity']['composite']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['diversity']['composite']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })

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

      metro.values.forEach(yearVal => {
        if(!natObj['fluidity']['highGrowth']['raw']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['fluidity']['highGrowth']['raw']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['fluidity']['highGrowth']['raw']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['fluidity']['highGrowth']['raw']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['fluidity']['highGrowth']['raw']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  processedInc5000['relative'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['fluidity']['highGrowth']['relative'] = metro;        

      metro.values.forEach(yearVal => {
        if(!natObj['fluidity']['highGrowth']['relative']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['fluidity']['highGrowth']['relative']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['fluidity']['highGrowth']['relative']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['fluidity']['highGrowth']['relative']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['fluidity']['highGrowth']['relative']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  processedNetMigration['raw'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['fluidity']['netMigration']['raw'] = metro;    

      metro.values.forEach(yearVal => {
        if(!natObj['fluidity']['netMigration']['raw']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['fluidity']['netMigration']['raw']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['fluidity']['netMigration']['raw']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['fluidity']['netMigration']['raw']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['fluidity']['netMigration']['raw']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  processedNetMigration['relative'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['fluidity']['netMigration']['relative'] = metro;   

      metro.values.forEach(yearVal => {
        if(!natObj['fluidity']['netMigration']['relative']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['fluidity']['netMigration']['relative']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['fluidity']['netMigration']['relative']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['fluidity']['netMigration']['relative']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['fluidity']['netMigration']['relative']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  processedTotalMigration['raw'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['fluidity']['totalMigration']['raw'] = metro;    

      metro.values.forEach(yearVal => {
        if(!natObj['fluidity']['totalMigration']['raw']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['fluidity']['totalMigration']['raw']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['fluidity']['totalMigration']['raw']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['fluidity']['totalMigration']['raw']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['fluidity']['totalMigration']['raw']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  processedTotalMigration['relative'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['fluidity']['totalMigration']['relative'] = metro;      

      metro.values.forEach(yearVal => {
        if(!natObj['fluidity']['totalMigration']['relative']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['fluidity']['totalMigration']['relative']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['fluidity']['totalMigration']['relative']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['fluidity']['totalMigration']['relative']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['fluidity']['totalMigration']['relative']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  processedInflowMigration['raw'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['fluidity']['inflowMigration']['raw'] = metro;    

      metro.values.forEach(yearVal => {
        if(!natObj['fluidity']['inflowMigration']['raw']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['fluidity']['inflowMigration']['raw']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['fluidity']['inflowMigration']['raw']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['fluidity']['inflowMigration']['raw']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['fluidity']['inflowMigration']['raw']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  processedInflowMigration['relative'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['fluidity']['inflowMigration']['relative'] = metro;    

      metro.values.forEach(yearVal => {
        if(!natObj['fluidity']['inflowMigration']['relative']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['fluidity']['inflowMigration']['relative']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['fluidity']['inflowMigration']['relative']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['fluidity']['inflowMigration']['relative']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['fluidity']['inflowMigration']['relative']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  processedOutflowMigration['raw'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['fluidity']['outflowMigration']['raw'] = metro;        

      metro.values.forEach(yearVal => {
        if(!natObj['fluidity']['outflowMigration']['raw']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['fluidity']['outflowMigration']['raw']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['fluidity']['outflowMigration']['raw']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['fluidity']['outflowMigration']['raw']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['fluidity']['outflowMigration']['raw']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  processedOutflowMigration['relative'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['fluidity']['outflowMigration']['relative'] = metro;    

      metro.values.forEach(yearVal => {
        if(!natObj['fluidity']['outflowMigration']['relative']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['fluidity']['outflowMigration']['relative']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['fluidity']['outflowMigration']['relative']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['fluidity']['outflowMigration']['relative']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['fluidity']['outflowMigration']['relative']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  processedAnnualChurn['raw'].forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['fluidity']['churn']['raw'] = metro;   

      metro.values.forEach(yearVal => {
        if(!natObj['fluidity']['churn']['raw']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['fluidity']['churn']['raw']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['fluidity']['churn']['raw']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['fluidity']['churn']['raw']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['fluidity']['churn']['raw']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })

    }
  })

  processedFluidityComposite.forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['fluidity']['composite'] = metro;        

      metro.values.forEach(yearVal => {
        if(!natObj['fluidity']['composite']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['fluidity']['composite']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['fluidity']['composite']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['fluidity']['composite']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['fluidity']['composite']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })

    }
  })
  //End of Fluidity Data

  //Start of Combined
  curMsaObj['combined'] = {};
  curMsaObj['combined']['composite'];
  processedCombinedComposite.forEach(metro => {
    if(metro.key == msaId){
      curMsaObj['combined']['composite'] = metro;     

      metro.values.forEach(yearVal => {
        if(!natObj['combined']['composite']['values'].filter(d => d.x == yearVal.x)[0]){
          natObj['combined']['composite']['values'].push({x:yearVal.x,y:yearVal.y,score:yearVal.score,count:1});
        }
        else{
          natObj['combined']['composite']['values'].filter(d => d.x == yearVal.x)[0]["y"] += yearVal.y;
          natObj['combined']['composite']['values'].filter(d => d.x == yearVal.x)[0]["score"] += yearVal.score;
          natObj['combined']['composite']['values'].filter(d => d.x == yearVal.x)[0]["count"] += 1;
        }
      })
    }
  })
  //End of Combined

  //Writing to File
  fs.writeFileSync("../src/static/data/metros/" + msaId + ".json",JSON.stringify(curMsaObj));   
})


Object.keys(natObj['pop']).forEach(year => {
  natObj['pop'][year] = natObj['pop'][year]/natObj['count']
})

natObj['density']['newFirms']['raw']['values'] = natObj['density']['newFirms']['raw']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedNewFirms['raw'].push(natObj['density']['newFirms']['raw'])

natObj['density']['newFirms']['relative']['values'] = natObj['density']['newFirms']['relative']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedNewFirms['relative'].push(natObj['density']['newFirms']['relative']);

natObj['density']['shareEmp']['relative']['values'] = natObj['density']['shareEmp']['relative']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
coloredShareEmpNewFirmsQWI_All.push(natObj['density']['shareEmp']['relative'])

natObj['density']['shareEmpQWI_HighTech']['raw']['values'] = natObj['density']['shareEmpQWI_HighTech']['raw']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
coloredShareEmpNewFirmsQWI_HighTech.push(natObj['density']['shareEmpQWI_HighTech']['raw'])

natObj['density']['shareEmpQWI_ExceptAccomAndRetail']['raw']['values'] = natObj['density']['shareEmpQWI_ExceptAccomAndRetail']['raw']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
coloredShareEmpNewFirmsQWI_ExceptAccomAndRetail.push(natObj['density']['shareEmpQWI_ExceptAccomAndRetail']['raw'])

natObj['density']['composite']['values'] = natObj['density']['composite']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedDensityComposite.push(natObj['density']['composite'])



natObj['diversity']['opportunity']['values'] = natObj['diversity']['opportunity']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedOpportunity.push(natObj['diversity']['opportunity'])

natObj['diversity']['foreignborn']['raw']['values'] = natObj['diversity']['foreignborn']['raw']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedForeignborn['raw'].push(natObj['diversity']['foreignborn']['raw'])

natObj['diversity']['foreignborn']['relative']['values'] = natObj['diversity']['foreignborn']['relative']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedForeignborn['relative'].push(natObj['diversity']['foreignborn']['relative'])

natObj['diversity']['empLQVariance']['raw']['values'] = natObj['diversity']['empLQVariance']['raw']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
coloredEmpVariance.push(natObj['diversity']['empLQVariance']['raw'])

natObj['diversity']['empHHI']['raw']['values'] = natObj['diversity']['empHHI']['raw']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
coloredEmpHHI.push(natObj['diversity']['empHHI']['raw'])

natObj['diversity']['composite']['values'] = natObj['diversity']['composite']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedDiversityComposite.push(natObj['diversity']['composite'])




natObj['fluidity']['highGrowth']['raw']['values'] = natObj['fluidity']['highGrowth']['raw']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedInc5000['raw'].push(natObj['fluidity']['highGrowth']['raw']);

natObj['fluidity']['highGrowth']['relative']['values'] = natObj['fluidity']['highGrowth']['relative']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedInc5000['relative'].push(natObj['fluidity']['highGrowth']['relative']);

natObj['fluidity']['netMigration']['raw']['values'] = natObj['fluidity']['netMigration']['raw']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedNetMigration['raw'].push(natObj['fluidity']['netMigration']['raw'])

natObj['fluidity']['netMigration']['relative']['values'] = natObj['fluidity']['netMigration']['relative']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedNetMigration['relative'].push(natObj['fluidity']['netMigration']['relative'])

natObj['fluidity']['totalMigration']['raw']['values'] = natObj['fluidity']['totalMigration']['raw']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedTotalMigration['raw'].push(natObj['fluidity']['totalMigration']['raw'])

natObj['fluidity']['totalMigration']['relative']['values'] = natObj['fluidity']['totalMigration']['relative']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedTotalMigration['relative'].push(natObj['fluidity']['totalMigration']['relative'])

natObj['fluidity']['inflowMigration']['raw']['values'] = natObj['fluidity']['inflowMigration']['raw']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedInflowMigration['raw'].push(natObj['fluidity']['inflowMigration']['raw'])

natObj['fluidity']['inflowMigration']['relative']['values'] = natObj['fluidity']['inflowMigration']['relative']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedInflowMigration['relative'].push(natObj['fluidity']['inflowMigration']['relative'])

natObj['fluidity']['outflowMigration']['raw']['values'] = natObj['fluidity']['outflowMigration']['raw']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedOutflowMigration['raw'].push(natObj['fluidity']['outflowMigration']['raw'])

natObj['fluidity']['outflowMigration']['relative']['values'] = natObj['fluidity']['outflowMigration']['relative']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedOutflowMigration['relative'].push(natObj['fluidity']['outflowMigration']['relative'])

natObj['fluidity']['churn']['raw']['values'] = natObj['fluidity']['churn']['raw']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
coloredAnnualChurn.push(natObj['fluidity']['churn']['raw'])

natObj['fluidity']['composite']['values'] = natObj['fluidity']['composite']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedFluidityComposite.push(natObj['fluidity']['composite'])




natObj['combined']['composite']['values'] = natObj['combined']['composite']['values'].sort((a,b) => {
    return a.x - b.x
  }).map(yearObj => {
    yearObj["y"]=yearObj["y"]/yearObj["count"];
    yearObj["score"]=yearObj["score"]/yearObj["count"];

    return yearObj
  })
processedCombinedComposite.push(natObj['combined']['composite'])



fs.writeFileSync("../src/static/data/metros/national.json",JSON.stringify(natObj));  
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

  //if(dataset == "qwiDensity"){
    //console.log("qwiDensity")
  //}

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
          color:_colorFunction(data[metroArea],data,dataset),
          scoreColor:_colorFunction(data[metroArea],data,dataset,"score")
        }

        city.values = data[metroArea].values.map(i => {
          //only place we can modify the annualchurn data
          if(dataset == "annualChurn"){
            return {
              x:i.x,
              y:(i.y * 100),
              rank:i.rank,
              raw:i.raw,
              score:i.score
            }
          }
          else{
            return {
              x:i.x,
              y:i.y,
              rank:i.rank,
              raw:i.raw,
              score:i.score
            }            
          }
             
        })   
        newData.push(city);           
    }
  });



  if(dataset.substring((dataset.length-9)) != "Composite"){
    var dataMax = d3.max(newData, function(c) { return d3.max(c.values, function(v) { return v.y }); })
    var dataMin = d3.min(newData, function(c) { return d3.min(c.values, function(v) { return v.y }); })


    let valueArray = [];

    newData.forEach(metro => {
      metro.values.forEach(yearValue => {
        valueArray.push(yearValue.y)          
      })
    })

    var dataMean = d3.mean(valueArray)


    if(dataset == "empVariance" || dataset == "empHHI"){
      var dataScale = d3.scale.linear()
        .range([100,0])
        .domain([dataMean,
                dataMax])    
    }
    else if(dataset == "opportunity"){
      var dataScale = d3.scale.linear()
        .range([0,100])
        .domain([dataMin,
                dataMean]) 
    }
    else{
      var dataScale = d3.scale.linear()
        .range([0,100])
        .domain([dataMin,
                dataMean])    
    }


    //if(dataset == "opportunity"){
      //console.log(dataScale(dataMin),dataScale(dataMax))
    //}


    var dataWithScore = newData.map(metro => {
      var newValues = metro.values.map(yearValue => {
        yearValue.score = dataScale(yearValue.y);
        return yearValue;
      })
      metro.values = newValues;
      return metro;
    })

    return dataWithScore;  

 
  }
  else{
    return newData;
  }

 



}
function _colorFunction(params,data,dataset,type){
    var cityColor;

    if(params){
        if(dataset == "opportunity" ){
            var curValue = params.values.filter(yearValue => yearValue.x == 'combined')[0]
            var curY = curValue ? curValue.y : null
            var color = _colorGroup(data,dataset,type);
            cityColor = color(curY);                              
        }
        else if(params.values && params.values.length > 0){

            var curValue = params.values.filter(yearValue => yearValue.x == 2013)[0]
            var curY = curValue ? curValue.y : null
            var color = _colorGroup(data,dataset,type);
            cityColor = color(curY);   
        }
    }  

    return cityColor;
}
function _colorGroup(data,dataset,type){
  let valueArray = [];

  data.forEach(metro => {
    metro.values.forEach(yearValue => {
      if(yearValue.x == 2013 || (dataset=="opportunity" && yearValue.x =="combined")){
        valueArray.push(yearValue.y)          
      }
    })
  })




  if(type != "score"){
    var colorDomain = valueArray;
    var colorRange = ["#996b25", "#c58a30", "#dea44a", "#e2ae5e", "#b1bbcf", "#97a5bf", "#7d8faf", "#64728c", "#3e4757"]    
  }
  else{
    var colorDomain = d3.range(d3.min(valueArray),d3.max(valueArray),((d3.max(valueArray)-d3.min(valueArray))/9))
    var colorRange = ["#996b25", "#c58a30", "#dea44a", "#e2ae5e", "#b1bbcf", "#97a5bf", "#7d8faf", "#64728c", "#3e4757"]        
  }

  if(dataset=="empVariance" || dataset==='empHHI'){
    var _colorGroupScale = d3.scale.quantile()
        .domain(colorDomain)
        .range((colorRange))      
  }
  else{
    var _colorGroupScale = d3.scale.quantile()
        .domain(colorDomain)
        .range((colorRange).reverse())      
  }



  return _colorGroupScale;
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
    .domain([d3.min(yearCityFilteredShare, function(c) { return d3.min(c.values, function(v) { return v.score }); }),
            d3.max(yearCityFilteredShare, function(c) { return d3.max(c.values, function(v) { return v.score }); })])

  var newFirmsScale = d3.scale.linear()
    .range([0,100])
    .domain([d3.min(yearCityFilteredNewFirms, function(c) { return d3.min(c.values, function(v) { return v.score }); }),
            d3.max(yearCityFilteredNewFirms, function(c) { return d3.max(c.values, function(v) { return v.score }); })])

  var highTechScale = d3.scale.linear()
    .range([0,100])
    .domain([d3.min(yearCityFilteredHighTech, function(c) { return d3.min(c.values, function(v) { return v.score }); }),
            d3.max(yearCityFilteredHighTech, function(c) { return d3.max(c.values, function(v) { return v.score }); })])

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
          newFirmObj[curYear] = yearCityFilteredNewFirms[i]['values'][k].score
        }
      }
      if(!newFirmObj[curYear]){
        newFirmObj[curYear] = 0;
      }

      for(var k = 0; k<yearCityFilteredHighTech[i]['values'].length; k++){
        if(yearCityFilteredHighTech[i]['values'][k].x == curYear){
          highTechObj[curYear] = yearCityFilteredHighTech[i]['values'][k].score
        }
      }
      if(!highTechObj[curYear]){
        highTechObj[curYear] = 0;
      }  

      for(var k = 0; k<yearCityFilteredNoAccomRetail[i]['values'].length; k++){
        if(yearCityFilteredNoAccomRetail[i]['values'][k].x == curYear){
          noAccomRetailObj[curYear] = yearCityFilteredNoAccomRetail[i]['values'][k].score
        }
      }
      if(!noAccomRetailObj[curYear]){
        noAccomRetailObj[curYear] = 0;
      }  

      var compositeValue = (
        shareScale(yearCityFilteredShare[i].values[j].score) +      
        newFirmsScale(newFirmObj[curYear]) +
        highTechScale(highTechObj[curYear])
            )/3

      resultValues.push({x:curYear,y:compositeValue,score:compositeValue})      
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

    var rankedData = _rankCities(finalData,dataset);
    var polishedData = _polishData(rankedData,dataset);

    var graphRawData = polishedData;

    var graphRelativeData = [];
    graphRelativeData = _relativeAgainstPopulation(graphRawData);

    if(graphRelativeData && graphRelativeData.length > 0){
        var rankedData2 = _rankCities(graphRelativeData,dataset);
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

function _processDiversityComposite(opportunity,foreignbornObj,empVariance,empHHI){

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
      cityFilteredEmpVariance = [],
      cityFilteredEmpHHI = [];

  var compositeCityRanks = [];

  for(var i=0; i<opp.length; i++){
    for(var j=0; j<foreignborn.length; j++){
      if(opp[i].key == foreignborn[j].key){
        for(var k=0; k< empVariance.length; k++){
          if(empVariance[k].key == opp[i].key){
            for(var m=0; m < empHHI.length; m++){
              if(empHHI[m].key == opp[i].key){
                cityFilteredOpp.push(opp[i]); 
                cityFilteredForeignborn.push(foreignborn[j])
                cityFilteredEmpVariance.push(empVariance[k])
                cityFilteredEmpHHI.push(empHHI[m])
                break
              }
            }
          break
          }
        }      
        break
      }
    }
  }

  cityFilteredForeignborn.forEach(metroArea => {
    metroArea.values = metroArea.values.filter(yearValue => {
      return yearValue.y >= 0;
    })
  })

  var foreignBornyearRange = ([d3.min(cityFilteredForeignborn, function(c) { return d3.min(c.values, function(v) { return v.x }); }),
                    d3.max(cityFilteredForeignborn, function(c) { return d3.max(c.values, function(v) { return v.x }); })])
  var empVarianceyearRange = ([d3.min(cityFilteredEmpVariance, function(c) { return d3.min(c.values, function(v) { return v.x }); }),
                    d3.max(cityFilteredEmpVariance, function(c) { return d3.max(c.values, function(v) { return v.x }); })])
  var empHHIRange = ([d3.min(cityFilteredEmpHHI, function(c) { return d3.min(c.values, function(v) { return v.x }); }),
                    d3.max(cityFilteredEmpHHI, function(c) { return d3.max(c.values, function(v) { return v.x }); })])


  var minYear = d3.max([foreignBornyearRange[0],empVarianceyearRange[0], empHHIRange[0]])
  var maxYear = d3.min([foreignBornyearRange[1],empVarianceyearRange[1], empHHIRange[1]])

  var yearCityFilteredForeignBorn = _trimYears(([minYear,maxYear]),cityFilteredForeignborn);
  var yearCityFilteredEmpVariance = _trimYears(([minYear,maxYear]),cityFilteredEmpVariance);
  var yearCityFilteredEmpHHI = _trimYears(([minYear,maxYear]),cityFilteredEmpHHI);

  var oppScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(cityFilteredOpp, function(c) { return d3.min(c.values, function(v) { return v.score }); }),
                  d3.max(cityFilteredOpp, function(c) { return d3.max(c.values, function(v) { return v.score }); })]
                  )
  var foreignBornScale = d3.scale.linear()
  .range([0,100])
  .domain(      [d3.min(yearCityFilteredForeignBorn, function(c) { return d3.min(c.values, function(v) { return v.score }); }),
                d3.max(yearCityFilteredForeignBorn, function(c) { return d3.max(c.values, function(v) { return v.score }); })]
                )  

  var empVarianceScale = d3.scale.linear()
                           .range([100,0])
                           .domain([d3.max(yearCityFilteredEmpVariance, c => d3.max(c.values, v => v.score )), 
                                    d3.min(yearCityFilteredEmpVariance, c => d3.min(c.values, v => v.score ))])

  var empHHIScale = d3.scale.linear()
                           .range([100,0])
                           .domain([d3.max(yearCityFilteredEmpHHI, c => d3.max(c.values, v => v.score )), 
                                    d3.min(yearCityFilteredEmpHHI, c => d3.min(c.values, v => v.score ))])
  
  cityFilteredOpp.sort(_sortMsaCities());
  yearCityFilteredForeignBorn.sort(_sortMsaCities());
  yearCityFilteredEmpVariance.sort(_sortMsaCities());
  yearCityFilteredEmpHHI.sort(_sortMsaCities());

  console.log(cityFilteredOpp.length,yearCityFilteredForeignBorn.length,yearCityFilteredEmpVariance.length,yearCityFilteredEmpHHI.length)

  for(var i=0; i<yearCityFilteredForeignBorn.length;i++){
    var resultValues = [],
      empVarObj= {},
      empHHIObj = {};

    for(var j=0; j<yearCityFilteredForeignBorn[i]['values'].length; j++){
      var curYear = yearCityFilteredForeignBorn[i]['values'][j].x

      for(var k = 0; k<yearCityFilteredEmpVariance[i]['values'].length; k++){
        if(yearCityFilteredEmpVariance[i]['values'][k].x == curYear){
          empVarObj[curYear] = yearCityFilteredEmpVariance[i]['values'][k].score
          break
        }
      }

      for(var m = 0; m<yearCityFilteredEmpHHI[i]['values'].length; m++){
        if(yearCityFilteredEmpHHI[i]['values'][m].x == curYear){
          empHHIObj[curYear] = yearCityFilteredEmpHHI[i]['values'][m].score
          break
        }
      }

      var compositeValue
      if (Number.isFinite(parseFloat(empVarObj[curYear])) && Number.isFinite(parseFloat(empHHIObj[curYear]))) {
        compositeValue = (
                          foreignBornScale(yearCityFilteredForeignBorn[i].values[j].score) +      
                          oppScale(cityFilteredOpp[i].values[0].score) +
                          empVarianceScale(empVarObj[curYear]) +
                          empHHIScale(empHHIObj[curYear]) 
                         ) /4 
      } else {
        compositeValue = null
      }

      resultValues.push({x:curYear,y:compositeValue,score:compositeValue})      
    }
    compositeCityRanks.push({key:yearCityFilteredForeignBorn[i]['key'],values:resultValues})          
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
    .domain(      [d3.min(yearCityFilteredIrsNet, function(c) { return d3.min(c.values, function(v) { return v.score }); }),
                  d3.max(yearCityFilteredIrsNet, function(c) { return d3.max(c.values, function(v) { return v.score }); })]
                  )
  var totalMigrationScale = d3.scale.linear()
    .range([0,100])
    .domain(      [d3.min(yearCityFilteredTotalMigrationFlow, function(c) { return d3.min(c.values, function(v) { return v.score }); }),
                  d3.max(yearCityFilteredTotalMigrationFlow, function(c) { return d3.max(c.values, function(v) { return v.score }); })]
                  )  
  var rawIncScale = d3.scale.linear()
  .range([0,100])
  .domain(      [d3.min(yearCityFilteredRawInc, function(c) { return d3.min(c.values, function(v) { return v.score }); }),
                d3.max(yearCityFilteredRawInc, function(c) { return d3.max(c.values, function(v) { return v.score }); })]
                )  
  var relIncScale = d3.scale.linear()
  .range([0,100])
  .domain(      [d3.min(yearCityFilteredRelInc, function(c) { return d3.min(c.values, function(v) { return v.score }); }),
                d3.max(yearCityFilteredRelInc, function(c) { return d3.max(c.values, function(v) { return v.score }); })]
                )  
  var annualChurnScale = d3.scale.linear()
  .range([0,100])
  .domain(      [d3.min(yearCityFilteredAnnualChurn, function(c) { return d3.min(c.values, function(v) { return v.score }); }),
                d3.max(yearCityFilteredAnnualChurn, function(c) { return d3.max(c.values, function(v) { return v.score }); })]
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
            rawObj[yearCityFilteredRawInc[i]['values'][k].x] = yearCityFilteredRawInc[i]['values'][k].score
            relObj[yearCityFilteredRawInc[i]['values'][k].x] = yearCityFilteredRelInc[i]['values'][k].score
          }
        }

        if(!rawObj[yearCityFilteredIrsNet[i]['values'][j].x]){
          rawObj[yearCityFilteredIrsNet[i]['values'][j].x] = 0;
          relObj[yearCityFilteredIrsNet[i]['values'][j].x] = 0;
        }

        for(var k = 0; k<yearCityFilteredAnnualChurn[i]['values'].length; k++){
          if(yearCityFilteredAnnualChurn[i]['values'][k].x == yearCityFilteredIrsNet[i]['values'][j].x){
            churnObj[yearCityFilteredAnnualChurn[i]['values'][k].x] = yearCityFilteredAnnualChurn[i]['values'][k].score
          }
        }

        if(!churnObj[yearCityFilteredIrsNet[i]['values'][j].x]){
          churnObj[yearCityFilteredIrsNet[i]['values'][j].x] = 0;
        }  

        var compositeValue = ((irsNetScale(yearCityFilteredIrsNet[i].values[j].score) + 
            totalMigrationScale(yearCityFilteredTotalMigrationFlow[i].values[j].score) + 
            relIncScale(relObj[yearCityFilteredIrsNet[i]['values'][j].x])+ 
            rawIncScale(rawObj[yearCityFilteredIrsNet[i]['values'][j].x]) + 
            annualChurnScale(churnObj[yearCityFilteredIrsNet[i]['values'][j].x])
            )/5)

        resultValues.push({x:yearCityFilteredIrsNet[i].values[j].x,
          y:compositeValue,
          score:compositeValue})      
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
              values: _.sortBy(_.map(data[msa], (val, yr) => ({
                x: +yr, 
                y: val, 
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
          var compositeValue = ((densityScale(yearCityFilteredDensity[i].values[j].y) + 
              fluidityScale(yearCityFilteredFluidity[i].values[j].y) + 
              diversityScale(yearCityFilteredDiversity[i].values[j].y))/3)


          resultValues.push({x:yearCityFilteredDensity[i].values[j].x,
            y: compositeValue,
            score: compositeValue
            })      
        }         
      }

      compositeCityRanks.push({key:yearCityFilteredDensity[i]['key'],values:resultValues})          
    }
  }

  compositeCityRanks = _rankCities(compositeCityRanks);
  var graphData = _polishData(compositeCityRanks,"fluidityComposite");

  return graphData;
}

