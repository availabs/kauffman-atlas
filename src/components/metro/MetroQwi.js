"use strict"

import React from 'react'
import { connect } from 'react-redux'
import {StickyContainer, Sticky} from 'react-sticky'
import Loading from 'react-loading'
import _ from 'lodash'

import * as metroQwiActions from '../../redux/modules/metroQwiData/actions'


import LineGraph from '../../components/graphs/SimpleLineGraph'
import TooltipTable from '../tables/TooltipTable'
import RadarChart from '../../components/vis/RadarChart/RadarChart'
import OverviewTable from '../tables/OverviewTable'

import { firmageLabels, measureLabels } from '../../support/qwi'
import { kmgtFormatter, kmgtDollarFormatter } from '../misc/numberFormatters'

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
  color       : d3.scale.ordinal().range(['#c58a30','#7D8FAF']),
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
      <Sticky style={stickyToolbarStyle} 
              stickyStyle={stickyToolbarStyle}>

        <div className='row'>
          <div className='col-xs-12 text-center' style={{backgroundColor: '#5d5d5d'}}>
            <b>{`${measureLabels[props.measure]} (${props.measure})`}</b>
          </div>
        </div>

        <div className='row'>
          <div className='col-xs-8 button-group text-left' 
               role="group"
               onWheel={(e) => { props.firmageWheelChange((e.deltaY) < 0 ? 1 : -1)
                                 e.preventDefault()}}>

                  {
                    Object.keys(firmageLabels).sort().map((firmageCode) => (
                        <button id={`qwi-firmage-${firmageCode}-button`}
                                type="button" 
                                className="btn btn-secondary btn-sm" 
                                style={(props.selectedFirmage === firmageCode) ? 
                                          _.merge({}, buttonStyle, selectedFirmageButtonStyle) : buttonStyle}
                                onClick={props.firmageSelected.bind(null, firmageCode)}>

                            <strong>{firmageLabels[firmageCode]}</strong>
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
                             props.selectedQuarterWheelChange((e.deltaY) < 0 ? 1 : -1)
                             e.preventDefault()}}>

                {`Quarter:  Q${props.selectedQuarter.quarter}-${props.selectedQuarter.year}`}
            </strong>
            <button id='qwi-quarter-decrement' 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    style={buttonStyle}
                    onClick={(e) => { 
                             props.selectedQuarterWheelChange(-1)
                             e.preventDefault()}}> -
            </button>
            <button id='qwi-quarter-increment' 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    style={buttonStyle}
                    onClick={(e) => { 
                             props.selectedQuarterWheelChange(1)
                             e.preventDefault()}}> +
            </button>
          </div>
        </div>
      </Sticky>



      <StickyContainer>    
        <div className='row' style={{overflow:'hidden'}} >

          <div className='col-xs-8'>
            <div onMouseEnter={props.lineGraphFocusChange.bind(null, 'rawData-lineGraph')}>

              <LineGraph data={props.lineGraphRawData}
                         key='rawData-lineGraph'
                         uniq='rawData-lineGraph'
                         yFormat={(props.measureIsCurrency) ? dollarFormatter : integerFormatter}
                         xScaleType={'time'}
                         yAxis={true}
                         alwaysRedrawYAxis={true}
                         margin={graphMargin}
                         tooltip={true}
                         title={props.lineGraphRawTitle}
                         quarterChangeListener={props.selectedQuarterChange} />
            </div>

            {
              (!props.lineGraphLQData || (firmageLabels[props.selectedFirmage] === 'All Firm Ages')) ? <div/> : (
                <div onMouseEnter={props.lineGraphFocusChange.bind(null, 'lqData-lineGraph')}>

                  <LineGraph data={props.lineGraphLQData}
                             key='lqData-lineGraph'
                             uniq='lqData-lineGraph'
                             xScaleType={'time'}
                             xAxis={true}
                             xFormat={d => d ? d3.time.format('%Y')(new Date(d)) : ''}
                             yAxis={true}
                             yFormat={floatFormatter}
                             alwaysRedrawYAxis={true}
                             margin={graphMargin}
                             tooltip={true}
                             title={props.lineGraphLQTitle}
                             quarterChangeListener={props.selectedQuarterChange} />
                </div>)
            }
          </div>

          <div className='col-xs-4'>
            <Sticky>
              <TooltipTable data={props.tooltipData}
                            measureIsCurrency={
                              (props.focusedLineGraph === 'rawData-lineGraph') && props.measureIsCurrency
                            }
                            onMouseEnter={props.mouseEnteredTooltipCell}
                            onMouseLeave={props.mouseLeftTooltipCell}
                            hoveredRowKey={props.tooltipHoveredNaicsLabel}
                            uniq={props.field} />
            </Sticky>
          </div>
        </div>
      </StickyContainer>

      <div className='row' style={{overflow:'hidden', zIndex: 10}} >
        <div className='col-xs-5'>
          <strong>
            {`Share of ${props.measure} by industry for ${firmageLabels[props.selectedFirmage]} firms`}
          </strong>
          {
            (!props.shareOfMetroTotalRadarGraphData) ? (<div/>) : 
              (<RadarChart divID='typeShare'
                        data={props.shareByIndustryRadarGraphData}
                        options={radarGraphOptions} />)
          }
        </div>

        <div className='col-xs-5'>
          <strong>
            {`Share of by ${props.measure} by industry across firmages.`}
          </strong>
          {
            (!props.shareByIndustryRadarGraphData) ? (<div/>) : 
              (<RadarChart divID='typeQout'
                           data={props.shareOfMetroTotalRadarGraphData}
                           options={radarGraphOptions} />)
          }
        </div>
      </div>

      <div className='row'>
        <OverviewTable data={props.overviewTableData}
                       sortFieldChange={props.overviewTableSortFieldChange} />
      </div>
    </StickyContainer>
  </div>
)



class MetroQwi extends React.Component<void, Props, void> {
  
  componentDidMount () {
    let props = this.props
    
    props.msaAndMeasureChange(props.msa, props.measure)
    props.loadData(props.msa, props.measure)
  }

  componentWillReceiveProps (nextProps){
    let props = this.props

    props.msaAndMeasureChange(nextProps.msa, nextProps.measure)
    props.loadData(nextProps.msa, nextProps.measure)
  }

  render () {
    let loading = (
      <div style={{position:"relative",top:"50%",left:"50%"}}>
        <Loading type="balls" color="rgb(125, 143, 175)"  />
      </div>
    )
    return (this.props.lineGraphRawData) ? 
              renderVisualizations(this.props) : (<div className='container'>{loading}</div>)
  }
}


const mapStateToProps = (state) => ({
  lineGraphRawTitle               : state.metroQwiData.lineGraphs.rawGraphTitle,
  lineGraphRawData                : state.metroQwiData.lineGraphs.rawGraphData,
  lineGraphLQTitle                : state.metroQwiData.lineGraphs.lqGraphTitle,
  lineGraphLQData                 : state.metroQwiData.lineGraphs.lqGraphData,
  tooltipData                     : state.metroQwiData.tooltipTable.data,
  shareByIndustryRadarGraphData   : [state.metroQwiData.selectedFirmageRadarChartData],
  shareOfMetroTotalRadarGraphData : [state.metroQwiData.acrossFirmagesRadarChartData],
  overviewTableData               : state.metroQwiData.overviewTable.data,
  selectedQuarter                 : state.metroQwiData.selectedQuarter,
  measureIsCurrency               : state.metroQwiData.measureIsCurrency,
  focusedLineGraph                : state.metroQwiData.lineGraphs.focused,
  selectedFirmage                 : state.metroQwiData.selectedFirmage,
  tooltipHoveredNaicsLabel        : state.metroQwiData.tooltipTable.hoveredNaicsLabel,
})

const mapActionCreators = _.pickBy(metroQwiActions, _.isFunction)

export default connect(mapStateToProps, mapActionCreators)(MetroQwi)
