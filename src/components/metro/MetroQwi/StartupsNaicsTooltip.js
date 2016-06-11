"use strict"

import React from 'react'
import _ from 'lodash'

import { industryTitles } from '../../../support/qwi'

import { kmgtFormatter, kmgtDollarFormatter } from '../../misc/numberFormatters'

const numFormatter = kmgtFormatter.bind(null, 3)
const dollarFormatter = kmgtDollarFormatter.bind(null, 2)



const innerStyle = {
  paddingBottom: 1,
  paddingTop   : 1,
}

const getRows = (data, isCurrency) => 
  data.map(d => (
         <tr key={d.key}>
           <td style={Object.assign({}, innerStyle, {backgroundColor: d.color})}>
             <span title={industryTitles[d.key]}>
               <div style={{color:'#eee'}}>
                 {industryTitles[d.key].substr(0,6)}
               </div>
             </span>
           </td>

           <td style={innerStyle}>
             { `${(isCurrency) ? dollarFormatter(d.value) : numFormatter(d.value)}${(d.filledNull) ? '*' : ''}` }
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
              { getRows(props.data, props.measureIsCurrency) }
            </tbody>

            <tfoot>
              { _.some(props.data, (d) => d.filledNull) ? '* filled in' : ''}
            </tfoot>

          </table>

        </div>
      ) : (<span/>)



export default StartupsNaicsTooltip
