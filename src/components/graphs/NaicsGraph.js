"use strict"

import React from 'react'
import {StickyContainer,Sticky} from 'react-sticky'
import { connect } from 'react-redux'
import { loadMetroData, setMetroQuarter } from 'redux/modules/metroQcewData.js'
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

let yearConst = 2001

export class NaicsGraph extends React.Component<void, Props, void> {

    constructor () {
      super()
      
      this.state={
        data: null,      
      }

      this._onMouse = this._onMouse.bind(this)
      this._process = this._process.bind(this)
    }

    _init (id) {

      if(!this.props.data || id) {
        this.props.loadData(id)
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

   
    renderToolTip (mData) {

      let data;

      if (!this.props.qtrData) {
        data = mData
      } else { 
        data = this.props.qtrData
      }

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
             style={{overflow:'scroll'}}>

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
    
     
    xmap (year, qtr) {

      var val = (4 * (parseInt(year) - yearConst)) + parseInt(qtr)

      if(!isNaN(val) || val >= 0) {
          return val
      } else {
        return 0
      }
    }

    revMap (encQ) {
      let chk = encQ % 4

      let qtr = (chk) ? 4 : (chk)

      let year = Math.floor(encQ / 4) - ((chk) ? 0 : 1)

      return year + yearConst
    }

    dataMap (data, fields, recfunc) {

      let colors = d3.scale.category20c()

      let filterfun = (x) => {

        if (this.props.filter && this.props.filter.length) {
          return this.props.filter.indexOf(x.key) >= 0
        } else {
          return x.key.split('-')[0].length === 2
        }

      }

      return data.filter(filterfun)
                 .map((industry, i) => {

                   var obj = {}

                   obj.key = industry.key
                   obj.color = colors(i%20)
                   obj.values = industry.values
                                        .map( recfunc.bind(this,fields) )
                                        .sort((a,b) => (a.values.x - b.values.x))

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

      let x = this.xmap(rec.year, rec.qtr)
      let y = 0;

      if( !Array.isArray(fields) ) {
        y = parseFloat(rec[fields])
      } else {
        y = fields.map(x => parseFloat(rec[x]))
                  .reduce((sum, b) => sum + b, 0)
      }

      y = finish(y)

      let val = {
        key: x,
        values: { x, y, }
      }

      return val
  }

  _onMouse (data) {
    this.props.setQtr(data)
  }

  _process (data,agg,noagg) {

    let pdata = {}
    let fields = typemap[this.props.type]
    let lqfields = fields.map(x => 'lq_' + x)

    if(this.props.type !== 'employment'){
      pdata.data = this.dataMap(data, fields, noagg)
      pdata.lqdata = this.dataMap(data, lqfields, noagg)

      console.log(pdata)
    } else {
      pdata.data = this.dataMap(data, fields, agg)
      pdata.lqdata = this.dataMap(data, lqfields, agg)
    }
        
    return pdata
  }
  
  render () {

    if (!this.props.data || !this.props.data.length) {
      return <span></span>
    }

    let metrodata = d3.nest()
                      .key(x => x.area_fips)
                      .rollup(values => values)
                      .map(this.props.data)['C'+this.props.currentMetro.substr(0,4)]

    let data = d3.nest()
                 .key(x => x.industry_code)
                 .rollup(values => values)
                 .entries(metrodata || [])

    let empfields = typemap[this.props.type]
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
      <div className='row' style={{overflow:'hidden'}} >

        <div className='col-xs-8'>

          <div onMouseEnter={lineGraphFocusChanger.bind(null, 'rawLinegraph')}>

            <LineGraph 
                key={this.props.field}
                data={mData.data} 
                uniq={this.props.field}
                title={'Quarterly ' + this.props.title}
                yFormat={(this.props.type === 'totalwages') ? lineGraphDollarFormatter : integerFormatter}
                xScaleType={'linear'}
                yAxis={true}
                margin={graphMargin}
                tooltip={true}
                onMouse={this._onMouse}
                graphSlice={this.props.qtrData} />

          </div>

          <div onMouseEnter={lineGraphFocusChanger.bind(null, 'lqLineGraph')}>

            <LineGraph 
                key={'lq_'+this.props.field}
                data={mData.lqdata} 
                uniq={'lq_'+this.props.field} 
                xFormat={(x)=>this.revMap(x)} 
                yFormat={floatFormatter}
                title={'Quarterly LQ '+ this.props.title}
                xAxis={true}
                xScaleType={'linear'}
                yAxis={true}
                margin={graphMargin}
                tooltip={true}
                onMouse={this._onMouse}
                graphSlice={this.props.qtrData} />

          </div>

        </div>

        <div className='col-xs-4'>
          {this.renderToolTip(mData.data)}
        </div>  
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  data      : state.metroQcewData.data,
  naicsKeys : state.metros.naicsKeys,
  qtrData   : state.metroQcewData.qtrData
})

export default connect((mapStateToProps), {
  loadData      : (msaId, year) => loadMetroData(msaId),
  loadNaicsKeys : () => loadNaicsKeys(),
  setQtr        : (d) => setMetroQuarter(d),
})(NaicsGraph)
