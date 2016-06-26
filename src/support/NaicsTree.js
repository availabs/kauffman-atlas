'use strict'

import _ from 'lodash'

import industryTitles from './industryTitles'
 

const twoDigitNaicsCodes = Object.keys(industryTitles)



export class NaicsTree {

  // params:
  //   startQuarter     -- { year, quarter }
  //   endQuarter       -- { year, quarter }
  //   additionalLevels -- [ { name, domain } ]
  //
  constructor (startQuarter, endQuarter, additionalLevels) {

    this.root = {} 

    this.root.children = twoDigitNaicsCodes.reduce((acc, naicsCode) => {
      acc[naicsCode] = newNaicsTreeNode()

      let splitNaics = naicsCode.split('-')
      let subNaicsCodes = _.range(+splitNaics[0], +_.last(splitNaics) + 1)
      let subCodesPattern = subNaicsCodes.map((subNaics) => `^${subNaics}\\d{1,4}$`).join('|')

      acc[naicsCode].descendentsMatcher = new RegExp(subCodesPattern)
      return acc
    }, {})

    this.startQuarter     = startQuarter
    this.endQuarter       = endQuarter
    this.additionalLevels = additionalLevels
  }


  // !!! Expects all data to be inserted to be sibling NAICS codes !!!
  // 
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
  //insertData (data, transformers) {
    //let naicsCodes = Object.keys(data)

    //let node = getParentNodeForNaicsCode.call(this, naicsCodes[0])

    //node.children = _.defaults(node.children, _.mapValues(data, newNaicsTreeNode))
    
    //naicsCodes.forEach((naicsCode) => 
        //insertDataIntoTreeNode.call(this, node.children[naicsCode], data[naicsCode], transformers))
  //}

  insertData (data, transformers) {

    Object.keys(data).forEach((naicsCode) => {
        let parentNode = getParentNodeForNaicsCode.call(this, naicsCode)

        let node = (parentNode.children[naicsCode] || (parentNode.children[naicsCode] = newNaicsTreeNode()))

        insertDataIntoTreeNode.call(this, node, data[naicsCode], transformers)
    })
  }

  queryMeasureDataForSubindustries (queryObj) {
    let naics = queryObj.naics
    let measure = queryObj.measure

    let additionalLevels = this.additionalLevels

    validateAdditionalLevelsParams(queryObj, ['naics', 'measure'], additionalLevels)

    let node = findNodeForNaicsCode.call(this, naics) 

    // Because we create nodes to insert remote descendents' data,
    // we need to actually make sure data was inserted for the immediate children.
    if (!(node && _.some(node.children, 'dataArraysByMeasure'))) { return null }

    let additionalLevelsPath = additionalLevels ? `.${additionalLevels.map(l => queryObj[l.name]).join('.')}` : ''

    let dataPath = `dataArraysByMeasure${additionalLevelsPath}.${measure}`

    return _.cloneDeep(_(node.children).mapValues((childNode) => _.get(childNode, dataPath, null)).value())
  }

  queryMeasureDataForSubindustriesForQuarter (queryObj) {
    let naics = queryObj.naics
    let year = queryObj.year
    let quarter = queryObj.quarter
    let measure = queryObj.measure

    let additionalLevels = this.additionalLevels

    validateAdditionalLevelsParams(queryObj, ['naics', 'year', 'quarter', 'measure'], additionalLevels)

    let node = findNodeForNaicsCode.call(this, naics) 
    
    // Because we create nodes to insert remote descendents' data,
    // we need to actually make sure data was inserted for the immediate descendents.
    if (!(node && _.some(node.children, 'byQuarterLookupTree'))) { return null }

    let additionalLevelsPath = additionalLevels ? `.${additionalLevels.map(l => queryObj[l.name]).join('.')}` : ''

    let dataPath = `byQuarterLookupTree.${year}.${quarter}${additionalLevelsPath}.${measure}`

    return _.cloneDeep(_(node.children).mapValues((childNode) => _.get(childNode, dataPath, null)).value())
  }
}


function findNodeForNaicsCode (naicsCode) {

  // The root's code is null.
  if (!naicsCode) { return this.root }

  // If the naicsCode is a '2-digit' NAICS, we get it immediately from the root's children object.
  if (this.root.children[naicsCode]) {
    return this.root.children[naicsCode]
  }

  // For 3-digit or longer codes, we first find the 2-digit ancestor.
  let curNode = _.find(this.root.children, (twoDigitNode) => naicsCode.match(twoDigitNode.descendentsMatcher))

  // Descend until we find the node.
  for (let i = 3; i <= naicsCode.length; ++i) {
    let ancestorCode = naicsCode.slice(0, i)

    curNode = curNode.children[ancestorCode] 

    // Dead end. No such code in the tree.
    if (!curNode) { return null }
  }

  return curNode
}

// Creates nodes, if needed.
function getParentNodeForNaicsCode (naicsCode) {

  if (!naicsCode) { throw new Error('Empty NAICS code error.') }

  if ((naicsCode === '00') && (!this.root.children['00'])) { // QWI case
    this.root.children['00'] = newNaicsTreeNode()
    this.root.children['00'].descendentsMatcher = null
    return this.root
  }

  // Is the naicsCode a '2-digit' NAICS? Then root is the parent.
  if (this.root.children[naicsCode]) {
    return this.root
  }

  // Get the 2-digit NAICS code that is the ancestor of the NAICS code.
  let curNode = _.find(this.root.children, (twoDigitNode) => naicsCode.match(twoDigitNode.descendentsMatcher))
  
  // If there wasn't a match on any of the descendents RegExp matcher, then its an invalid code.
  if (!curNode) { throw new Error(`Invalid NAICS code: ${naicsCode}`)}

  // if the NAICS code is 4 or more digits, we need to descend past the 2-digit NAICS codes.
  for (let i = 3; i < naicsCode.length; ++i) {
    let ancestorCode = naicsCode.slice(0, i)

    // Create Ancestors, if necessary.
    // Root matcher RegExp should enforce invalid NAICS codes, and throw if invalid code passed to insert.
    curNode = (curNode.children[ancestorCode] || (curNode.children[ancestorCode] = newNaicsTreeNode()))
  }

  return curNode
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
    children: {},
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

