#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')
const fetch = require('isomorphic-fetch')
const _ = require('lodash')


//http://qcew.availabs.org/data/fipsC4106/ind000022/yr20012012/qtr1234/?fields[]=month1_emplvl&fields[]=month2_emplvl&fields[]=month3_emplvl
const msaIds = 
        Object.keys(JSON.parse(fs.readFileSync('../../src/static/msaIdToName.json')))

const sixDigitNAICsCodes = 
        Object.keys(JSON.parse(fs.readFileSync('../../src/static/data/naicsKeys.json'))).filter(c => (c.length === 6))


const years = _.range(2001, 2017)


const errorHandler = (msa, err) => {
}

const computeYearlyByEmpVariance = (data) => {

  let msa = data[0].key
  let byYear = data[0].values

  let variances = {}

  byYear.forEach(yearData => {
    let year = yearData.key

    let monthlyVariances = []

    let byQuarter = yearData.values

    byQuarter.forEach(quarterData => {
      let quarter = quarterData.key

      let bySubsector = quarterData.values

      let emp_1_Arr = []
      let emp_2_Arr = []
      let emp_3_Arr = []

      bySubsector.forEach(subsectorData => {
        let subsector = subsectorData.key

        let empData = subsectorData.values[0]         

        emp_1_Arr.push(+empData.month1_emplvl)
        emp_2_Arr.push(+empData.month2_emplvl)
        emp_3_Arr.push(+empData.month3_emplvl)
      })

      emp_1_Arr = emp_1_Arr.filter(Number.isFinite)
      emp_2_Arr = emp_2_Arr.filter(Number.isFinite)
      emp_3_Arr = emp_3_Arr.filter(Number.isFinite)

      let avg_1 = _.mean(emp_1_Arr)
      let avg_2 = _.mean(emp_2_Arr)
      let avg_3 = _.mean(emp_3_Arr)

      let variance_1 = _.meanBy(emp_1_Arr, (emp) => ((emp - avg_1)*(emp - avg_1)))
      let variance_2 = _.meanBy(emp_2_Arr, (emp) => ((emp - avg_2)*(emp - avg_2)))
      let variance_3 = _.meanBy(emp_3_Arr, (emp) => ((emp - avg_3)*(emp - avg_3)))

      monthlyVariances.push(variance_1)
      monthlyVariances.push(variance_2)
      monthlyVariances.push(variance_3)
    })

    variances[year] = _.mean(monthlyVariances)
  })

  return variances
}



const getYearlyEmpVarianceForMSA = (msa, cb) => {

  let reqURL = `http://qcew.availabs.org/data/` +
                    `fips${`C${msa.slice(0,4)}`}/` +
                    `yr${years.join('')}/qtr1234/` + 
                    `/ind${sixDigitNAICsCodes.join('')}/` + 
                    `?fields[]=month1_emplvl&fields[]=month2_emplvl&fields[]=month3_emplvl`

  fetch(reqURL)
    .then()
    .then(response => response.json())
    .then(computeYearlyByEmpVariance)
    .then(cb.bind(null, null))
    .catch(cb)
}


const worker = (i, variancesByMSAs) => {
  
  if (i === msaIds.length) {
    let outputFilePath = path.join(__dirname, '../../src/static/data/employmentVarianceAcrossSubsectors.json') 

    return fs.writeFileSync(outputFilePath, JSON.stringify(variancesByMSAs))
  }

  let msa = msaIds[i]

  console.time(msa)
  getYearlyEmpVarianceForMSA(msa, (err, yearlyVariances) => {
    console.timeEnd(msa)
    if (err) {
      console.error(`Error processing data for ${msa}.`)
      console.error(err.stack || err)
    } else {
      variancesByMSAs[msa] = yearlyVariances 
    }

    worker(++i, variancesByMSAs)
  })
}


worker(0, {})
