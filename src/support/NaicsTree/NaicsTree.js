'use strict'

import _ from 'lodash'

import industryTitles from '../qwi/industryTitles'


export class NaicsTree {

  constructor (startEconQuarter, endEconQuarter) {

    this.root = {
      children: null,
    }

    this.startEconQuarter = startEconQuarter
    this.endEconQuarter   = endEconQuarter
  }


  // params: 
  //   data -- must have the following structure: 
  //                   { 
  //                     <naics code>: { 
  //                       <year>: { 
  //                         <quarter>: { 
  //                           <measure>: <value> 
  //                         } 
  //                       } 
  //                     }
  //                   }
  //
  //   transformers -- { 
  //                      <name> :  {
  //                        input : <string or array> ... see https://lodash.com/docs#pick
  //                        f     : <function that takes obj keyed by input>
  //                      }
  //                   }
  //
  insertData (data, transformers) {

    console.log(data)

    let naicsCodes = Object.keys(data)

    let node = findParentNodeForNaicsCode.call(this, naicsCodes[0])

    node.children = naicsCodes.reduce((acc, naicsCode) => {
      acc[naicsCode] = newNaicsTreeNode()

      insertDataIntoTreeNode.call(this, acc[naicsCode], data[naicsCode], transformers)
      return acc
    }, {})
  }

  queryMeasureDataForSubindustries (naics, measure) {
    let node = findParentNodeForNaicsCode.call(this, naics) 
    
    if (!(node && node.children)) { return null }

    return _(node.children).mapValues((childNode) => _.get(childNode, ['dataArraysByMeasure', measure], null)).value()
  }

  queryMeasureDataForSubindustriesForQuarter (naics, measure, year, quarter) {
    let node = findParentNodeForNaicsCode.call(this, naics) 
    
    if (!(node && node.children)) { return null }

    let dataPath = `byQuarterLookupTree.${year}.${quarter}.${measure}`

    return _(node.children).mapValues((childNode) => _.get(childNode, dataPath, null)).value()
  }

}


function findParentNodeForNaicsCode (naicsCode) {
  let node = this.root

  let descendInto
  while (descendInto = _.find(node.children, (node, naicsOfSub) => _.startsWith(naicsCode, naicsOfSub))) {
    console.log(descendInto)
    node = descendInto
  }

  return node
}


  // params:
  //   data -- must have the following structure: { <year>: { <quarter>: { <measure>: <value> } } }
  //   transformers: see insertData
function insertDataIntoTreeNode (node, data, transformers) {

  let quarterIterator = newQuarterIterator(this.startEconQuarter, this.endEconQuarter)

  node.dataArraysByMeasure = _.mapValues(transformers, () => [])
  node.byQuarterLookupTree = {}

  let lastKnownValues = _.mapValues(transformers, () => null)

  let curQtr

  while (curQtr = quarterIterator.next()) {

    let dataForQuarter = _.get(data, [curQtr.year, curQtr.quarter], {})

    _.forEach(transformers, (rules, name) => {

      let dataElement = {
        year    : curQtr.year,
        quarter : curQtr.quarter,

        filledValue : false
      } 

      let val = +((rules && rules.f) ? 
                      rules.f(_(dataForQuarter).pick(rules.input || name).map(_.toFinite).value()) : 
                      (dataForQuarter[(rules && rules.input) || name]))

      if (Number.isFinite(lastKnownValues[name]) && !Number.isFinite(val)) {
        val = lastKnownValues[name]
        dataElement.filledValue = true
      } 

      if (Number.isFinite(val)) {
        dataElement.value = lastKnownValues[name] = val

        _.setWith(node.byQuarterLookupTree, [curQtr.year, curQtr.quarter, name], dataElement, Object)

        node.dataArraysByMeasure[name].push(dataElement)
      }
    })
  }
}




function newNaicsTreeNode () {
  return {
    children: null,
    dataArraysByMeasure: null,
    byQuarterLookupTree: null,
  } 
}


function newQuarterIterator (startQtr, endQtr) {

  let curQtr = _.mapValues(startQtr, _.toInteger)

  return {
    next : () => {

      if (!curQtr) { return null }

      let toReturn = _.clone(curQtr)

      if ((curQtr.year < endQtr.year) || ((curQtr.year === endQtr.year) && (curQtr.quarter < endQtr.quarter))) {

        if (curQtr.quarter < 4) {
          curQtr.quarter += 1
        } else {
          curQtr.quarter = 1
          curQtr.year += 1
        }
      } else {
        curQtr = null
      }

      return toReturn
    }
  }
}

export default NaicsTree
