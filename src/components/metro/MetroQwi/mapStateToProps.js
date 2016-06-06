"use strict"

import d3 from 'd3'

import { industryTitles } from '../../../support/qwi'


const colors = d3.scale.category20()

const naicsCodes = Object.keys(industryTitles).sort()



const getData = (state, ownProps) => {

  state = state.metroQwiData

  let msa = state.msa
  let measure = state.measure

  if (! ( (_.get(state.inventory, ['ratiosByFirmage', '00', `${measure}_ratio`]) === 'RECEIVED') &&
          (_.get(state.inventory, ['ratiosByFirmage', msa, `${measure}_ratio`]) === 'RECEIVED') &&
          (_.get(state.inventory, ['raw', msa, measure]) === 'RECEIVED'))) { 
    
            return null 
  }

  let overviewTableData = {}

  let focusedLineGraph = _.get(state, 'lineGraphs.focused')
  let tooltipData   = []

  let rawData = state.data.raw[msa] // { [year]: { [quarter]: [naics]: { ...measures } } }
  let tooltipYearQuarter = _.get(state, 'lineGraphs.tooltip.yearQuarter')
  
  if (!tooltipYearQuarter.year) {
    let year = _.max(Object.keys(rawData))
    let quarter = _.max(Object.keys(rawData[year]))
    
    tooltipYearQuarter = { 
      year,
      quarter,
    }
  }

console.log(tooltipYearQuarter)

  let rawDataYears = Object.keys(rawData).sort()

  let lineGraphRawData = []
  let shareByIndustryRadarGraphData = []

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

        if ((+year === +tooltipYearQuarter.year) && 
            (+quarter === +tooltipYearQuarter.quarter)) {

              let metroTotal = _.get(rawData, [year, quarter, '00', /*firmage*/'0', measure], null)
              let allFirmages = _.get(rawData, [year, quarter, naics, /*firmage*/'0', measure], null)

              _.set(overviewTableData, [naics, 'title'], industryTitles[naics])
              _.set(overviewTableData, [naics, 'measureValue'], metroTotal)
              _.set(overviewTableData, [naics, 'metroTotal'], metroTotal)
              _.set(overviewTableData, [naics, 'allFirmages'], allFirmages)

              shareByIndustryRadarGraphData.push({
                axis: industryTitles[naics].substring(0,6),
                value: (allFirmages / metroTotal),
              })

              if (focusedLineGraph === 'qwi-rawData-linegraph') {
                tooltipData.push({
                  color: color,
                  key: naics,
                  value: measureValue,
                })
              }
        }
      })
    })

    if (naicsData.values.length) { lineGraphRawData.push(naicsData) }
  })


  let nationalRatiosData = state.data.ratiosByFirmage['00']
  let ratiosData = state.data.ratiosByFirmage[msa]

  let ratiosDataYears = Object.keys(ratiosData).sort()

  let lineGraphLQData = []

  let shareOfMetroTotalRadarGraphData = []


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

        if ((+year === +tooltipYearQuarter.year) && (+quarter === +tooltipYearQuarter.quarter)) {

          shareOfMetroTotalRadarGraphData.push({
            axis: industryTitles[naics].substring(0,6),
            value: msaRatio,
          })
          
          _.set(overviewTableData, [naics, 'msaRatio'], msaRatio)
          _.set(overviewTableData, [naics, 'nationalRatio'], nationalRatio)
          _.set(overviewTableData, [naics, 'locationQuotient'], locationQuotient)

          if (focusedLineGraph === 'qwi-lqData-linegraph') {
            tooltipData.push({
              color: color,
              key: naics,
              value: locationQuotient,
            })
          }
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

  console.log(overviewTableData)

  return {
    lineGraphRawData : lineGraphRawData.length ? lineGraphRawData : null,
    lineGraphLQData : lineGraphLQData.length ? lineGraphLQData : null,
    tooltipData      : tooltipData.length ? tooltipData : null,
    selectorYearQuarterList : selectorYearQuarterList.length ? selectorYearQuarterList : null,
    shareByIndustryRadarGraphData: [shareByIndustryRadarGraphData, shareByIndustryRadarGraphData],
    shareOfMetroTotalRadarGraphData: [shareOfMetroTotalRadarGraphData, shareOfMetroTotalRadarGraphData],
    overviewTableData,
  }
}


export default function (state, ownProps) { return _.assign({}, getData(state, ownProps)) }
