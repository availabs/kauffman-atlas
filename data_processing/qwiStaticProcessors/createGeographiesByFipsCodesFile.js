import path from 'path'

import fs from 'fs'
import {qwiApi} from '../../src/AppConfig'

import _ from 'lodash'

import {abbrToFips as stateAbbrToFips } from '../../src/static/data/stateAbbrToFull'

const projectRoot = path.join(__dirname, '../../')

const msaNamesFilePath = path.join(projectRoot, 'src/static/data/msaName.json')
const msaToNamesTable = JSON.parse(fs.readFileSync(msaNamesFilePath))

const stateMatcher = /[A-Z\-]+$/

const qwiGeographiesByFipsCode = _.reduce(msaToNamesTable, (acc, msaName, msaCode) => {
  let stateAbbrs = msaName.match(stateMatcher)[0].split('-')

  let fipsCodes = stateAbbrs.map(stateAbbr => stateAbbrToFips[stateAbbr])

  fipsCodes.forEach(fipsCode => (acc[fipsCode] || (acc[fipsCode] = [])).push(`${fipsCode}${msaCode}`))

  return acc
}, {})

_.values(qwiGeographiesByFipsCode, geographies => geographies.sort())

const qwiGeographiesByFipsCodeFilePath = path.join(projectRoot, 'src/static/data/qwiGeographiesByFipsCode.json')
fs.writeFileSync(qwiGeographiesByFipsCodeFilePath, JSON.stringify(qwiGeographiesByFipsCode))
