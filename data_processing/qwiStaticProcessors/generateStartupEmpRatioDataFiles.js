'use strict'

import fs from 'fs'
import path from 'path'
import fetch from 'isomorphic-fetch'
import _ from 'lodash'

import {qwiAPIServer} from '../../src/AppConfig'

import { msaToFips } from '../../src/support/qwi/msaToFips'

import { industryTitles } from '../../../support/qwi'

const msaCodes = Object.keys(msaToFips)

const projectRoot = path.join(__dirname, '../../')

const qwiGeographiesByFipsCode = 
        JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/static/data/qwiGeographiesByFipsCode.json')))

const allQwiIndustryCodes = Object.keys(industryTitles).concat(['00000']).map(code => _.padStart(code, 5, '0')).sort()


const requestTheData = (url, cb) =>
  fetch(url)
    .then(response => response.json())
    .then(cb.bind(null, null))
    .catch(cb)



const getEmpRatioStatisticsForMSA = (msa, cb) => {

  let fipsCodesForMSA = msaToFips[msa]

  let isInterstate = (fipsCodesForMSA.length > 1)

  let msaCode = (isInterstate) ? msa : `${fipsCodesForMSA[0]}${msa}`


  let url = `http://${qwiAPIServer.hostname}${qwiAPIServer.port ? ':'+qwiAPIServer.port : ''}/` + 
            `${isInterstate ? 'derived-data/interstate-msa/' : 'data/'}geography${msaCode}/` +
            `/year20012016/quarter/industry${allQwiIndustryCodes.join('')}/` + 
            `firmage012345?fields=EmpTotal&dense=true&flatLeaves=true` 

  console.time(msa)

  requestTheData(url, (err, d) => {

    console.timeEnd(msa)

    if (err) { return cb(err) }

    const acrossIndustriesRatioCalculator = (qrt) => (_.get(q, ['00', '1'] / _.get(q, ['00', '0']))
    const informationSectorCalculator = (qrt) => (_.get(q, ['51', '1'] / _.get(q, ['00', '0']))
    const professionalSectorCalculator = (qrt) => (_.get(q, ['54', '1'] / _.get(q, ['00', '0']))
    const exceptAccommAndRetailSectorCalculator = 
            (qrt) => ((_.get(q, ['00','1']) - _.get(q, ['72','1']) - _.get(q, ['44-45','1']))) / _.get(q, ['00','0']))

    const ratioGetter = (calcFunc) =>  
        _.pickBy(_.mapValues(d.data[msaCode], qrtD=> _(qrtD).values().map(calcFunc)), _.isFinite)

    try {
      return cb(null, {
        acrossIndustries : ratioGetter(acrossIndustriesRatioCalculator),
        informationSector : ratioGetter(informationSectorCalculator),
        professionalSector : ratioGetter(professionalSectorCalculator),
        exceptAccommAndRetailSector : ratioGetter(exceptAccommAndRetailSectorCalculator),
      }
    } catch (e) {
      return cb(e) 
    }
  })
} 


const worker = (i, empRatios) => {
  
  //if (i === msaCodes.length) {
  if (i === 2) {
    //return fs.writeFileSync(path.join(__dirname,'../../src/static/data/churn.json'),JSON.stringify(empRatios))
    return console.log(JSON.stringify(empRatios, null, 4))
  }

  let msa = msaCodes[i]
  getEmpRatioStatisticsForMSA(msa, (err, data) => {
    if (err) {
      console.error(`Error processing MSA ${msa}.\n${err.stack || err}`)
    } else {
      empRatios[msa] = data
    }

    worker(++i, empRatios)
  })
}

worker(0, {})
