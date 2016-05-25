'use strict'

import fs from 'fs'
import path from 'path'

const http = require('http')

import {qwiAPIServer} from '../../src/AppConfig'

import async from 'async'
import _ from 'lodash'
import mkdirp from 'mkdirp'


const projectRoot = path.join(__dirname, '../../')


const qwiGeographiesByFipsCodeFilePath = path.join(projectRoot, 'src/static/data/qwiGeographiesByFipsCode.json')

let qwiGeographiesByFipsCode = JSON.parse(fs.readFileSync(qwiGeographiesByFipsCodeFilePath))
// NOTE: The dev qwiAPI server currently only has 'ny' and 'nj'.
qwiGeographiesByFipsCode = _.pick(qwiGeographiesByFipsCode, ['34', '36'])





const requestTheData = (dynamicQueryRoute, cb) => {

  let opts = _.clone(qwiAPIServer)

  opts.path = `/data/${dynamicQueryRoute}?fields=TurnOvrS`

  let req = http.get(opts, response => {

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
        console.log(e.stack)
        return cb(e) 
      }
    })
  })

  req.on('error', e => {
    console.log(e.stack)  
    return cb(e)
  })
  req.end()
}


const handleLeaf = (d) => {
  let agg = _.omit(d[0], ['turnovrs', 'quarter'])

  let turnovrs = d.map(o => o.turnovrs).filter(t => t)

  let turnovrs_sum = turnovrs.reduce((a, t) => a += t, 0)
  agg.turnovrs_avg = (turnovrs.length) ? (turnovrs_sum / turnovrs.length) : null

  agg.turnovrs_quarterly = new Array(4).fill(null)

  for (let i = 0; i < d.length; ++i) {
    agg.turnovrs_quarterly[parseInt(d[i].quarter)-1] = d[i].turnovrs
  }

  return agg
}

const flattenLeaves = (d) => {
  // Because we limit the fields to TurnOvrs, the leaves should be arrays by quarter.
  if (Array.isArray(d)) {
    if (d.length > 4) {
      throw new Error('Assumption that leaf data is quarterly at most failed.')
    }
    
    return handleLeaf(d)

  } else {

    let agg = {}
    let keys = Object.keys(d)

    for (let i = 0; i < keys.length; ++i) {
      agg[keys[i]] = flattenLeaves(d[keys[i]])
    }

    return agg
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

  let dynamicQueryRoute = `geography${qwiGeographiesByFipsCode[fipsCode].join('')}/year`

  let tasks = [
    requestTheData.bind(null, dynamicQueryRoute),
    aggregateLeafData,
  ]
  async.waterfall(tasks, (err, data) => {
    if (err) { return cb(err) }

    _.forEach(data, (annualTurnvrsData, geography) => {
      let msaCode = geography.slice(2)
      annualTurnvrsData.msa = msaCode 
      acc[msaCode] = annualTurnvrsData  
    })

    return cb(null, acc)
  })
} 


async.reduce(Object.keys(qwiGeographiesByFipsCode), {}, getTurnoverStatistics, (err, result) => {
  if (err) {
    return console.error(err.stack)
  } 

  let outputDir = path.join(projectRoot, 'src/static/data/metroAnnualTurnOvrS/')

  mkdirp.sync(outputDir)

  _.forEach(result, (annualTurnvrsData, msa) => {
    fs.writeFileSync(path.join(outputDir, `${msa}.json`), JSON.stringify(annualTurnvrsData))
  })
})
