"use strict"

import React from 'react'
import { Link } from 'react-router'


import LineGraph from '../../../components/graphs/SimpleLineGraph'
import StartupsNaicsTooltip from './StartupsNaicsTooltip'
import StartupsRadarChart from './StartupsRadarChart'
import StartupsOverviewTable from './StartupsOverviewTable'

const graphMargin = {
  top    : 0,
  left   : 60,
  right  : 20,
  bottom : 20,
}



const MetroQwi = props => {
  props.msaChange(props.msa);
  props.measureChange(props.measure);

  return (props.lineGraphData) ? renderVisualizations(props) : requestData(props)
}


export default MetroQwi


function renderVisualizations (props) {

    return (
      <div className='container'>
        
        <div className='row' style={{overflow:'hidden'}} >

          <div className='col-xs-8'>
            <LineGraph data={props.lineGraphData}
                       key={props.field}
                       uniq={props.field}
                       yFormat={y=>y}
                       xScaleType={'time'}
                       yAxis={true}
                       margin={graphMargin}
                       tooltip={true}
                       quarterChangeListener={props.quarterChange} />
          </div>

          <div className='col-xs-4'>
              <StartupsNaicsTooltip data={props.tooltipData}
                                    uniq={props.field} />
          </div>
        </div>

        <StartupsRadarChart/>

        <StartupsOverviewTable/>
      </div>
    )
}


function requestData (props) {
    if (props.loadData) { props.loadData(props.msa, props.measure) }

    return (<span>loading</span>)
}

        
