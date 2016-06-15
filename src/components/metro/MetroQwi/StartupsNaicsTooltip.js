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
  zIndex       : 1,
}

const labelHover = {
  whiteSpace   : 'nowrap',
  position     : 'absolute',
  zIndex       : '2',
  display      : 'inline-block',
  paddingRight : '5px',
}

const getRows = (data, isCurrency, hoveredRowKey, onMouseEnter, onMouseLeave) => 
  data.map(d => (
         <tr key={d.key}>

           <td style={Object.assign({}, 
                                    innerStyle, 
                                    { backgroundColor: d.color, whiteSpace: 'nowrap', })}
                                    

               onMouseEnter={onMouseEnter.bind(null, d.key)}
               onMouseLeave={onMouseLeave.bind(null, d.key)}>

             <span title={industryTitles[d.key]} 
                   style={(d.key === hoveredRowKey) ? Object.assign({backgroundColor: d.color}, labelHover) : {}}>

                     {(d.key === hoveredRowKey) ? 
                        industryTitles[d.key] : 
                        `${industryTitles[d.key].substring(0,31)}${industryTitles[d.key].length > 31 ? '...' : ''}`}
             </span>
           </td>

           <td style={Object.assign({}, innerStyle)}>
             { `${(isCurrency) ? dollarFormatter(d.value) : numFormatter(d.value)}${(d.filledNull) ? '*' : ''}` }
           </td>
         </tr>)
     )

 

export const StartupsNaicsTooltip = (props) => 

  (props.data) ? (
        <div id={'startupTooltip-' + props.uniq} style={{overflow: 'auto'}}>

          <table className='table'>

            <thead>
              <tr>
                <td>Naics</td>
                <td>value</td>
              </tr>
            </thead>

            <tbody>
              { 
                getRows(props.data, 
                        props.measureIsCurrency, 
                        props.hoveredRowKey, 
                        props.onMouseEnter, 
                        props.onMouseLeave) 
              }
            </tbody>

            <tfoot>
              <td>
                { _.some(props.data, (d) => d.filledNull) ? '* Value filled in with last known value.' : '\u00a0'}
              </td>
            </tfoot>

          </table>

        </div>
      ) : (<span/>)



export default StartupsNaicsTooltip
