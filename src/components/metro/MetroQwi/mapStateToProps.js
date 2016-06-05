"use strict"

import d3 from 'd3'

import { industryTitles } from '../../../support/qwi'


const colors = d3.scale.category20()

const naicsCodes = Object.keys(industryTitles).sort()



const getData = (state, ownProps) => {

  state = state.metroQwiData

  console.log(state)

  let msa = state.msa
  let measure = state.measure

  if (! ( (_.get(state.inventory, ['ratiosByFirmage', '00', `${measure}_ratio`]) === 'RECEIVED') &&
          (_.get(state.inventory, ['ratiosByFirmage', msa, `${measure}_ratio`]) === 'RECEIVED') &&
          (_.get(state.inventory, ['raw', msa, measure]) === 'RECEIVED'))) { 
    
            return null 
  }

  let focusedLineGraph = _.get(state, 'lineGraphs.focused')
  let tooltipData   = []

  let rawData = state.data.raw[msa] // { [year]: { [quarter]: [naics]: { ...measures } } }
  let tooltipYearQuarter = _.get(state, 'lineGraphs.tooltip.yearQuarter')

  let rawDataYears = Object.keys(rawData).sort()

  let lineGraphRawData = []

  naicsCodes.forEach((naics, i) => {

    let color = colors(i % 20)

    let naicsData = {
      color  : color,
      key    : naics,
      values : [],
    }

    rawDataYears.forEach(year => {
      [1,2,3,4].forEach(quarter => {

        let measureValue = _.get(rawData, [year, quarter, naics, /*firmage*/'1', measure], null)

        if (measureValue === null) { return }

        let month = 2 + 3*(quarter-1)
        let quarterCentralMonth = d3.time.format("%m-%Y").parse(`${month}-${year}`)

        naicsData.values.push({
          key    : quarterCentralMonth,
          values : {
            x: quarterCentralMonth,
            y: measureValue,
          }
        }) 

        if ((focusedLineGraph === 'qwi-rawData-linegraph') && 
            (+year === +tooltipYearQuarter.year) && 
            (+quarter === +tooltipYearQuarter.quarter)) {

              tooltipData.push({
                color: color,
                key: naics,
                value: measureValue,
              })
        }
      })
    })

    if (naicsData.values.length) { lineGraphRawData.push(naicsData) }
  })


  let nationalRatiosData = state.data.ratiosByFirmage['00']
  let ratiosData = state.data.ratiosByFirmage[msa]

  let ratiosDataYears = Object.keys(ratiosData).sort()

  let lineGraphLQData = []


  naicsCodes.forEach((naics, i) => {

    let color = colors(i % 20)

    let naicsRatioData = {
      color  : color,
      key    : naics,
      values : [],
    }

    ratiosDataYears.forEach(year => {
      [1,2,3,4].forEach(quarter => {

        let msaRatio = _.get(ratiosData, [year, quarter, naics, /*firmage*/'1', `${measure}_ratio`], null)

        if (msaRatio === null) { return }

        let nationalRatio = _.get(nationalRatiosData, [year, quarter, naics, /*firmage*/'1', `${measure}_ratio`], null)
        let locationQuotient = msaRatio/nationalRatio

        let month = 2 + 3*(quarter-1)
        let quarterCentralMonth = d3.time.format("%m-%Y").parse(`${month}-${year}`)

        naicsRatioData.values.push({
          key    : quarterCentralMonth,
          values : {
            x: quarterCentralMonth,
            y: locationQuotient,
          }
        }) 

        if ((focusedLineGraph === 'qwi-lqData-linegraph') &&
            (+year === +tooltipYearQuarter.year) && 
            (+quarter === +tooltipYearQuarter.quarter)) {

              tooltipData.push({
                color: color,
                key: naics,
                value: locationQuotient,
              })
        }
      })
    })

    if (naicsRatioData.values.length) { lineGraphLQData.push(naicsRatioData) }
  })

  let selectorYearQuarterList = _(rawData)
                               .map((quarterlyData, year) => _.map(quarterlyData, (byNaics, quarter) => ({ label: `${year}-Q${quarter}`, value: { year, quarter }})))
                               .flatMap()
                               .sortBy('label')
                               .value()

  return {
    lineGraphRawData : lineGraphRawData.length ? lineGraphRawData : null,
    lineGraphLQData : lineGraphLQData.length ? lineGraphLQData : null,
    tooltipData      : tooltipData.length ? tooltipData : null,
    selectorYearQuarterList : selectorYearQuarterList.length ? selectorYearQuarterList : null,
  }
}


export default function (state, ownProps) { return _.assign({}, getData(state, ownProps)) }
