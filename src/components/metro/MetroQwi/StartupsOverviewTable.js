"use strict"

import React from 'react'
import _ from 'lodash'

import classes from 'styles/sitewide/index.scss'


export const StartupsOverviewTable = (props) => (
  <table className='table'>

    <thead>
      <tr>
        {
          props.data.__columnNames.map( (columnName) => (
            <td key={`qwi-overviewTableHeader-${columnName}`}>
              <a className={classes['bluelink']}
                 onClick={props.sortFieldChange.bind(this, columnName)}>
                    {columnName}
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
                props.data.__columnNames.map((columnName) => (
                    <td key={`qwi-overviewTable-${naicsCode}Row-${columnName}`}>
                      {_.get(props.data, [naicsCode, columnName])}
                    </td>)
                  ) 
              }
            </tr>))
      }
    </tbody>
  
  </table>
)


export default StartupsOverviewTable
