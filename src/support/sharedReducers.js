import _ from 'lodash'



export const updateFirstAndLastQuarterWithData = (state, data) => {

  if (!data) { return }

  let firstQtr = _.clone(state.firstQuarterWithData)
  let lastQtr  = _.clone(state.lastQuarterWithData)

  let naicsCodes = Object.keys(data)

  for (let i = 0; i < naicsCodes.length; ++i) {
    let naics = naicsCodes[i]

    let dataForNaics = data[naics]

    if (!(Array.isArray(dataForNaics) && dataForNaics.length)) { continue }

    if (dataForNaics[0].year <= firstQtr.year) {
      if (dataForNaics[0].quarter < firstQtr.quarter) {
        firstQtr = {
          year: dataForNaics[0].year,
          quarter: dataForNaics[0].quarter,
        }
      } 
    }

    if (dataForNaics[dataForNaics.length - 1].year >= lastQtr.year) {
      if (dataForNaics[dataForNaics.length - 1].quarter > lastQtr.quarter) {
        lastQtr = {
          year: dataForNaics[dataForNaics.length - 1].year,
          quarter: dataForNaics[dataForNaics.length - 1].quarter,
        }
      } 
    }
  }

  state.firstQuarterWithData = firstQtr
  state.lastQuarterWithData  = lastQtr
}



export const resetFirstAndLastQuarterWithData = (state) => {
  state.firstQuarterWithData = {
    year: Number.POSITIVE_INFINITY,
    quarter: Number.POSITIVE_INFINITY,
  }

  state.lastQuarterWithData = {
    year: Number.NEGATIVE_INFINITY,
    quarter: Number.NEGATIVE_INFINITY,
  }
}



export const newOverviewTableDataComparator = (sortField, tableData) =>

  (naicsCodeA, naicsCodeB) => {

    let order = ((sortField === 'naicsCode') || 
                 (sortField === 'sectorTitle')) ? 1 : -1

    let aVal = _.get(tableData, [naicsCodeA, sortField], '')
    let bVal = _.get(tableData, [naicsCodeB, sortField], '')

    // Get rid of the formatting so we can do numerical comparisons.
    aVal = aVal.replace ? aVal.replace(/\$|,|\*/g, '') : aVal
    bVal = bVal.replace ? bVal.replace(/\$|,|\*/g, '') : bVal

    let aNum = parseFloat(aVal)
    let bNum = parseFloat(bVal)

    if (!(Number.isFinite(aNum) || Number.isFinite(bNum))) {
      return (aVal.localeCompare(bVal) * order)
    }

    if (Number.isFinite(aNum) && !Number.isFinite(bNum)) {
      return (1 * order)
    }

    if (!Number.isFinite(aNum) && Number.isFinite(bNum)) {
      return (-1 * order)
    }

    return ((aNum - bNum) * order)
  }



const tooltipValGetter = (x) => ((Number.isFinite(x.value)) ? x.value : Number.NEGATIVE_INFINITY)
export const tooltipComparator = (a,b) => (tooltipValGetter(b) - tooltipValGetter(a))


export const lineGraphDataTransformer = (data, colorMappings) => {

  if (!data) { return null }

  let naicsCodes = _(data).keys().pull('00').sort().value()

  let lineGraphRawData = []

  naicsCodes.forEach((naics) => {

    let color = colorMappings[naics]

    let dataArr = data[naics]
 
    if (!Array.isArray(dataArr)) { return null }

    dataArr.forEach(d => {

      let val = d.value
      let filledValue = d.filledValue

      let month = 1 + 3*(d.quarter-1)
      let quarterCentralMonth = new Date(d.year, month)

      let elem = {
        key: quarterCentralMonth,
        values: {
          x: quarterCentralMonth,
          y: val,
        },
      }

      let lastLineGraphRawDataElem = _.last(lineGraphRawData)

      if ((_.get(lastLineGraphRawDataElem, 'key') !== naics) ||
          (_.get(lastLineGraphRawDataElem, 'filledValue') !== filledValue)) {

            lineGraphRawData.push({
              color: color,
              key: naics,
              values: [],
              filledValue,
            })

            // Connect the fill segment with the new non-filled segment.
            if (lastLineGraphRawDataElem && (lastLineGraphRawDataElem.key === naics)) {
            
              if (filledValue) {
                _.last(lineGraphRawData).values.push(_.last(lastLineGraphRawDataElem.values)) 
              } else {
                lastLineGraphRawDataElem.values.push(elem)
              }
            }
      }

      _.last(lineGraphRawData).values.push(elem) 
    })
  })

  return lineGraphRawData
}


