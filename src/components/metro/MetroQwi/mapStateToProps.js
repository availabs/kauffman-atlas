"use strict"

import d3 from 'd3'

import { industryTitles } from '../../../support/qwi'


const colors = d3.scale.category20()

const naicsCodes = Object.keys(industryTitles).sort()



const getData = (state, ownProps) => {

console.log(ownProps)

  state = state.metroQwiData

  let msa = state.msa
  let measure = state.measure


  if (_.get(state.inventory, [msa, measure]) !== 'RECEIVED') { return null }


  let msaData = state.data[msa] // { [year]: { [quarter]: [naics]: { ...measures } } }
  let tooltipQuarter = state.quarter

  let years = Object.keys(msaData).sort()

  let lineGraphData = []
  let tooltipData   = []

  naicsCodes.forEach((naics, i) => {

    let color = colors(i % 20)

    let naicsData = {
      color  : color,
      key    : naics,
      values : [],
    }

    years.forEach(year => {
      [1,2,3,4].forEach(quarter => {

        let measureValue = _.get(msaData, [year, quarter, naics, measure], null)

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

        if ((+year === +tooltipQuarter.yr) && (+quarter === +tooltipQuarter.qrt)) {
          tooltipData.push({
            color: color,
            key: naics,
            value: measureValue,
          })
        }
      })
    })

    if (naicsData.values.length) { lineGraphData.push(naicsData) }
  })

  return {
    lineGraphData : lineGraphData.length ? lineGraphData : null,
    tooltipData   : tooltipData.length   ? tooltipData   : null,
  }
}


export default function (state, ownProps) { return _.assign({}, getData(state, ownProps)) }
