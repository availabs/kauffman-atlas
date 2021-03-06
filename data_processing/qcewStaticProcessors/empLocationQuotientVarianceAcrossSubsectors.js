#!/usr/bin/env babel-node

'use strict'

import fs from 'fs'
import path from 'path'
import fetch from 'isomorphic-fetch'
import async from 'async'
import _ from 'lodash'

import { qcewApi as apiServerAddress } from '../../src/AppConfig'


const outputFilePath = path.join(__dirname, '../../src/static/data/economySpecializationStatistics.json') 

const msaIds = Object.keys(JSON.parse(fs.readFileSync('../../src/static/msaIdToName.json')))
msaIds[msaIds.findIndex(id => (id === '26180'))] = '46520' // Honolulu case


const allNaicsCodes = Object.keys(JSON.parse(fs.readFileSync('../../src/static/data/naicsKeys.json')))
const fourDigitNaics = allNaicsCodes.filter(c => (c.split('-')[0].length === 4))


const empFields = ['month1_emplvl', 'month2_emplvl', 'month3_emplvl']
const lqEmpFields = empFields.map(field => `lq_${field}`)


const years = _.range(2001, 2017)


const handleFetchErrors = (response) => {
  if (!response.ok) { throw new Error(`Fetch response statusText:\n${response.statusText}`) }

  return response
}


const getFipsCode = (msa) => {
  if (msa === '46520') {
    return 'C2618C4652'
  } else if (msa === '31080') {
    return 'C3108C3110'
  } else {
    return `C${msa.slice(0,4)}`
  }
}



const buildRequestURL = (msa) => 
  `${apiServerAddress}/data/` +
  `fips${getFipsCode(msa)}/` +
  `yr${years.join('')}/qtr1234/` +
  `ind${fourDigitNaics.map(c => _.padStart(c, 6, '0')).join('')}/` +
  `?${_.union(empFields, lqEmpFields).map(field => `fields[]=${field}`).join('&')}`


// This function restructures the key/values style API response into a standard JS object keyed by 'key'.
const restructureData = d => 
  d.reduce((acc,v)=>(v.key && v.values) ? _.set(acc,v.key,restructureData(v.values)) : v,{})

// Restructures the response and merges the data for Los Angeles' two distinct MSAs.
const reformatApiResponse = (data) => 
  _(data).mapValues((dataForMSA) => restructureData(dataForMSA.values)).values().reduce(_.defaultsDeep)


//NOTE: Format of d is { <year>: { <quarter>: <naics>: { <month_X_measure>: <value> } } }
//
// In this function, we forward fill the data. 
//
//returns { <year>: { <quarter>: { <naics>: <avg monthly value of measure> } } }
const forwardFill = (d) => {
  
  let lastKnowValues = fourDigitNaics.reduce((acc, naics) => _.set(acc, naics, {emp: 0, lqEmp: 0}), {})

  return _.mapValues(d, (byQuarter) =>
            _.mapValues(byQuarter, (byNaics) => 
              fourDigitNaics.reduce((acc, naics) => {

                let monthlyEmp = empFields.map(field => +_.get(byNaics, [naics, field])).filter(Number.isFinite)

                if (monthlyEmp.length) {
                  lastKnowValues[naics].emp = _.mean(monthlyEmp)
                }

                let monthlyLQEmp = lqEmpFields.map(field => +_.get(byNaics, [naics, field])).filter(Number.isFinite)

                if (monthlyLQEmp.length) {
                  lastKnowValues[naics].lqEmp = _.mean(monthlyLQEmp)
                }

                acc[naics] = {
                  emp   : lastKnowValues[naics].emp,
                  lqEmp : lastKnowValues[naics].lqEmp,
                }

                return acc
              }, {})
            )
          )
}


// Aggregate the byNaics object values into arrays.
const getMonthlyAveragesByQuarterByYear = (byYear) => 
  _.mapValues(byYear, byQtr => 
    _.mapValues(byQtr, byNaicsForQtr => 
      _.reduce(byNaicsForQtr, (acc, forNaics) => { 
        acc.emp.push(forNaics.emp)
        acc.lqEmp.push(forNaics.lqEmp)
        return acc
      }, { emp: [], lqEmp: [] })
    )
  )


// Returns an object, keyed by year, with values representing 
// the variance in lq_emplvl across all months and all 6-digit NAICS. 
const computeDispersionMeasuresByQuarterByYear = (lqEmpAvgsByQtrByYear) => 
        _.mapValues(lqEmpAvgsByQtrByYear, lqEmpAvgsByByQtr =>
          _.mapValues(lqEmpAvgsByByQtr, monthlyAvgsForQtr => {

            let emp = monthlyAvgsForQtr.emp
            let lqEmp = monthlyAvgsForQtr.lqEmp

            let empTotal = _.sum(emp)
            let empShares = emp.map(empAvg => (empAvg/empTotal))

            let lqEmpMean = _.mean(lqEmp)
            let lqEmpVariance = _.meanBy(lqEmp, forNaics => ((forNaics-lqEmpMean)*(forNaics-lqEmpMean)))

            let enoughData = (empShares.filter(x=>x).length > 10)

            return {
              hhi_2: (enoughData) ? _(empShares).map(share => (share*share)).sum() : null,
              hhi_3: (enoughData) ? _(empShares).map(share => (share*share*share)).sum() : null,
              hhi_4: (enoughData) ? _(empShares).map(share => (share*share*share*share)).sum() : null,

              shannon: (empShares.length > 25) ? 
                          (-1 * _(empShares).filter().map(share => (share * Math.log(share))).sum()) : null,

              lqEmpVariance,
            }
          })
       )


const aggregateDispersionMeasuresByYear = (dispMeasuresByQtrByYear) => 
  _.mapValues(dispMeasuresByQtrByYear, (dispMeasuresByQtr) => ({
      hhi_2: _(dispMeasuresByQtr).map(dispMeasures => dispMeasures.hhi_2).mean(),
      hhi_3: _(dispMeasuresByQtr).map(dispMeasures => dispMeasures.hhi_3).mean(),
      hhi_4: _(dispMeasuresByQtr).map(dispMeasures => dispMeasures.hhi_4).mean(),
      shannon: _(dispMeasuresByQtr).map(dispMeasures => dispMeasures.shannon).mean(),
      lqEmpVariance: _(dispMeasuresByQtr).map(dispMeasures => dispMeasures.lqEmpVariance).mean(),
    })
  )

//const tapLog = (d) => { console.log(JSON.stringify(d, null, 4)); return d }

const getDispersionStatistics = (acc, msa, cb) => {
  
  console.time(msa)
  let stopTimer = (d) => { console.timeEnd(msa); return d }

  fetch(buildRequestURL(msa))
    .then(handleFetchErrors)
    .then(response => response.json())
    .then(reformatApiResponse)
    .then(forwardFill)
    .then(getMonthlyAveragesByQuarterByYear)
    .then(computeDispersionMeasuresByQuarterByYear)
    .then(aggregateDispersionMeasuresByYear)
    .then(stopTimer)
    .then((d) => cb(null, _.set(acc, msa, d)))
    .catch(cb)
}


async.reduce(msaIds, {}, getDispersionStatistics, (err, yearlyEmpVarianceByMSA) => {

  if (err) { return console.error(err) }

  //return console.log(JSON.stringify(yearlyEmpVarianceByMSA, null, 4))
  return fs.writeFileSync(outputFilePath, JSON.stringify(yearlyEmpVarianceByMSA))
})
