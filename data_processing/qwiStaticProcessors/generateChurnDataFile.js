'use strict'

import fs from 'fs'
import path from 'path'

const http = require('http')

import {qwiAPIServer} from '../../src/AppConfig'

import async from 'async'
import _ from 'lodash'


const projectRoot = path.join(__dirname, '../../')



const qwiGeographiesByFipsCodeFilePath = path.join(projectRoot, 'src/static/data/qwiGeographiesByFipsCode.json')
const qwiGeographiesByFipsCode = JSON.parse(fs.readFileSync(qwiGeographiesByFipsCodeFilePath))


let lastYearWithData = Number.NEGATIVE_INFINITY



const requestTheData = (dynamicQueryRoute, cb) => {

  let opts = _.clone(qwiAPIServer)

  opts.path = `/data/${dynamicQueryRoute}?fields=TurnOvrS`

  return http.get(opts, response => {

    response.on('close', () => {
      cb(new Error('Response closed'))
    })

    response.setTimeout(300000, () => {
      cb(new Error('Response Timed out'))
    })

    let body = ''
    response.on('data', d => (body += d))

    response.on('end', () => {
      try {
        let respJSON = JSON.parse(body)

        if (response.statusCode !== 200) {
          return cb(new Error((respJSON && respJSON.error) || `Error: ${response.statusCode} statusCode from server`))
        }

        return cb(null, respJSON.data)
      } catch (e) {
        return cb(e) 
      }
    })

  }).on('error', cb)
    .setTimeout(300000, () => cb(new Error('Request timed out.')))
    .end()
}



const handleLeaf = (d) => {
  let turnovrs = d.map(o => o.turnovrs).filter(t => !isNaN(parseFloat(t)))
  let turnovrs_sum = turnovrs.reduce((a, t) => a += t, 0)

  let turnovrs_avg = (turnovrs.length) ? parseFloat((turnovrs_sum/turnovrs.length).toPrecision(3)) : null;

  if ((turnovrs_avg !== null) && (+d[0].year > lastYearWithData)) {
    lastYearWithData = +d[0].year
  }

  return turnovrs_avg
}



const flattenLeaves = (d) => {
  // Because we limit the fields to TurnOvrs, the leaves should be arrays by quarter.
  if (Array.isArray(d)) {
    return handleLeaf(d)
  } else {
    return _.mapValues(d, flattenLeaves)
  }
} 



const aggregateLeafData = (data, cb) => {
  try {
    cb(null, flattenLeaves(data))
  } catch (e) {
    return cb(e)
  }
}



const getTurnoverStatistics = (acc, fipsCode, cb) => {

  console.time(fipsCode)

  let dynamicQueryRoute = `geography${qwiGeographiesByFipsCode[fipsCode].join('')}/year`
  //let dynamicQueryRoute = `geography${_.take(qwiGeographiesByFipsCode[fipsCode],2).join('')}/year`

  let tasks = [
    requestTheData.bind(null, dynamicQueryRoute),
    aggregateLeafData,
  ]

  async.waterfall(tasks, (err, data) => {

    console.timeEnd(fipsCode)
    if (err) { return cb(err) }

    _.forEach(data, (annualTurnOvrS, geography) => {
      let msaCode = geography.slice(2)

      acc[msaCode] = _.pickBy(annualTurnOvrS, (turnovrs, year) => (year <= lastYearWithData))
    })

    return cb(null, acc)
  })
} 


let fipsCodes = Object.keys(qwiGeographiesByFipsCode).sort()

async.reduce(fipsCodes, {}, getTurnoverStatistics, (err, result) => {

  if (err) {
    return console.error(err.stack || err)
  } 

  let outputFilePath = path.join(projectRoot, 'src/static/data/churn.json')

  fs.writeFileSync(outputFilePath, JSON.stringify(result))
})
