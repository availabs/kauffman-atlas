"use strict"

import React from 'react'
import _ from 'lodash'

import { industryTitles } from '../../../support/qwi'



const innerStyle = {
  paddingBottom : 1,
  paddingTop    : 1,
}

const getRows = (data) => 
  data.sort((b,a) => a.value-b.value)
      .map(indData => (
         <tr key={indData.key}>
           <td style={Object.assign({}, innerStyle, {backgroundColor: indData.color})}>
             <span title={industryTitles[indData.key]}>

             <div style={{color:'#eee'}}>
               {industryTitles[indData.key].substr(0,6)}
             </div>

             </span>
           </td>

           <td style={innerStyle}>
             {indData.value.toLocaleString()}
           </td>
         </tr>)
     )

 

export const StartupsNaicsTooltip = (props) => 

  (props.data) ? (
        <div id={'startupTooltip-' + props.uniq}

          style={{overflow:'scroll'}}>

          <table className='table'>

            <thead>
              <tr>
                <td>Naics</td>
                <td>value</td>
              </tr>
            </thead>

            <tbody>
              { getRows(props.data) }
            </tbody>

          </table>

        </div>
      ) : (<span/>)



export default StartupsNaicsTooltip
