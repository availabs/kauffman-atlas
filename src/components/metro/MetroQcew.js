"use strict"

import React from 'react'
import { connect } from 'react-redux'
import {StickyContainer, Sticky} from 'react-sticky'
import Loading from 'react-loading'
import _ from 'lodash'

import * as metroQcewActions from '../../redux/modules/metroQcewData/actions'

import LineGraph from '../../components/graphs/SimpleLineGraph'
import TooltipTable from '../tables/TooltipTable'
import RadarChart from '../../components/vis/RadarChart/RadarChart'
import OverviewTable from '../tables/OverviewTable'
import naicsLib from 'static/data/naicsKeys'

import { measureLabels } from '../../support/qcew'
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
          <div className='col-xs-4 button-group text-left' role="group">
            <button id='qcew-quarter-decrement' 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    style={buttonStyle}
                    onClick={props.naicsRootReturn}> {'\u290A'}
            </button>
            <button id='qcew-quarter-increment' 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    onClick={props.ascendOneNaicsLevel}> {'\u21D1'}
            </button>
            <span><b>{`${props.selectedParentNaicsTitle}`}</b></span>
          </div>

          <div className='col-xs-8 button-group text-right' role="group">
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
            <button id='qcew-quarter-decrement' 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    style={buttonStyle}
                    onClick={(e) => { 
                             props.selectedQuarterWheelChange(-1)
                             e.preventDefault()}}> -
            </button>
            <button id='qcew-quarter-increment' 
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
          <div className='row' style={{overflow:'hidden', position: 'relative'}} >

            <div className='col-xs-8'>
              <div onMouseEnter={props.lineGraphFocusChange.bind(null, 'rawData-lineGraph')}
                   style={{margin:0, padding:0}}>

                <LineGraph data={props.lineGraphRawData}
                           key='rawData-lineGraph'
                           uniq='rawData-lineGraph'
                           yFormat={(props.measureIsCurrency) ? dollarFormatter : integerFormatter}
                           xScaleType={'time'}
                           yAxis={true}
                           margin={graphMargin}
                           tooltip={true}
                           title={props.lineGraphRawTitle}
                           quarterChangeListener={props.selectedQuarterChange} />
              </div>

              <div onMouseEnter={props.lineGraphFocusChange.bind(null, 'lqData-lineGraph')}
                   style={{margin:0, padding:0}}>

                <LineGraph data={props.lineGraphLQData}
                           key='lqData-lineGraph'
                           uniq='lqData-lineGraph'
                           xScaleType={'time'}
                           xAxis={true}
                           xFormat={d => d ? d3.time.format('%Y')(new Date(d)) : ''}
                           yAxis={true}
                           yFormat={floatFormatter}
                           margin={graphMargin}
                           tooltip={true}
                           title={props.lineGraphLQTitle}
                           quarterChangeListener={props.selectedQuarterChange} />
              </div>
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
        </StickyContainer >
      <div className= 'row'>
        <div key='leftpad' style={{textAlign: 'left', padding: 15}}>
            <h4>{props.selectedParentNaicsTitle}</h4>
            {naicsLib[Object.keys(props.overviewTableData)[0].slice(0, -1)] && naicsLib[Object.keys(props.overviewTableData)[0].slice(0, -1)].description ? naicsLib[Object.keys(props.overviewTableData)[0]].description.filter((d,i) => { return i < 4 && d !== "The Sector as a Whole"}).map((d,i) => { return <p key={'desc'+i}>{d}</p> }) : ''}
        </div>
      </div>
      <div className='row' style={{overflow:'hidden', zIndex: 10}} >
           
        <div className='col-xs-5'>
          <strong>
            {`Share of ${props.lineGraphRawTitle} by Industry`}
          </strong>
          {
            (!props.shareRadarChartData) ? (<div/>) : 
              (<RadarChart divID='typeShare'
                        data={props.shareRadarChartData}
                        options={radarGraphOptions} />)
          }
        </div>

        <div className='col-xs-5'>
          <strong>
            {`${props.lineGraphRawTitle} Location Quotient by Industry`}
          </strong>
          {
            (!props.lqRadarChartData) ? (<div/>) : 
              (<RadarChart divID='typeQout'
                           data={props.lqRadarChartData}
                           options={radarGraphOptions} />)
          }
        </div>
      </div>

      <div className='row'>
        <OverviewTable 
         data={props.overviewTableData}
         sortFieldChange={props.overviewTableSortFieldChange}
         onNaicsLabelClick={props.drilldownIntoNaicsSubindustry}/>
      </div>
    </StickyContainer>
  </div>
)



class MetroQcew extends React.Component<void, Props, void> {
  
  componentDidMount () {
    let props = this.props
    
    props.msaAndMeasureChange(props.currentMetro, props.measure)
    props.loadData(props.currentMetro)
  }

  componentWillReceiveProps (nextProps){
    let props = this.props

    props.msaAndMeasureChange(nextProps.currentMetro, nextProps.measure)
    props.loadData(nextProps.currentMetro)
  }

  render () {
    let loading = (
      <div style={{position:"relative",top:"50%",left:"50%", marginTop: 50}}>
        <Loading type="balls" color="rgb(125, 143, 175)"  /><br />
        Loading...
      </div>
    )
    return (this.props.lineGraphRawData) ? 
              renderVisualizations(this.props) : (<div className='container'>{loading}</div>)
  }
}


const mapStateToProps = (state) => ({
  lineGraphRawTitle        : state.metroQcewData.lineGraphs.rawGraphTitle,
  lineGraphRawData         : state.metroQcewData.lineGraphs.rawGraphData,

  lineGraphLQTitle         : state.metroQcewData.lineGraphs.lqGraphTitle,
  lineGraphLQData          : state.metroQcewData.lineGraphs.lqGraphData,

  tooltipData              : state.metroQcewData.tooltipTable.data,

  shareRadarChartData      : [state.metroQcewData.shareRadarChartData],
  lqRadarChartData         : [state.metroQcewData.lqRadarChartData],

  overviewTableData        : state.metroQcewData.overviewTable.data,

  selectedQuarter          : state.metroQcewData.selectedQuarter,
  measureIsCurrency        : state.metroQcewData.measureIsCurrency,
  focusedLineGraph         : state.metroQcewData.lineGraphs.focused,
  selectedParentNaics      : state.metroQcewData.selectedParentNaics,
  selectedParentNaicsTitle : state.metroQcewData.selectedParentNaicsTitle,
  tooltipHoveredNaicsLabel : state.metroQcewData.tooltipTable.hoveredNaicsLabel,
})

const mapActionCreators =  _.pickBy(metroQcewActions, _.isFunction)

export default connect(mapStateToProps, mapActionCreators)(MetroQcew)
