"use strict"

import d3 from 'd3'

import { industryTitles, firmageLabels, currencyMeasures } from '../../../support/qwi'


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

  let radarGraphFirmage = state.radarGraphs.firmage
  let radarGraphFirmageLabel = firmageLabels[radarGraphFirmage]

  let overviewTableData = {}

  let focusedLineGraph = _.get(state, 'lineGraphs.focused')
  let tooltipData   = []

  let rawData = state.data.raw[msa] // { [year]: { [quarter]: [naics]: { ...measures } } }
  
  let lastYearQuarterInData = (() => {
    let year = _.max(Object.keys(rawData).map(y => +y))
    let quarter = _.max(Object.keys(rawData[year]).map(q => +q))
  
    return { 
      year,
      quarter,
    }
  })()

  let tooltipYearQuarter = _.get(state, 'lineGraphs.tooltip.yearQuarter')
    
  if (tooltipYearQuarter.year === null) {
    tooltipYearQuarter = lastYearQuarterInData
  }

  let rawDataYears = Object.keys(rawData).sort()

  let lineGraphRawData = []
  let shareByIndustryRadarGraphData = []

  naicsCodes.forEach((naics, i) => {

    let color = colors(i % 20)

    let previousRawValue = 0

    rawDataYears.forEach(year => {
      Object.keys(rawData[year]).forEach(quarter => {

        let measureValue = parseFloat(_.get(rawData, [year, quarter, naics, /*firmage*/'1', measure]))

        measureValue = (!isNaN(measureValue)) ? measureValue : null

        let filledNull = false

        if (measureValue === null) {
          measureValue = previousRawValue

          filledNull = true
        }
        previousRawValue = measureValue


        let month = 2 + 3*(quarter-1)
        let quarterCentralMonth = d3.time.format("%m-%Y").parse(`${month}-${year}`)

        let elem = {
          key: quarterCentralMonth,
          values: {
            x: quarterCentralMonth,
            y: measureValue,
          },
        }

        let lastLineGraphRawDataElem = _.last(lineGraphRawData)
        if ((_.get(lastLineGraphRawDataElem, 'key') !== naics) ||
            (_.get(lastLineGraphRawDataElem, 'filledNull') !== filledNull)) {

              lineGraphRawData.push({
                color: color,
                key: naics,
                values: [],
                filledNull,
              })

              // Connect the fill segment with the new non-filled segment.
              if (lastLineGraphRawDataElem && (lastLineGraphRawDataElem.key === naics)) {
              
                if (filledNull) {
                  _.last(lineGraphRawData).values.push(_.last(lastLineGraphRawDataElem.values)) 
                } else {
                  lastLineGraphRawDataElem.values.push(elem)
                }
              }
        }

        _.last(lineGraphRawData).values.push(elem) 


        if ((+year === +tooltipYearQuarter.year) && (+quarter === +tooltipYearQuarter.quarter)) {

          let allFirmages = _.get(rawData, [year, quarter, naics, /*firmage*/'0', measure], 0)
          let metroTotal = _.get(rawData, [year, quarter, '00', /*firmage*/'0', measure], Number.POSITIVE_INFINITY)

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

        if ((+year === +lastYearQuarterInData.year) && (+quarter === +lastYearQuarterInData.quarter)) {

          let allFirmages = _.get(rawData, [year, quarter, naics, /*firmage*/'0', measure], 0)
          let metroTotal = _.get(rawData, [year, quarter, '00', /*firmage*/'0', measure], Number.POSITIVE_INFINITY)

          _.set(overviewTableData, [naics, 'naics'], naics)
          _.set(overviewTableData, [naics, 'title'], industryTitles[naics])
          _.set(overviewTableData, [naics, 'measureValue'], measureValue)
          _.set(overviewTableData, [naics, 'metroTotal'], metroTotal)
          _.set(overviewTableData, [naics, 'allFirmages'], allFirmages)
        }

      })
    })
  })


  let nationalRatiosData = state.data.ratiosByFirmage['00']
  let ratiosData = state.data.ratiosByFirmage[msa]

  let ratiosDataYears = Object.keys(ratiosData).sort()

  let lineGraphLQData = []

  let shareOfMetroTotalRadarGraphData = []


  naicsCodes.forEach((naics, i) => {

    let color = colors(i % 20)

    let previousRatioValue = 0

    ratiosDataYears.forEach(year => {
      Object.keys(ratiosData[year]).forEach(quarter => {

        let msaRatio = _.get(ratiosData, [year, quarter, naics, /*firmage*/'1', `${measure}_ratio`], null)

        let filledNull = false
        if (msaRatio === null) {
          msaRatio = previousRatioValue

          filledNull = true
        }
        previousRatioValue = msaRatio

        let nationalRatio = _.get(nationalRatiosData, 
                                  [year, quarter, naics, /*firmage*/'1', 
                                  `${measure}_ratio`], Number.POSITIVE_INFINITY)

        let locationQuotient = msaRatio/nationalRatio || 0

        let month = 2 + 3*(quarter-1)
        let quarterCentralMonth = d3.time.format("%m-%Y").parse(`${month}-${year}`)

        let elem = {
          key: quarterCentralMonth,
          values: {
            x: quarterCentralMonth,
            y: locationQuotient,
          },
        }

        let lastLineGraphLQDataElem = _.last(lineGraphLQData)
        if ((_.get(lastLineGraphLQDataElem, 'key') !== naics) ||
            (_.get(lastLineGraphLQDataElem, 'filledNull') !== filledNull)) {

              lineGraphLQData.push({
                color: color,
                key: naics,
                values: [],
                filledNull,
              })

              // Connect the fill segment with the new non-filled segment.
              if (lastLineGraphLQDataElem && (lastLineGraphLQDataElem.key === naics)) {
              
                if (filledNull) {
                  _.last(lineGraphLQData).values.push(_.last(lastLineGraphLQDataElem.values)) 
                } else {
                  lastLineGraphLQDataElem.values.push(elem)
                }
              }
        }

        _.last(lineGraphLQData).values.push(elem) 

        if ((+year === +tooltipYearQuarter.year) && (+quarter === +tooltipYearQuarter.quarter)) {
          let radarGraphFirmageRatio = 
                _.get(ratiosData, [year, quarter, naics, radarGraphFirmage, `${measure}_ratio`], null)

          //console.log('ratiosData:', ratiosData)
          //console.log('radarGraphFirmage:', radarGraphFirmage)
          //console.log('radarGraphFirmageRatio:', radarGraphFirmageRatio)

          shareOfMetroTotalRadarGraphData.push({
            axis: industryTitles[naics].substring(0,6),
            value: radarGraphFirmageRatio,
          })
          
          if (focusedLineGraph === 'qwi-lqData-linegraph') {
            tooltipData.push({
              color: color,
              key: naics,
              value: locationQuotient,
              filledNull,
            })
          }
        }


        if ((+year === +lastYearQuarterInData.year) && (+quarter === +lastYearQuarterInData.quarter)) {
          _.set(overviewTableData, [naics, 'filledNull'], filledNull)
          _.set(overviewTableData, [naics, 'msaRatio'], msaRatio)
          _.set(overviewTableData, [naics, 'nationalRatio'], nationalRatio)
          _.set(overviewTableData, [naics, 'locationQuotient'], locationQuotient)
        }
      })
    })
  })

  let mapper = (quarterlyData, year) => 
                  _.map(quarterlyData, (byNaics, quarter) => ({label: `${year}-Q${quarter}`, value: {year, quarter}}))

  let selectorYearQuarterList = _(rawData).map(mapper).flatMap().sortBy('label').value()

  let measureIsCurrency = currencyMeasures[measure]

  return {
    lineGraphRawData: lineGraphRawData.length ? lineGraphRawData : null,
    lineGraphLQData: lineGraphLQData.length ? lineGraphLQData : null,
    tooltipData: tooltipData.length ? tooltipData : null,
    selectorYearQuarterList: selectorYearQuarterList.length ? selectorYearQuarterList : null,
    shareByIndustryRadarGraphData: [shareByIndustryRadarGraphData],
    shareOfMetroTotalRadarGraphData: [shareOfMetroTotalRadarGraphData],
    overviewTableData,
    yearQuarter: tooltipYearQuarter,
    radarGraphFirmageLabel,
    measureIsCurrency,
    focusedLineGraph,
  }
}


export default function (state, ownProps) { return _.assign({}, getData(state, ownProps)) }
