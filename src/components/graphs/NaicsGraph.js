"use strict"

import React from 'react'
import { StickyContainer, Sticky } from 'react-sticky'
import { connect } from 'react-redux'
import { loadMetroData, quarterSelected } from 'redux/modules/metroQcewData.js'
import d3 from 'd3'
import LineGraph from 'components/graphs/SimpleLineGraph/index'
import { loadNaicsKeys } from 'redux/modules/msaLookup'
import { typemap } from 'support/qcew/typemap'

import { kmgtFormatter, kmgtDollarFormatter } from '../misc/numberFormatters'

const integerFormatter = kmgtFormatter.bind(null, 0)
const floatFormatter   = kmgtFormatter.bind(null, 1)

const lineGraphNumberFormatter = kmgtFormatter.bind(null, 0)
const lineGraphDollarFormatter = kmgtDollarFormatter.bind(null, 0)

const tooltipNumberFormatter = kmgtFormatter.bind(null, 3)
const tooltipDollarFormatter = kmgtDollarFormatter.bind(null, 2)


type Props = {};

let focusedLineGraph = 'rawLinegraph'

const lineGraphFocusChanger = (lineGraph) => {
  focusedLineGraph = lineGraph
}


export class NaicsGraph extends React.Component<void, Props, void> {

    constructor () {
      super()
      
      this.state={
        data: null,      
      }

      this._process = this._process.bind(this)
    }

    _init (id) {

      if(!this.props.data || id) {
        this.props.loadMetroData(id)
      }

      if(!this.props.naicsKeys){
        this.props.loadNaicsKeys()
      }
    }
    
    componentWillMount () {
      this._init(this.props.currentMetro)
    }    

    componentWillReceiveProps (nextProps){
      if(this.props.currentMetro !== nextProps.currentMetro) {
        this._init(nextProps.currentMetro)
      }
    }


    renderToolTip (mData, selectedQuarter) {

      if (!selectedQuarter) {
        return (<div/>)
      }

      let year = selectedQuarter.year
      let quarter = selectedQuarter.quarter
      let month = 1 + ((quarter - 1) * 3)
      
      let selectedQuarterDateTime = new Date(year, month).getTime()

      let data = mData.map((d) => ({
        color: d.color,
        key: d.key,
        value: quarterBSearcher(selectedQuarterDateTime, d.values, 0, d.values.length)
      }))

      let naics = this.props.naicsKeys

      let innerStyle = {
        paddingBottom : 1,
        paddingTop    : 1
      }

      let valueFormatter = ((this.props.type === 'totalwages') && (focusedLineGraph === 'rawLinegraph')) ?
                            tooltipDollarFormatter : tooltipNumberFormatter

      let rows = data.sort((b,a) => a.value-b.value)
                     .map( x => {

                       let nameStyle = Object.assign({},innerStyle)

                       nameStyle.backgroundColor = x.color

                       return (
                           <tr key={x.key}>

                             <td style={nameStyle}>
                               <span title={naics[x.key].title}>
                                 <div style={{color:'#eee'}}>
                                   {naics[x.key].title.substr(0,16)}
                                 </div>
                               </span>
                             </td>
                           
                             <td style={innerStyle}>
                               {valueFormatter(x.value)}
                             </td>
                           </tr>
                        )
                     })

      return (
        <div id={'tooltip' + this.props.uniq}
             style={{ overflow : 'scroll' }}>

              <table className='table'>

                <thead>
                  <tr>
                    <td>Naics</td>
                    <td>value</td>
                  </tr>
                </thead>

                <tbody>
                  {rows}
                </tbody>

              </table>
        </div>
      )
    }

    dataMap (data, fields, recfunc) {

      let colors = d3.scale.category20c()

      // Filters out the irrelevant industries.
      let filterfun = (x) => {

        if (this.props.filter && this.props.filter.length) {
          return this.props.filter.indexOf(x.key) >= 0
        } else {
          return x.key.split('-')[0].length === 2
        }

      }

      return data.filter(filterfun)
                 .sort((a,b) => a.key.localeCompare(b.key))
                 .map((industry, i) => {
                   var obj = {}

                   obj.key = industry.key
                   obj.color = colors(i%20)
                   obj.values = industry.values
                                        .map(recfunc.bind(this, fields))
                                        .sort((a,b) => (a.values.x - b.values.x))

                   // Forward-fill the data
                   obj.values.reduce((a, b) => {
                     if (!b.values.y) {
                       b.values.y = a.values.y
                     }
                     return b
                   })

                   return obj
                 })
    }

    aggfunc (finish, fields, rec) {

      let month = 1 + ((rec.qtr - 1) * 3)
      let x = new Date(rec.year, month)

      let y = 0;

      if( !Array.isArray(fields) ) {
        y = parseFloat(rec[fields])
      } else {
        for (let i = 0; i < fields.length; ++i) {
          y += parseFloat(rec[fields[i]])
        } 
      }

      y = finish(y)

      return {
        key: x,
        values: { x, y, }
      }
  }

  _process (data,agg,noagg) {

    let pdata = {}
    let fields = typemap[this.props.type]
    let lqfields = fields.map(x => 'lq_' + x)

    if(this.props.type !== 'employment'){
      pdata.data = this.dataMap(data, fields, noagg)
      pdata.lqdata = this.dataMap(data, lqfields, noagg)
    } else {
      pdata.data = this.dataMap(data, fields, agg)
      pdata.lqdata = this.dataMap(data, lqfields, agg)
    }
        
    return pdata
  }
  


  render () {

    let props = this.props

    if (!props.data || !props.data.length) {
      return <span></span>
    }

    // Indexes the data by the area_fips, 
    // then takes the currentMetro's data.
    let metrodata = d3.nest()
                      .key(x => x.area_fips)
                      .rollup(values => values)
                      .map(props.data)['C'+props.currentMetro.substr(0,4)]

    // Indexes the metro's data by industry code.
    let data = d3.nest()
                 .key(x => x.industry_code)
                 .rollup(values => values)
                 .entries(metrodata || [])

    let empfields = typemap[props.type]
    let noagg = this.aggfunc.bind(this, x => x)
    
    let agg = this.aggfunc.bind(this, x => (x / empfields.length))

    let mData = this._process(data, agg, noagg)
    
    let graphMargin = {
      top    : 10,
      left   : 60,
      right  : 20,
      bottom : 20,
    }
    

    return (
      <StickyContainer>    
        <div className='row' style={{overflow:'hidden'}} >

          <div className='col-xs-8'>

            <div onMouseEnter={lineGraphFocusChanger.bind(null, 'rawLinegraph')}>

              <LineGraph 
                  key={props.field}
                  data={mData.data} 
                  uniq={props.field}
                  title={'Quarterly ' + props.title}
                  yFormat={(props.type === 'totalwages') ? lineGraphDollarFormatter : integerFormatter}
                  xFormat={d => d ? d3.time.format('%Y')(new Date(d)) : ''}
                  xScaleType={'time'}
                  yAxis={true}
                  margin={graphMargin}
                  tooltip={true}
                  quarterChangeListener={props.quarterSelected} />

            </div>

            <div onMouseEnter={lineGraphFocusChanger.bind(null, 'lqLineGraph')}>

              <LineGraph 
                  key={'lq_'+props.field}
                  data={mData.lqdata} 
                  uniq={'lq_'+props.field} 
                  xFormat={d => d ? d3.time.format('%Y')(new Date(d)) : ''}
                  yFormat={floatFormatter}
                  title={'Quarterly LQ '+ props.title}
                  xAxis={true}
                  xScaleType={'time'}
                  yAxis={true}
                  margin={graphMargin}
                  tooltip={true}
                  quarterChangeListener={props.quarterSelected} />

            </div>

          </div>

          <div className='col-xs-4'>
            <Sticky>
              {this.renderToolTip(mData.data, props.selectedQuarter)}
            </Sticky>
          </div>  
        </div>
      </StickyContainer>
    )
  }
}



function quarterBSearcher (selectedQuarterDateTime, dataArr, i, j) {
  // Possible optimization: Use a while loop.
  let x = i + Math.floor((j-i)/2)

  let d = dataArr[x]

  let yDateTime = new Date(d.key).getTime()

  if (selectedQuarterDateTime === yDateTime) {
    return d.values.y
  }

  if (x === i) {
    return 0
  }

  if (selectedQuarterDateTime < yDateTime) {
    return quarterBSearcher(selectedQuarterDateTime, dataArr, i, x)
  } else if (selectedQuarterDateTime > yDateTime){
    return quarterBSearcher(selectedQuarterDateTime, dataArr, x, j)
  } 
}



const mapStateToProps = (state) => ({
  data            : state.metroQcewData.data,
  naicsKeys       : state.metros.naicsKeys,
  selectedQuarter : state.metroQcewData.selectedQuarter,
})

const mapDispatchToProps = {
  loadMetroData,
  loadNaicsKeys,
  quarterSelected,
}

export default connect(mapStateToProps, mapDispatchToProps)(NaicsGraph)
