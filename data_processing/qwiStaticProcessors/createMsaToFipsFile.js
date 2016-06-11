'use strict'

import fs from 'fs'
import path from 'path'
import _ from 'lodash'

const projectRoot = path.join(__dirname, '../../')

const qwiGeographiesByFipsCodeFilePath = path.join(projectRoot, 'src/static/data/qwiGeographiesByFipsCode.json')

const qwiGeographiesByFipsCode = JSON.parse(fs.readFileSync(qwiGeographiesByFipsCodeFilePath))


let msaToFips = _.reduce(qwiGeographiesByFipsCode, (acc, qwiGeographies, fips) => {
                  qwiGeographies.forEach((geo) => {
                    let msa = geo.substring(2);
                    (acc[msa] || (acc[msa] = [])).push(fips)
                  })
                  return acc
                }, {})

const msaToFipsCodesFilePath = path.join(projectRoot, 'src/support/qwi/msaToFips.js')

fs.writeFileSync(msaToFipsCodesFilePath, `export default ${JSON.stringify(msaToFips, null, 2)}`)
