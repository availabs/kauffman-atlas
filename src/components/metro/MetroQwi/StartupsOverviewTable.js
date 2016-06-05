"use strict"

import React from 'react'

import classes from 'styles/sitewide/index.scss'


export const StartupsOverviewTable =  (props) => (
  <table className='table'>

    <thead>
      <tr>
        <td>{props.title}</td>
        <td>
          <a className={classes['bluelink']}
             onClick={props.sortFieldChange.bind(this, 'measure')}>

                {props.title}
          </a>
        </td>

        <td>
          <a className={classes['bluelink']}
             onClick={props.sortFieldChange.bind(this, 'measure_ratio')}>
            
                {props.title} Share
          </a>
        </td>

        <td>
          <a className={classes['bluelink']}
             onClick={props.sortFieldChange.bind(this, 'measure_quot')}>
                {props.title} Quotient
          </a>
        </td>
      </tr>
    </thead>

    <tbody>
      {buildTableRows(props)}
    </tbody>
  </table>
)


export default StartupsOverviewTable




function buildTableRows (props) {
  
  let msa = props.msa

  if(!props.qcewData || !props.qcewData[msa] ||
     !props.qcewData[msa][year])
      return null

  let metro = props.msa
  let page = props.title

  let naicsCodes = _processData(msa, year, depth, filter)
  let naicsLib = props.naicsKeys


  return Object.keys(naicsCodes).map(d => {
    naicsCodes[d].type_quot = naicsCodes[d].typeQuot
    return d
  })
  .sort((a,b) => {
    return naicsCodes[b][state.sort] - naicsCodes[a][state.sort]
  })
  .map((d) => (
        <tr key={d}>
            <td>
                <Link to ={'/metro/'+metro+'/'+page+'/'+d}
                      className={classes['bluelink']}
                      onClick={_setFilter
                                   .bind(this, d,
                                         state.depth+1)}
                      alt={naicsLib[d].description}>
                    {d} | {naicsLib[d].title}
                </Link>
            </td>
            <td>{naicsCodes[d].type.toLocaleString()}</td>
            <td>{+(naicsCodes[d].typeShare*100).toLocaleString()}%</td>
            <td>{+(naicsCodes[d].type_quot).toLocaleString()}</td>
        </tr>
    )
  )
}
