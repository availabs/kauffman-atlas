"use strict"

import React from 'react'
import { Link } from 'react-router'
import Select from 'react-select'


import LineGraph from '../../../components/graphs/SimpleLineGraph'
import StartupsNaicsTooltip from './StartupsNaicsTooltip'
import RadarChart from '../../../components/vis/RadarChart/RadarChart'
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

  return (props.lineGraphRawData) ? renderVisualizations(props) : requestData(props)
}


export default MetroQwi


function renderVisualizations (props) {

console.log(props)

    return (
      <div className='container'>
        
        <div className='row' style={{overflow:'hidden'}} >

          <div className='col-xs-8'>
            <div onMouseEnter={props.lineGraphFocusChange.bind(null, 'qwi-rawData-linegraph')}>

                  <LineGraph data={props.lineGraphRawData}
                             key='qwi-rawData-linegraph'
                             uniq='qwi-rawData-linegraph'
                             yFormat={y=>y}
                             xScaleType={'time'}
                             yAxis={true}
                             margin={graphMargin}
                             tooltip={true}
                             quarterChangeListener={props.lineGraphYearQuarterChange} />
            </div>

            <div onMouseEnter={props.lineGraphFocusChange.bind(null, 'qwi-lqData-linegraph')}>

                    <LineGraph data={props.lineGraphLQData}
                               key='qwi-lqData-linegraph'
                               uniq='qwi-lqData-linegraph'
                               xScaleType={'time'}
                               xAxis={true}
                               xFormat={d => d ? d3.time.format('%Y')(new Date(d)) : ''}
                               yAxis={true}
                               yFormat={y=>y}
                               margin={graphMargin}
                               tooltip={true}
                               quarterChangeListener={props.lineGraphYearQuarterChange} />
            </div>
          </div>

          <div className='col-xs-4'>
              <StartupsNaicsTooltip data={props.tooltipData}
                                    uniq={props.field} />
          </div>
        </div>

      </div>
    )
}
        //<div className='row' style={{overflow:'hidden'}} >
          //<RadarChart divID='typeQout'
                      //data={}
                      //options={} />
        //</div>

          //<div className='col-xs-3'>

            //<div className='row'>
              //<Select
                  //clearable={false}
                  //options={props.yearQuarterStringList}
                  //value={props.radarChartCurrentYear}
                  //onChange={props.radarChartCurrentYearChange} />
            //</div>

            //<div className='row'>
            //</div>

          //</div>




        //<StartupsOverviewTable sortFieldChange={props.overviewTableSortFieldChange}/>

function requestData (props) {
    if (props.loadData) { props.loadData(props.msa, props.measure) }

    return (<span>loading</span>)
}

        
