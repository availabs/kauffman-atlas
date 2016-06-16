"use strict"

import React from 'react'
import { Link } from 'react-router'
import Select from 'react-select'
import {StickyContainer, Sticky} from 'react-sticky'


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
    color       : d3.scale.ordinal().range(['#c58a30','#7D8FAF'])
}

const stickyToolbarStyle = {
  color: '#f7f7f7', 
  backgroundColor: '#7D8FAF', 
  paddingTop: 2,
  paddingRight: 17,
  paddingBottom: 2,
  paddingLeft: 17,
  borderStyle: 'solid',
  borderTopWidth: 0,
  borderBottomWidth: 2,
  borderColor: '#f7f7f7',
  zIndex:100,
}

const buttonStyle = {
  color: '#f7f7f7', 
  backgroundColor: '#7D8FAF', 
  //boxShadow: '0 1px 1px 0 rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.19)',
  boxShadow: '0 1px 2px 0 rgba(247,247,247,0.2), 0 1px 2px 0 rgba(247,247,247,0.19)',
  border: '0px solid transparent',
  marginLeft: '1px',
  marginRight: '1px',
}

const selectedFirmageButtonStyle = {
  color: '#7D8FAF', 
  backgroundColor: '#f7f7f7', 
  boxShadow: '0 2px 3px 0 rgba(247,247,247,0.4), 0 2px 3px 0 rgba(247,247,247,0.4)',
}

const renderVisualizations = (props) => (
  <div className='container'>
    <StickyContainer>    
      <Sticky className="foo" 
              style={stickyToolbarStyle} 
              stickyStyle={stickyToolbarStyle}>

        <div className='row'>
          <div className='col-xs-12 text-center' style={{backgroundColor: '#5d5d5d'}}>
            <b>{`${props.measureLabel.replace(/:.*/, '')} (${props.measure})`}</b>
          </div>
        </div>

        <div className='row'>
          <div className='col-xs-8 button-group text-left' 
               role="group"
               onWheel={(e) => { props.firmageWheelChange((e.deltaY) < 0 ? 1 : -1)
                                 e.preventDefault()}}>

                  {
                    _.map(props.firmageLabels, (firmageLabel, firmageCode) => (
                        <button id={`qwi-firmage-${firmageCode}-button`}
                                type="button" 
                                className="btn btn-secondary btn-sm" 
                                style={(props.selectedFirmage === firmageCode) ? 
                                          _.merge({}, buttonStyle, selectedFirmageButtonStyle) : buttonStyle}
                                onClick={props.firmageSelected.bind(null, firmageCode)}>

                            <strong>{firmageLabel}</strong>
                        </button>
                      ))
                  }                 
          </div>
          <div className='col-xs-4 button-group text-right' role="group">
            <strong style={_.merge({ paddingTop: '1px', 
                                     paddingBottom: '1px', 
                                     paddingLeft: '2px', 
                                     paddingRight: '4px', 
                                     marginTop: '5px'}, 
                                   buttonStyle)}
                    onWheel={(e) => { 
                             props.yearQuarterWheelChange((e.deltaY) < 0 ? 1 : -1)
                             e.preventDefault()}}>

                {`Quarter:  Q${props.yearQuarter.quarter}-${props.yearQuarter.year}`}
            </strong>
            <button id='qwi-quarter-decrement' 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    style={buttonStyle}
                    onClick={(e) => { 
                             props.yearQuarterWheelChange(-1)
                             e.preventDefault()}}> -
            </button>
            <button id='qwi-quarter-increment' 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    style={buttonStyle}
                    onClick={(e) => { 
                             props.yearQuarterWheelChange(1)
                             e.preventDefault()}}> +
            </button>
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

          {
            (props.firmageLabel === 'All Firm Ages') ? <div/> : (
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
              </div>)
          }
        </div>

        <div className='col-xs-4'>
            <StartupsNaicsTooltip data={props.tooltipData}
                                  measureIsCurrency={
                                    (props.focusedLineGraph === 'qwi-rawData-linegraph') && props.measureIsCurrency
                                  }
                                  onMouseEnter={props.mouseEnteredTooltipCell}
                                  onMouseLeave={props.mouseLeftTooltipCell}
                                  hoveredRowKey={props.tooltipHoveredNaicsLabel}
                                  uniq={props.field} />
        </div>
      </div>

      <div className='row' style={{overflow:'hidden', zIndex: 10}} >
        <div className='col-xs-5'>
          <strong>
            {`Share of ${props.measure} by industry for ${props.firmageLabel} firms`}
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
