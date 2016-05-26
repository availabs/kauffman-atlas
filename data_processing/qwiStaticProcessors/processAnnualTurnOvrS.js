'use strict'

const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const projectRoot = path.join(__dirname, '../../')

const msaToName = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/static/data/msaName.json')))

const processedTurnOvrSFilePath = path.join(projectRoot, 'src/static/data/processedAnnualTurnOvrS.json')



const getRankingsByYear = data => {

  const byYearRankings = _.reduce(data, (acc, annualChurnForMSA, msaCode) => {
    _.forEach(annualChurnForMSA, (churnValue, year) => {
      (acc[year] || (acc[year] = [])).push({ msa: msaCode, value: churnValue })
    })

    return acc
  }, {})

  const comparator = (a,b) => (((b.value !== null) ? b.value : -1) - ((a.value !== null) ? a.value : -1))

  // Sort (in-place) each year's list of {msa, value} objects.
  _.forEach(byYearRankings, msaChurnArrForYear => msaChurnArrForYear.sort(comparator))

  return byYearRankings
}


  // For each year, create a table of MSA -> rank.
const getMSAByYearRankingTables = byYearRankings => 
  _.mapValues(byYearRankings, (sortedChurnForYear, year) => {

    let h = _.head(sortedChurnForYear)
    let previousChurnValue = h.value
    let rank = 1

    return _.reduce(_.tail(sortedChurnForYear), (acc, d, i) => {
      // All MSAs with same churn value should be tied in rank.
      if (previousChurnValue !== d.value) {
        // As we are using tail on a zero-indexed array, the ordinal # of an element is the index + 2.
        rank = (i + 2)
      }

      acc[d.msa] = rank
      previousChurnValue = d.value

      return acc
    }, { [h.msa]: rank })
  })



// data's structure: { msa: { year: <turnovrs> } }
const processAnnualTurnOvrS = data => {

  const rankingsByYear = getRankingsByYear(data)

  const msaByYearRankingTables = getMSAByYearRankingTables(rankingsByYear)

  // We order the metros in the output file by their ranking in the last year with data.
  const lastYearRankings = rankingsByYear[_.max(_.keys(rankingsByYear))].map(d => d.msa)

  return {
    raw : _.map(lastYearRankings, msa => ({
              key : msa,
              name: msaToName[msa],
              values: _.sortBy(_.map(data[msa], (tovr, yr) => ({
                x: +yr, 
                y: tovr, 
                rank: msaByYearRankingTables[yr][msa],
              })),'x')
          }))
  }
}


module.exports = processAnnualTurnOvrS



// If this module was run as a script.
if (require.main === module) {

  const annualChurnData = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/static/data/annualTurnOvrS.json'));

  const processed = processAnnualTurnOvrS(annualChurnData)

  fs.writeFileSync(processedTurnOvrSFilePath, (JSON.stringify(processed, null, 2)))
} 
