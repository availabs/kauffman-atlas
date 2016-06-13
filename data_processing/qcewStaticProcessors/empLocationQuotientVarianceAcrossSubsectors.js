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

      let lq_month1_emplvl_Arr = []
      let lq_month2_emplvl_Arr = []
      let lq_month3_emplvl_Arr = []

      bySubsector.forEach(subsectorData => {
        let subsector = subsectorData.key

        let lqEmpData = subsectorData.values[0]         

        lq_month1_emplvl_Arr.push(+lqEmpData.lq_month1_emplvl)
        lq_month2_emplvl_Arr.push(+lqEmpData.lq_month2_emplvl)
        lq_month3_emplvl_Arr.push(+lqEmpData.lq_month3_emplvl)
      })

      lq_month1_emplvl_Arr = lq_month1_emplvl_Arr.filter(Number.isFinite)
      lq_month2_emplvl_Arr = lq_month2_emplvl_Arr.filter(Number.isFinite)
      lq_month3_emplvl_Arr = lq_month3_emplvl_Arr.filter(Number.isFinite)

      let avg_1 = _.mean(lq_month1_emplvl_Arr)
      let avg_2 = _.mean(lq_month2_emplvl_Arr)
      let avg_3 = _.mean(lq_month3_emplvl_Arr)

      let variance_1 = _.meanBy(lq_month1_emplvl_Arr, (lqEmp) => ((lqEmp - avg_1)*(lqEmp - avg_1)))
      let variance_2 = _.meanBy(lq_month2_emplvl_Arr, (lqEmp) => ((lqEmp - avg_2)*(lqEmp - avg_2)))
      let variance_3 = _.meanBy(lq_month3_emplvl_Arr, (lqEmp) => ((lqEmp - avg_3)*(lqEmp - avg_3)))

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
                    `?fields[]=lq_month1_emplvl&fields[]=lq_month2_emplvl&fields[]=lq_month3_emplvl`

  fetch(reqURL)
    .then()
    .then(response => response.json())
    .then(computeYearlyByEmpVariance)
    .then(cb.bind(null, null))
    .catch(cb)
}


const worker = (i, variancesByMSAs) => {
  
  if (i === msaIds.length) {
    let outputFilePath = path.join(__dirname, '../../src/static/data/empLocationQuotientVarianceAcrossSubsectors.json') 

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
