"use strict"

import React from 'react'
import { Link } from 'react-router'
import Select from 'react-select'
import {StickyContainer,Sticky} from 'react-sticky'


import LineGraph from '../../../components/graphs/SimpleLineGraph'
import StartupsNaicsTooltip from './StartupsNaicsTooltip'
import RadarChart from '../../../components/vis/RadarChart/RadarChart'
import StartupsOverviewTable from './StartupsOverviewTable'

import { kmgtFormatter, kmgtDollarFormatter } from '../../misc/numberFormatters'

const integerFormatter = kmgtFormatter.bind(null, 0)
const floatFormatter = kmgtFormatter.bind(null, 1)
const dollarFormatter = kmgtDollarFormatter.bind(null, 0)



const graphMargin = {
  top    : 10,
  left   : 60,
  right  : 20,
  bottom : 20,
}



const radarGraphOptions = {
    w           : 190,
    h           : 190,
    ExtraWidthX : 130,
    TranslateX  : 50,
    color       : d3.scale.ordinal().range(['#4CAF50','#7D8FAF'])
}



const renderVisualizations = (props) => (
  <div className='container'>
    <StickyContainer>    
      <Sticky className="foo" 
              style={{color:'white', backgroundColor:'#7D8FAF', opacity: 1, zIndex:100}} 
              stickyStyle={{color:'white', backgroundColor:'#7D8FAF', opacity: 1, zIndex:100}}>

        <div className='row'>
          <div className='col-xs-3'>
            <strong onWheel={(e) => { 
                             props.yearQuarterWheelChange((e.deltaY) < 0 ? 1 : -1)
                             e.preventDefault()}}>

                {`Q${props.yearQuarter.quarter}-${props.yearQuarter.year}`}</strong>
          </div>
          <div className='col-xs-3'>
            <strong onWheel={(e) => { 
                             props.radarGraphFirmageChange((e.deltaY) < 0 ? 1 : -1)
                             e.preventDefault()}}>

                {`Firmage: ${props.radarGraphFirmageLabel}`}
            </strong>
          </div>
        </div>
      </Sticky>
      <div className='row' style={{overflow:'hidden'}} >

        <div className='col-xs-8'>
          <div onMouseEnter={props.lineGraphFocusChange.bind(null, 'qwi-rawData-linegraph')}>

            <LineGraph data={props.lineGraphRawData}
                       key='qwi-rawData-linegraph'
                       uniq='qwi-rawData-linegraph'
                       yFormat={(props.measureIsCurrency) ? dollarFormatter : integerFormatter}
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
                       yFormat={floatFormatter}
                       margin={graphMargin}
                       tooltip={true}
                       quarterChangeListener={props.lineGraphYearQuarterChange} />
          </div>
        </div>

        <div className='col-xs-4'>
            <StartupsNaicsTooltip data={props.tooltipData}
                                  measureIsCurrency={
                                    (props.focusedLineGraph === 'qwi-rawData-linegraph') && props.measureIsCurrency
                                  }
                                  uniq={props.field} />
        </div>
      </div>

      <div className='row' style={{overflow:'hidden', 'z-index': 10}} >
        <div className='col-xs-5'>
          <strong>
          
              {`Share of ${props.measure} by industry for ${props.radarGraphFirmageLabel} firms`}
          </strong>
          <RadarChart divID='typeShare'
                      data={props.shareOfMetroTotalRadarGraphData}
                      options={radarGraphOptions} />
        </div>

        <div className='col-xs-5'>
          <strong>
            {`Share of by ${props.measure} by industry across firmages.`}
          </strong>
          <RadarChart divID='typeQout'
                      data={props.shareByIndustryRadarGraphData}
                      options={radarGraphOptions} />
        </div>
      </div>

      <div className='row'>
        <StartupsOverviewTable data={props.overviewTableData}
                               sortFieldChange={props.overviewTableSortFieldChange} />
      </div>
    </StickyContainer>
  </div>
)



class MetroQwi extends React.Component<void, Props, void> {
  
  componentDidMount () {
    let props = this.props

    if (props.loadData && !props.lineGraphRawData) {
      props.msaChange(props.msa);
      props.measureChange(props.measure);

      props.loadData(props.msa, props.measure)
    }
  }

  componentWillReceiveProps (nextProps){
    let props = this.props

    props.msaChange(nextProps.msa)         // No effect if same msa
    props.measureChange(nextProps.measure) // No effect if same measure

    if (!nextProps.lineGraphRawData) {
      props.loadData(nextProps.msa, nextProps.measure)
    }
  }

  render () {
    return (this.props.lineGraphRawData) ? renderVisualizations(this.props) : (<span>Loading...</span>)
  }
}


export default MetroQwi
