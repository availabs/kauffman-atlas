"use strict"
import React from 'react'
import d3 from 'd3'
import { connect } from 'react-redux'
import { loadMetroData, loadMetroDataYear } from 'redux/modules/metroQcewData'
import { loadNaicsKeys } from 'redux/modules/msaLookup'
//import naicsLib from 'static/data/naicsKeys'
import RadarChart from 'components/vis/RadarChart/RadarChart'
import classes from 'styles/sitewide/index.scss'
import NaicsGraph from 'components/graphs/NaicsGraph'


export class MetroQcew extends React.Component<void, Props, void> {
    constructor () {
	super()
	this.state = {
	    depth: 2,
	    filter: null,
	    sort: 'emp_quot'
	}
	this._fecthData = this._fecthData.bind(this)
	this._processData = this._processData.bind(this)
	this._setFilter = this._setFilter.bind(this)
	this._quarterReduce = this._quarterReduce.bind(this)
	this.renderNaicsOverview = this.renderNaicsOverview.bind(this)
	this.renderRadar = this.renderRadar.bind(this)
    }
    
    _fecthData () {
	//console.log(this.props.zbpData[this.props.year])
	if((!this.props.qcewData || !this.props.qcewData.length || 
	    !this.props.qcewData[this.props.year][this.props.currentMetro]) && 
	   (!this.props.year_requests || 
	    !this.props.year_requests[this.props.currentMetro] || 
	    !this.props.year_requests[this.props.currentMetro][this.props.year])
	  ) {
	    this.props.loadQcewDataYear(this.props.currentMetro,
					this.props.year)
	}

	if(!this.props.naicsKeys){
	    return this.props.loadNaicsKeys()
	}
    }

    _processData (year,depth,filter) {
	if(!this.props.qcewData)
	    return
	let currentData = this.props.qcewData[year].values[0].values;
	let naicsLib = this.props.naicsKeys
	if(!depth) depth = 2
	//if(!filter) filter = 'x'
	//console.log('test ',currentData, nationalData)
	let naicsKeys = currentData.filter((ind)=>{
	    return ind.values.reduce((a,b) => { 
		return a && b['lq_qtrly_estabs_count'] &&
		    b['qtrly_estabs_count'] &&
		    b['month1_emplvl'] && b['month2_emplvl']&&
		    b['month3_emplvl'] 
		
	    },true)
	})

	if(filter){
	    naicsKeys = naicsKeys.filter(k => {
		let key = k.key.substr(0,depth)
		//filter = naicsLib[filter].part_of_range ? naicsLib[filter].part_of_range : filter
		k = naicsLib[k].part_of_range ? naicsLib[k].part_of_range : k
		//console.log(k,filter,k.indexOf(filter))
		return k.indexOf(filter) == 0

	    })
	}
	let totalEmp = 0, totalEst = 0;
	var scope = this
	var data = naicsKeys.reduce((prev,current) => {
	    var twoDigit = current.key.substr(0,depth)
	    if(naicsLib[twoDigit].part_of_range){
		twoDigit = naicsLib[twoDigit].part_of_range;
	    }
	    
	    if(!prev[twoDigit]){
		prev[twoDigit] = {
		    emp:0, est:0, empShare:0, estShare:0, 
		}
	    }
	    let t1 = scope._quarterReduce(current.values,'month1_emplvl')
	    let t2 = scope._quarterReduce(current.values,'qtrly_estabs_count')
	    totalEmp += t1
	    totalEst += t2

	    let lqt1 = scope._quarterReduce(current.values,'lq_month1_emplvl')
	    let lqt2 = scope._quarterReduce(current.values,'lq_qtrly_estabs_count')
	    
	    prev[twoDigit].empQuot = lqt1
	    prev[twoDigit].estQuot = lqt2
	    
	    prev[twoDigit].emp += t1
	    prev[twoDigit].est += t2
	    return prev
	},{})
	Object.keys(data).map((k) => {
	    let x = data[k]
	    x.empShare = x.emp/totalEmp
	    x.estShare = x.est/totalEst
	    return x
	})
	return data
	
    }

    _quarterReduce(obj,field) {
	let total = obj.reduce((x,y) => {
	    return x + +y[field]
	},0)
	return total/4
    }

    _setFilter(filter,depth) {
	if(depth <= 6){
	    this.setState({
		filter,
		depth
	    })
	}
    }

    _setSort(sort) {
	this.setState({
	    sort
	})
    }

    renderRadar(year,depth, filter){
	let naicsCodes = this._processData.bind(this,year,depth,filter)
	let naicsLib = this.props.naicsKeys
	let estQuot =  Object.keys(naicsCodes).map(d => {
            naicsCodes[d].est_quot = naicsCodes[d].estQuot
            return d
	})
	    .map(d => {
		return {
		    axis: naicsLib[d].title.substr(0,6),
		    value:naicsCodes[d].est_quot
		}
	    })

	let empQuot =  Object.keys(naicsCodes).map(d => {
            naicsCodes[d].emp_quot = naicsCodes[d].empQuot
            return d
	})
	    .map(d => {
		return {
		    axis:naicsLib[d].title.substr(0,6),
		    value:naicsCodes[d].emp_quot
		}
	    })

	let empShare = Object.keys(naicsCodes)
	    .map(d => {
		return {
		    axis:naicsLib[d].title.substr(0,6),
		    value:naicsCodes[d].empShare
		}
	    })
	let estShare = Object.keys(naicsCodes)
	    .map(d => {
		return {
		    axis:naicsLib[d].title.substr(0,6),
		    value:naicsCodes[d].estShare
		}

	    })
	return (
		<div className='row'>
		<div className='col-sm-3' style={{'textAlign': 'center',padding:0}}>
		<strong>Employment Share by Industry</strong>
		<RadarChart divID='empShare' data={[empShare]} options={{w:190, h:190, ExtraWidthX:130, TranslateX: 50}} />
		</div>
		<div className='col-sm-3' style={{'textAlign': 'center',padding:0}}>
		<strong>Employment Quotient by Industry</strong>
		<RadarChart divID='empQout' data={[empQuot]} options={{w:190, h:190, ExtraWidthX:130, TranslateX: 50}} />
		</div>
		<div className='col-sm-3' style={{'textAlign': 'center',padding:0}}>
		<strong>Establishment Share by Industry</strong>
		<RadarChart divID='estShare' data={[estShare]} options={{w:190, h:190, ExtraWidthX:130, TranslateX: 50}} />
		</div>
		<div className='col-sm-3' style={{'textAlign': 'center',padding:0}}>
		<strong>Establishment Quotient by Industry</strong>
		<RadarChart divID='estQout' data={[estQuot]} options={{w:190, h:190, ExtraWidthX:130, TranslateX: 50}} />
		</div>
		</div>
	)
    }

    renderNaicsOverview (year, depth, filter) {
	let sortVariable = 'emp_quot'

	if(!this.props.qcewData)
	    return null
	let naicsCodes = this._processData(year,depth, filter)
	let naicsLib = this.props.naicsKeys
	let naicsRows = Object.keys(naicsCodes)
	    .map(d => {
		naicsCodes[d].emp_quot = naicsCodes[d].empQuot
		naicsCodes[d].est_quot = naicsCodes[d].estQuot
		return d
	    })
	    .sort((a,b) => {
		return naicsCodes[b][this.state.sort] - naicsCodes[a][this.state.sort]
	    })
	    .map((d) =>{
		return (
			<tr key={d}>
			<td><a className={classes['bluelink']} onClick={this._setFilter.bind(this, d, this.state.depth+1)} alt={naicsLib[d].description}>{d} | {naicsLib[d].title}</a></td>
			<td>{naicsCodes[d].emp.toLocaleString()}</td>
			<td>{+(naicsCodes[d].empShare*100).toLocaleString()}%</td>
			<td>{+(naicsCodes[d].emp_quot).toLocaleString()}</td>
			<td>{naicsCodes[d].est.toLocaleString()}</td>
			<td>{+(naicsCodes[d].estShare*100).toLocaleString()}%</td>
			<td>{+(naicsCodes[d].est_quot).toLocaleString()}</td>
			</tr>
		)
	    })

	return (
		<table className='table'>
		<thead>
		<tr>
		<td>Employment</td>
		<td><a className={classes['bluelink']}  onClick={this._setSort.bind(this,'emp')}>Employment</a></td>
		<td><a className={classes['bluelink']}  onClick={this._setSort.bind(this,'empShare')}>Employment Share</a></td>
		<td><a className={classes['bluelink']}  onClick={this._setSort.bind(this,'emp_quot')}>Employment Quotient</a></td>
		<td><a className={classes['bluelink']}  onClick={this._setSort.bind(this,'est')}>Establishments</a></td>
		<td><a className={classes['bluelink']}  onClick={this._setSort.bind(this,'estShare')}>Establishment Share</a></td>
		<td><a className={classes['bluelink']}  onClick={this._setSort.bind(this,'est_quot')}>Establishment Quotient</a></td>
		</tr>
		</thead>
		<tbody>
		{naicsRows}
            </tbody>
		</table>
	)
    }

    componentDidMount() {
	console.info('fetching initial data')
	this._fecthData ()
    }
    
    componentWillReceiveProps (nextProps){
	console.info('fetching new data')
	this._fecthData ()
    }

    hasData () {
	return  this.props.naicsKeys
    }
    render () {
	    // <div>
	    // 	    {this.renderRadar(this.props.year,this.state.depth, this.state.filter)}
	    // 	</div>

	
	if (!this.hasData()) return <span />
	    let naicsLib = this.props.naicsKeys
	let reset = <a onClick={this._setFilter.bind(this,null,2)}>reset</a>
	    return (
		    <div className='container'>
		    <NaicsGraph currentMetro={this.props.currentMetro} />
		    <div className='row' style={{'textAlign': 'center'}}>
		    <h4>{this.state.filter || '--'} | {naicsLib[this.state.filter] ? naicsLib[this.state.filter].title : 'All Sectors'} {this.state.depth > 2 ? reset : ''}</h4>
		    </div>
		    <div style={{textAlign: 'left', padding: 15}}>
		    {naicsLib[this.state.filter] && naicsLib[this.state.filter].description ? naicsLib[this.state.filter].description.filter((d,i) => { return i < 4 && d !== "The Sector as a Whole"}).map(d => { return <p>{d}</p> }) : ''}
		</div>
	
		    <div>
		    {this.renderNaicsOverview(this.props.year,this.state.depth, this.state.filter)}
		</div>
		    </div>
	    )
    }
    
}

const mapStateToProps = (state) => {
    return ({
	mapLoaded : state.geoData.loaded,
	metrosGeo : state.geoData.metrosGeo,
	qcewData  : state.metroQcewData.yeardata,
	naicsKeys : state.metros.naicsKeys,
	loadState : state.metroQcewData.year_requests
    })
}

export default connect((mapStateToProps), {
    loadQcewData : (msaId) => loadMetroData(msaId),
    loadQcewDataYear : (msaId, year) => loadMetroDataYear(msaId, year),
    loadNaicsKeys: () => loadNaicsKeys()
})(MetroQcew)

