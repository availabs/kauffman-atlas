'use strict'

import _ from 'lodash'



export class NaicsTree {

  // params:
  //   startQuarter     -- { year, quarter }
  //   endQuarter       -- { year, quarter }
  //   additionalLevels -- [ { name, domain } ]
  //
  constructor (startQuarter, endQuarter, additionalLevels) {

    this.root = {
      children: null,
    }

    this.startQuarter     = startQuarter
    this.endQuarter       = endQuarter
    this.additionalLevels = additionalLevels
  }


  // params: 
  //   data -- must have the following structure: 
  //                   { 
  //                     <naics code>: { 
  //                       <year>: { 
  //                         <quarter>: { 
  //                            ...potential additional levels...
  //
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
    let naicsCodes = Object.keys(data)

    let node = findParentNodeForNaicsCode.call(this, naicsCodes[0])

    node.children = node.children || _.mapValues(data, newNaicsTreeNode)
    
    naicsCodes.forEach((naicsCode) => insertDataIntoTreeNode.call(this, node.children[naicsCode], data[naicsCode], transformers))
  }

  queryMeasureDataForSubindustries (queryObj) {
    let naics = queryObj.naics
    let measure = queryObj.measure

    let additionalLevels = this.additionalLevels

    validateAdditionalLevelsParams(queryObj, ['naics', 'measure'], additionalLevels)

    let node = findParentNodeForNaicsCode.call(this, naics) 
    
    if (!(node && node.children)) { return null }

    let additionalLevelsPath = additionalLevels ? `.${additionalLevels.map(l => queryObj[l.name]).join('.')}` : ''

    let dataPath = `dataArraysByMeasure${additionalLevelsPath}.${measure}`

    // CONSIDER: May be wise to return deep copies.
    return _.cloneDeep(_(node.children).mapValues((childNode) => _.get(childNode, dataPath, null)).value())
  }

  queryMeasureDataForSubindustriesForQuarter (queryObj) {
    let naics = queryObj.naics
    let year = queryObj.year
    let quarter = queryObj.quarter
    let measure = queryObj.measure

    let additionalLevels = this.additionalLevels

    validateAdditionalLevelsParams(queryObj, ['naics', 'year', 'quarter', 'measure'], additionalLevels)

    let node = findParentNodeForNaicsCode.call(this, naics) 
    
    if (!(node && node.children)) { return null }

    let additionalLevelsPath = additionalLevels ? `.${additionalLevels.map(l => queryObj[l.name]).join('.')}` : ''

    let dataPath = `byQuarterLookupTree.${year}.${quarter}${additionalLevelsPath}.${measure}`

    return _.cloneDeep(_(node.children).mapValues((childNode) => _.get(childNode, dataPath, null)).value())
  }

}


function findParentNodeForNaicsCode (naicsCode) {
  let node = this.root

  // TODO: Handle case where we start from a subnaics without the parent naics already in the tree.
  let descendInto
  while (descendInto = _.find(node.children, (node, naicsOfSub) => (_.startsWith(naicsCode, naicsOfSub) && (naicsCode.length < naicsOfSub.length)))) {
    node = descendInto
  }

  return node
}


  // params:
  //   data -- must have the following structure: { <year>: { <quarter>: { <measure>: <value> } } }
  //   transformers: see insertData
function insertDataIntoTreeNode (node, data, transformers) {

  //need to handle merging insertion into existing node
  node.byQuarterLookupTree = node.byQuarterLookupTree || {}
  node.dataArraysByMeasure = node.dataArraysByMeasure || {}

  let lastKnownValues = {}

  // Initialize the dataArraysByMeasure for the node.
  Object.keys(transformers).forEach(name => {

    if (this.additionalLevels) {

      let xtraLevelsPathIterator = newXtraLevelsPathIterator.call(this)
      let curXtraLevelsPath

      while (curXtraLevelsPath = xtraLevelsPathIterator.next()) {
        curXtraLevelsPath.push(name) 

        _.setWith(node.dataArraysByMeasure, curXtraLevelsPath.join('.'), [], Object)
        _.setWith(lastKnownValues, curXtraLevelsPath.join('.'), null, Object)
      }

    } else { 
      _.setWith(node.dataArraysByMeasure, name, [], Object) 
      _.setWith(lastKnownValues, name, null, Object) 
    }
  })

  let curPath
  let pathIterator = newTreePathIterator.call(this)

  while (curPath = pathIterator.next()) {

    let curData = _.get(data, curPath, {})

    _.forEach(transformers, (rules, name) => {

      let elemPath = _.clone(curPath)
      elemPath.push(name)

      let dataElement = {
        year    : elemPath[0],
        quarter : elemPath[1],
        //'value' assigned below
        filledValue : false
      } 

      let val = +((rules && rules.f) ? 
                      rules.f(_(curData).pick(rules.input || name).map(_.toFinite).value()) : 
                      (curData[(rules && rules.input) || name]))

      let lkv = lastKnownValues[elemPath.slice(2)]

      if (Number.isFinite(lkv) && !Number.isFinite(val)) {
        val = lkv
        dataElement.filledValue = true
      } 

      if (Number.isFinite(val)) {
        dataElement.value = lastKnownValues[elemPath.slice(2)] = val

        _.setWith(node.byQuarterLookupTree, elemPath, dataElement, Object)

        _.get(node.dataArraysByMeasure, elemPath.slice(2)).push(dataElement)

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


// Generates the paths in the depth-first traveral of the TreeNodes' lookup trees.
function newTreePathIterator () {


  let startQtr = this.startQuarter
  let endQtr   = this.endQuarter


  let xtraLevelsPathIterator = (this.additionalLevels) ? newXtraLevelsPathIterator.call(this) : null

  let nextPath = (this.additionalLevels) ? 
        [+startQtr.year, +startQtr.quarter].concat(xtraLevelsPathIterator.next()) : [+startQtr.year, +startQtr.quarter]

  return {
    next : () => {

      if (!nextPath) { return null }

      let curPath = _.clone(nextPath)

      let curXtraLevelsPath = xtraLevelsPathIterator && xtraLevelsPathIterator.next()

      if (!curXtraLevelsPath) {

        if ((nextPath[0] < endQtr.year) || ((nextPath[0] === endQtr.year) && (nextPath[1] < endQtr.quarter))) {
        
          if (nextPath[1] < 4) {
            nextPath[1] += 1
          } else {
            nextPath[0] += 1
            nextPath[1] = 1
          }

          if (xtraLevelsPathIterator) {
            xtraLevelsPathIterator.reset()
            curXtraLevelsPath = xtraLevelsPathIterator.next()
          }

          nextPath = (curXtraLevelsPath) ? nextPath.slice(0, 2).concat(curXtraLevelsPath) : nextPath.slice(0)

        } else {
          nextPath = null
        }
      } else {
        nextPath = nextPath.slice(0, 2).concat(curXtraLevelsPath)
      }

      return curPath
    }
  }
}


function newXtraLevelsPathIterator () {
  if (!this.additionalLevels) { return null }

  let xtraLevels = this.additionalLevels
  let xtraLevelsNames = xtraLevels.map(l => l.name)

  let startPath = xtraLevels.map(l => l.domain[0])
  let nextPath  = _.clone(startPath)

  return {
    next : () => {

      if (!nextPath) { return null }

      let curPath = _.clone(nextPath)

      let i
      for (i = (xtraLevelsNames.length - 1); i >= 0; --i) {
        let domain = xtraLevels[i].domain

        let j = domain.indexOf(nextPath[i])
        if ((j !== -1) && (j < (domain.length - 1))) {
          nextPath[i] = domain[j + 1]
          nextPath = nextPath.slice(0, i+1).concat(startPath.slice(i+1))
          break
        } 
      }  

      if (i < 0) {
        nextPath = null
      }

      return curPath
    },

    reset: () => {
      nextPath = _.clone(startPath)
    }
  }

}

function validateAdditionalLevelsParams (queryObj, standardParams, additionalLevels) {
  additionalLevels = additionalLevels || []

  let additionalLevelsParamNames = _.difference(Object.keys(queryObj), standardParams).sort()
  let additionalLevelsNames  = (additionalLevels) ? additionalLevels.map(l => l.name).sort() : []

  let unsupported = _.difference(additionalLevelsParamNames, additionalLevelsNames)
  if (unsupported.length) {
    throw new Error(`The following parameters are not supported for this ` +
                    `NaicsTree's queryMeasureDataForSubindustries:\n${JSON.stringify(unsupported)}`) 
  }

  let missing = _.difference(additionalLevelsNames, additionalLevelsParamNames)
  if (missing.length) {
    throw new Error(`The following required parameters are missing from this ` +
                    `NaicsTree's queryMeasureDataForSubindustries:\n${JSON.stringify(unsupported)}`) 
  }
}


export default NaicsTree

