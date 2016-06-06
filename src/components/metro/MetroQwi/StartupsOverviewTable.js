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
        _.map(props.data, (d) => (
            <tr key={`qwi-overviewTable-${d.title}-row`}>
              { _.map(d, (val) => (<td>{val.toLocaleString()}</td>)) }
            </tr>
          ))
      }
    </tbody>
  
  </table>
)



export default StartupsOverviewTable
