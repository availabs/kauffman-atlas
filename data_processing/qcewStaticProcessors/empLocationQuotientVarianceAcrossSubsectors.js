#!/usr/bin/env node

'use strict'

import fs from 'fs'
import path from 'path'
import fetch from 'isomorphic-fetch'
import async from 'async'
import _ from 'lodash'

import { qcewApi as apiServerAddress } from '../../src/AppConfig'


const outputFilePath = path.join(__dirname, '../../src/static/data/empLocationQuotientVarianceAcrossSubsectors_subset.json') 

const msaIds = _.take(Object.keys(JSON.parse(fs.readFileSync('../../src/static/msaIdToName.json'))), 30)

const allNaicsCodes = Object.keys(JSON.parse(fs.readFileSync('../../src/static/data/naicsKeys.json'))) 
const sixDigitNAICS = allNaicsCodes.filter(c => (c.length === 6))
const fields = ['month1_emplvl', 'month2_emplvl', 'month3_emplvl']


const years = _.range(2001, 2017)


const handleFetchErrors = (response) => {
  if (!response.ok) { throw new Error(`Fetch response statusText:\n${response.statusText}`) }

  return response
}


const buildRequestURL = (msa) => 
  `${apiServerAddress}/data/` + 
  `fips${(msa !== '31080') ? `C${msa.slice(0,4)}` : `C3108C3110`}/` +
  `yr${years.join('')}/qtr1234/` + 
  `ind${sixDigitNAICS.join('')}/` + 
  `?${fields.map(field => `fields[]=${field}`).join('&')}`


// This function restructures the key/values style API response into a standard JS object keyed by 'key'.
const restructureData = d => d.reduce((acc,v)=>(v.key && v.values) ? _.set(acc,v.key,restructureData(v.values)) : v,{})

// Restructures the response and merges the data for Los Angeles' two distinct MSAs.
const reformatApiResponse = (data) => 
  _(data).mapValues((dataForMSA) => restructureData(dataForMSA.values)).values().reduce(_.defaultsDeep)


//NOTE: Format of d is { <year>: { <quarter>: <naics>: { <month_X_measure>: <value> } } }
//
// In this function, we forward fill the data. 
//
//returns { <year>: { <quarter>: { <naics>: <avg monthly value of measure> } } }
const forwardFill = (d) => {
  
  let lastKnowValues = sixDigitNAICS.reduce((acc, naics) => _.set(acc, naics, 0), {})

  return _.mapValues(d, (byQuarter) =>
            _.mapValues(byQuarter, (byNaics) => 
              sixDigitNAICS.reduce((acc, naics) => {

                let monthlyLQEmp = fields.map(field => +_.get(byNaics, [naics, field])).filter(Number.isFinite)

                if (monthlyLQEmp.length) {
                  lastKnowValues[naics] = _.mean(monthlyLQEmp)
                }

                acc[naics] = lastKnowValues[naics]

                return acc
              }, {})
            )
          )
}


// Aggregate the byNaics object values into arrays.
const getMonthlyAveragesByQuarterByYear = (d) => _.mapValues(d, byQtr => _.map(byQtr, byNaics => _.values(byNaics)))


// Returns an object, keyed by year, with values representing 
// the variance in lq_emplvl across all months and all 6-digit NAICS. 
const computeDispersionMeasuresByQuarterByYear = (lqEmpAvgsByQtrByYear) => 
        _.mapValues(lqEmpAvgsByQtrByYear, lqEmpAvgsByByQtr =>
          _.mapValues(lqEmpAvgsByByQtr, avgsForQuarter => {

            let total = _.sum(avgsForQuarter)
            let shares = avgsForQuarter.map(avg => (avg/total))

            return {
              hhi_2: _(shares).map(share => (share*share)).sum(),
              hhi_3: _(shares).map(share => (share*share*share)).sum(),
              hhi_4: _(shares).map(share => (share*share*share*share)).sum(),

              shannon: (-1 * _(shares).filter().map(share => (share * Math.log(share))).sum()),
            }
          })
       )


const aggregateDispersionMeasuresByYear = (dispMeasuresByQtrByYear) => 
  _.mapValues(dispMeasuresByQtrByYear, (dispMeasuresByQtr) => ({
      hhi_2: _(dispMeasuresByQtr).map(dispMeasures => dispMeasures.hhi_2).mean(),
      hhi_3: _(dispMeasuresByQtr).map(dispMeasures => dispMeasures.hhi_3).mean(),
      hhi_4: _(dispMeasuresByQtr).map(dispMeasures => dispMeasures.hhi_4).mean(),
      shannon: _(dispMeasuresByQtr).map(dispMeasures => dispMeasures.shannon).mean(),
    })
  )


const getYearlyEmpVarianceForMSA = (acc, msa, cb) => {
  
  console.time(msa)
  let stopTimer = (d) => { console.timeEnd(msa); return d }

  fetch(buildRequestURL(msa))
    .then(handleFetchErrors)
    .then(response => response.json())
    .then(stopTimer)
    .then(reformatApiResponse)
    .then(forwardFill)
    .then(getMonthlyAveragesByQuarterByYear)
    .then(computeDispersionMeasuresByQuarterByYear)
    .then(aggregateDispersionMeasuresByYear)
    .then((d) => cb(null, _.set(acc, msa, d)))
    .catch(cb)
}


async.reduce(msaIds, {}, getYearlyEmpVarianceForMSA, (err, yearlyEmpVarianceByMSA) => {

  if (err) { return console.error(err) }

  //return console.log(JSON.stringify(yearlyEmpVarianceByMSA, null, 4))
  return fs.writeFileSync(outputFilePath, JSON.stringify(yearlyEmpVarianceByMSA))
})
