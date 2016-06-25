"use strict"

import React from 'react'
import _ from 'lodash'

import classes from 'styles/sitewide/index.scss'


const renderTable = (props) => (
  <table className='table'>

    <thead>
      <tr>
        {
          props.data.__columns.map( (column) => (
            <td key={`qwi-overviewTableHeader-${column}`}>
              <a className={classes['bluelink']}
                 onClick={props.sortFieldChange.bind(this, column)}>
                    {props.data.__columnNames[column]}
              </a>
            </td>))
        }
      </tr>
    </thead>

    <tbody>
      {
        props.data.__naicsRowOrder.map((naicsCode) => (
            <tr key={`qwi-overviewTable-${naicsCode}Row`}>
              { 
                props.data.__columns.map((column) => (
                    <td key={`qwi-overviewTable-${naicsCode}Row-${column}`}>
                      {
                        ((column === 'sectorTitle') && 
                         props.onNaicsLabelClick && 
                         _.get(props.data, [naicsCode, '_hasSubindustries'])) ? 

                            (<span onClick={props.onNaicsLabelClick.bind(null, naicsCode)}
                                   style={{color: 'blue', fontWeight: 500}}>
                                   {_.get(props.data, [naicsCode, column])}
                             </span>) :
                              
                            (<span>{_.get(props.data, [naicsCode, column])}</span>)
                      } 
                    </td>)
                  ) 
              }
            </tr>))
      }
    </tbody>
  
  </table>
)

export const StartupsOverviewTable = (props) => (props.data) ? renderTable(props) : (<div>No OverviewTable Data</div>)

export default StartupsOverviewTable
