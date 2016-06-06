"use strict"

import React from 'react'
import _ from 'lodash'

import classes from 'styles/sitewide/index.scss'


export const StartupsOverviewTable =  (props) => (
  <table className='table'>

    <thead>
      <tr>
        {
          _.map(_.sample(props.data), (val, measureName) => (
            <td>
              <a className={classes['bluelink']}
                 onClick={props.sortFieldChange.bind(this, measureName)}>
                    {measureName}
              </a>
            </td>)
          )
        }
      </tr>
    </thead>

    <tbody>
      {
        _.map(props.data, (d) => {
            if (d.naics === undefined) { console.log('#######\n', d)}
            return (
            <tr key={`qwi-overviewTable-${d.naics}-row`}>
              { _.map(d, (val) => (<td>{(val === null) ? null : val.toLocaleString()}</td>)) }
            </tr>)
          })
      }
    </tbody>
  
  </table>
)



export default StartupsOverviewTable
