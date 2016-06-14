'use strict'

import fs from 'fs'
import path from 'path'
import fetch from 'isomorphic-fetch'
import _ from 'lodash'

import {qwiAPIServer} from '../../src/AppConfig'

import { industryTitles, msaToFips } from '../../src/support/qwi'

const msaCodes = Object.keys(msaToFips)

const projectRoot = path.join(__dirname, '../../')

const qwiGeographiesByFipsCode = 
        JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/static/data/qwiGeographiesByFipsCode.json')))

const allQwiIndustryCodes = Object.keys(industryTitles).concat(['00000']).map(code => _.padStart(code, 5, '0')).sort()

const handleFetchErrors = (response) => {
  if (response.ok) { return response }

  throw new Error(`Fetch response statusText:\n${response.statusText}`)
}



const requestTheData = (url, cb) =>
  fetch(url)
    .then(handleFetchErrors)
    .then(response => response.json())
    .then(cb.bind(null, null))
    .catch(cb)



const getEmpRatioStatisticsForMSA = (msa, cb) => {

  let fipsCodesForMSA = msaToFips[msa]

  let isInterstate = (fipsCodesForMSA.length > 1)

  let msaCode = (isInterstate) ? msa : `${fipsCodesForMSA[0]}${msa}`


  let url = `http://${qwiAPIServer.hostname}${qwiAPIServer.port ? ':'+qwiAPIServer.port : ''}/` + 
            `${isInterstate ? 'derived-data/interstate-msa/' : 'data/'}geography${msaCode}/` +
            `/year19902016/quarter/industry${allQwiIndustryCodes.join('')}/` + 
            `firmage012345?fields=EmpTotal&dense=true&flatLeaves=true` 

  console.time(msa)

  requestTheData(url, (err, d) => {

    console.timeEnd(msa)

    if (err) { return cb(err) }

    const acrossIndustriesRatioCalculator = (q) => 
            (+_.get(q, ['00','1','emptotal']) / +_.get(q, ['00','0','emptotal']))
    const informationSectorCalculator = (q) => 
            (+_.get(q, ['51','1','emptotal']) / +_.get(q, ['00','0','emptotal']))
    const professionalSectorCalculator = (q) => 
            (+_.get(q, ['54','1','emptotal']) / +_.get(q, ['00','0','emptotal']))
    const highTechSectorsCalculator = (q) => 
            ((+_.get(q,['51','1','emptotal']) + (+_.get(q,['54','1','emptotal']))) / +_.get(q, ['00','0','emptotal']))
    const exceptAccommAndRetailSectorCalculator = (q) => 
          (( (+_.get(q,['00','1','emptotal']) - +_.get(q,['72','1','emptotal']) - +_.get(q,['44-45','1','emptotal']))) 
           / +_.get(q,['00','0','emptotal']))

    const ratioGetter = (calcFunc) =>  
        _.pickBy(_.mapValues(d.data[msaCode], qrtD=> _(qrtD).values().map(calcFunc).mean()), _.isFinite)

    try {
      return cb(null, {
        allSectors                   : ratioGetter(acrossIndustriesRatioCalculator),
        informationSector            : ratioGetter(informationSectorCalculator),
        professionalSector           : ratioGetter(professionalSectorCalculator),
        highTech                     : ratioGetter(highTechSectorsCalculator),
        exceptAccommAndRetailSectors : ratioGetter(exceptAccommAndRetailSectorCalculator),
      })
    } catch (e) {
      return cb(e) 
    }
  })
} 


const worker = (i, empRatios) => {
  
  if (i === msaCodes.length) {
    let filePath = path.join(__dirname,'../../src/static/data/shareOfEmploymentInNewFirms-QWI__S_.json')

    fs.writeFileSync(filePath.replace(/_S_/, 'AllSectors'), JSON.stringify(empRatios.allSectors))
    fs.writeFileSync(filePath.replace(/_S_/, 'InformationSector'), JSON.stringify(empRatios.informationSector))
    fs.writeFileSync(filePath.replace(/_S_/, 'ProfessionalSector'), JSON.stringify(empRatios.professionalSector))
    fs.writeFileSync(filePath.replace(/_S_/, 'HighTech'), JSON.stringify(empRatios.highTech))
    fs.writeFileSync(filePath.replace(/_S_/, 'AllExceptAccommodationAndRetailSectors'), 
                     JSON.stringify(empRatios.exceptAccommAndRetailSectors))
    return
  }

  let msa = msaCodes[i]
  getEmpRatioStatisticsForMSA(msa, (err, data) => {
    if (err) {
      console.error(`Error processing MSA ${msa}.\n${err.stack || err}`)
    } else {

      empRatios.allSectors[msa]                   = data.allSectors
      empRatios.informationSector[msa]            = data.informationSector
      empRatios.professionalSector[msa]           = data.professionalSector
      empRatios.highTech[msa]                     = data.highTech
      empRatios.exceptAccommAndRetailSectors[msa] = data.exceptAccommAndRetailSectors
    }

    worker(++i, empRatios)
  })
}

worker(0, { allSectors:{}, informationSector:{}, professionalSector:{}, highTech:{}, exceptAccommAndRetailSectors:{} })
