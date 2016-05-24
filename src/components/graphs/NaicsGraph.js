"use strict"
import React from 'react'
import {StickyContainer,Sticky} from 'react-sticky'
import { connect } from 'react-redux'
import { loadMetroData, setMetroQuarter } from 'redux/modules/metroQcewData.js'
import d3 from 'd3'
import LineGraph from 'components/graphs/SimpleLineGraph/index'
import { loadNaicsKeys } from 'redux/modules/msaLookup'
type Props = {
};

let yearConst = 2001
export class NaicsGraph extends React.Component<void, Props, void> {
    constructor () {
	super()
	this.state={
	    data: null,	    
	}
	this._onMouse = this._onMouse.bind(this)
    }

    _init (id) {

	if(!this.props.data || id)
	    this.props.loadData(id)
	if(!this.props.naicsKeys){
	    this.props.loadNaicsKeys()
	}
    }
    
    componentWillMount () {
	this._init(this.props.currentMetro)
    }		
    componentWillReceiveProps (nextProps){
	if(this.props.currentMetro !== nextProps.currentMetro)
	    this._init(nextProps.currentMetro)
    }

    renderToolTip() {
	if(!this.props.qtrData)
	    return (<span></span>)
	//otherwise
	let data = this.props.qtrData
	let rows = data.map( x => {
	    return (<tr key={x.key}>
		    <td> {x.key}  </td>
		    <td style={{backgroundColor:x.color}}></td>
		    <td> {x.value} </td>
		    </tr>)
	})

	return (<div id={'tooltip' + this.props.uniq}
		style={{position:'absolute',overflow:'hidden'}}
		>

		<table className='table'>
		<thead><tr><td>Naics</td><td>color</td><td>value</td></tr></thead>
		<tbody>{rows}</tbody>
		</table>
		
		</div>
	       )
    }
    
    
    
    xmap (year,qtr) {
	var val = 4*(parseInt(year)-yearConst) + parseInt(qtr)
	if(!isNaN(val) || val >=0)
	    return val
	else{
	    console.log('NaN',year,qtr)
	    return 0
	}
    }

    revMap (encQ) {
	let chk = encQ % 4
	let qtr = (chk) ? 4 : (chk)
	let year = Math.floor(encQ / 4) - ((chk) ? 0: 1)
	return year + yearConst
    }

    dataMap (data,fields,recfunc) {
	let colors = d3.scale.category20()
	let filterfun = (x) => {
	    if(this.props.filter && this.props.filter.length)
		return this.props.filter.indexOf(x.key) >= 0
	    else
		return x.key.length == 2
	}
	return data.filter(filterfun)
	    .map((industry,i) => {
	    var obj = {}
	    obj.key = industry.key
	    obj.color = colors(i%20)
	    obj.values = industry.values.map( recfunc.bind(this,fields) )
		.sort((a,b) => a.values.x - b.values.x)
	    obj.values.reduce(( a, b ) => {
		if(!b.values.y){
		    b.values.y = a.values.y
		}
		return b
	    })
	    return obj
	})
    }

    aggfunc (finish,fields,rec) {
	let x = this.xmap(rec.year,rec.qtr)
	let y = 0;
	if( !Array.isArray(fields) )
	{
	    y = parseFloat(rec[fields])
	}else
	{
	    y = fields.reduce((a,b,i) => {
		return a + parseFloat(rec[b]);
	    },parseFloat(rec[fields[0]]))
	}
	y = finish(y)
	let val = {
	    key: x,
	    values: {x: x,
		     y: y
		    }
	}
	if(isNaN(val.values.x+val.values.y))
	    console.log(rec,val)
	return val
    }

    _onMouse (data) {
	console.log(data)
	this.props.setQtr(data)
    }
    
    render () {
	console.log(this.props.naicsKeys)
	console.log('naics state', this.props)
	if(!this.props.data || !this.props.data.length)
	    return <span></span>

	let metrodata = d3.nest()
	    .key( x=>x.area_fips)
	    .rollup( values => values)
	    .map(this.props.data)['C'+this.props.currentMetro.substr(0,4)]
	
	
	let data = d3.nest()
	    .key(x=>x.industry_code)
	    .rollup( values => values)
	    .entries(metrodata || [])
	    

	
	

	let noagg = this.aggfunc.bind(this,x=>x)
	
	let normCount = this.dataMap(data,'qtrly_estabs_count',noagg)
	let lqCount = this.dataMap(data,'lq_qtrly_estabs_count',noagg)

	let empfields = ['month1_emplvl','month2_emplvl','month3_emplvl']
	let lqempfields = empfields.map(x => 'lq_' + x)

	let agg = this.aggfunc.bind(this,x => (x/empfields.length))

	let empCount = this.dataMap(data,empfields,agg)
	let lqempCount = this.dataMap(data,lqempfields,agg)
	
	console.log('normCounts',normCount)
	console.log('lqCounts',lqCount)

	let graphMargin = {top: 0, left: 60, right: 20, bottom: 20}

	
	return (
		<div className='row' >
		<div className='col-xs-8'>
		<LineGraph 
		key={'empCount'}
		data={empCount} 
		uniq={'empCount'}
		title={'Quarterly (Avg) Employment Count'}
		yFormat={(x)=>x}
		xScaleType={'linear'}
		yAxis={true}
		margin={graphMargin}
	        tooltip={true}
	        onMouse={this._onMouse}
	        graphSlice={this.props.qtrData}
		/>

	        <LineGraph 
		key={'lqempCount'}
		data={lqempCount} 
		uniq={'lqempCount'}
		title={'Quarterly (Avg) LQ Employment Count'}
		yFormat={(x)=>x}
		xScaleType={'linear'}
		yAxis={true}
		margin={graphMargin}
		tooltip={true}
	        onMouse={this._onMouse}
	        graphSlice={this.props.qtrData}
		/>
		
	    
		<LineGraph 
		key={'normCount'}
		data={normCount} 
		uniq={'qtrlyCount'}
		title={'Quarterly Establishment Count'}
		yFormat={(x)=>x}
		xScaleType={'linear'}
		yAxis={true}
		margin={graphMargin}
		tooltip={true}
	        onMouse={this._onMouse}
	        graphSlice={this.props.qtrData}
		/>
		
		<LineGraph 
		key={'lqCount'}
		data={lqCount} 
		uniq='lqCount' 
		xFormat={(x)=>this.revMap(x)} 
		title={'Quarterly LQ Establishment Count'}
		xAxis={true}
		xScaleType={'linear'}
		yAxis={true}
		margin={graphMargin}
		tooltip={true}
	        onMouse={this._onMouse}
	        graphSlice={this.props.qtrData}
		/>
		</div>
		<StickyContainer>
		<div className='col-xs-4'>

		<Sticky>
		{this.renderToolTip()}
	        </Sticky>
		</div>
		</StickyContainer>
		</div>)
    }
}

const mapStateToProps = (state) => ({
    data : state.metroQcewData.data,
    naicsKeys : state.metros.naicsKeys,
    qtrData : state.metroQcewData.qtrData
    
})

export default connect((mapStateToProps), {
    loadData : (msaId, year) => loadMetroData(msaId),
    loadNaicsKeys : () => loadNaicsKeys(),
    setQtr : (d) => setMetroQuarter(d),
})(NaicsGraph)
