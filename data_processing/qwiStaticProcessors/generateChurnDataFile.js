'use strict'

import fs from 'fs'
import path from 'path'
import fetch from 'isomorphic-fetch'
import _ from 'lodash'

import {qwiAPIServer} from '../../src/AppConfig'

import { msaToFips } from '../../src/support/qwi/msaToFips'

const msaCodes = Object.keys(msaToFips)

const projectRoot = path.join(__dirname, '../../')

const qwiGeographiesByFipsCode = 
        JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/static/data/qwiGeographiesByFipsCode.json')))



const requestTheData = (url, cb) =>
  fetch(url)
    .then(response => response.json())
    .then(cb.bind(null, null))
    .catch(cb)



const getTurnoverStatisticsForMSA = (msa, cb) => {

  let fipsCodesForMSA = msaToFips[msa]

  let isInterstate = (fipsCodesForMSA.length > 1)

  let msaCode = (isInterstate) ? msa : `${fipsCodesForMSA[0]}${msa}`


  let url = `http://${qwiAPIServer.hostname}${qwiAPIServer.port ? ':'+qwiAPIServer.port : ''}/` + 
            `${isInterstate ? 'derived-data/interstate-msa/' : 'data/'}geography${msaCode}/` +
            `year/quarter?fields=TurnOvrS&dense=true&flatLeaves=true`

  console.time(msa)

  requestTheData(url, (err, d) => {

    console.timeEnd(msa)

    if (err) { return cb(err) }

    try {
      return cb(null, _.pickBy(_.mapValues(d.data[msaCode], 
                        (qrtD) => _(qrtD).values().map(q => parseFloat(q.turnovrs)).mean()), (x=>x)))
    } catch (e) {
      return cb(e) 
    }
  })
} 


const worker = (i, annualChurnForMSAs) => {
  
  if (i === msaCodes.length) {
    return fs.writeFileSync(path.join(__dirname,'../../src/static/data/churn.json'),JSON.stringify(annualChurnForMSAs))
  }

  let msa = msaCodes[i]
  getTurnoverStatisticsForMSA(msa, (err, data) => {
    if (err) {
      console.error(`Error processing MSA ${msa}.\n${err.stack || err}`)
    } else {
      annualChurnForMSAs[msa] = data
    }

    worker(++i, annualChurnForMSAs)
  })
}

worker(0, {})
