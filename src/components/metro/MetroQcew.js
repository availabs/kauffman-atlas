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
	let qcew = this.props.qcewData
	let msa = this.props.currentMetro
	let year = this.props.year
	if((!qcew || !qcew.length || !qcew[msa][year]) )
	{
	    this.props.loadQcewDataYear(this.props.currentMetro,
					this.props.year
				       )
	}

	if(this.state.filter){
	    this.props.loadQcewDataYear(
		this.props.currentMetro,
		this.props.year,
		this.props.naicsTable.Query(this.state.filter,1,true))
	}
	
	
	
	if(!this.props.naicsKeys){
	    return this.props.loadNaicsKeys()
	}
    }

    _processData (msa,year,depth,filter) {
	if(!this.props.qcewData || !this.props.qcewData[msa] ||
	   !this.props.qcewData[msa][year])
	    return
	let currentData = d3.nest()
	    .key( x=>x.industry_code )
	    .entries(this.props.qcewData[msa][year]);
	let naicsLib = this.props.naicsKeys
	if(!depth) depth = 2
	
	let naicsKeys = currentData.filter((ind)=>{
	    return ind.values.reduce((a,b) => { 
		return a && b['lq_qtrly_estabs_count'] &&
		    b['qtrly_estabs_count'] &&
		    b['month1_emplvl'] && b['month2_emplvl']&&
		    b['month3_emplvl'] 
		
	    },true)
	})

	if(filter){
	    let truekeys = this.props.naicsTable.Query(filter,1,true)
	    naicsKeys = naicsKeys.filter(obj => truekeys.indexOf(obj.key) >= 0)
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
	    let empkeys = ['month1_emplvl','month2_emplvl','month3_emplvl']
	    let t1 = 0
	    t1 = empkeys.map(key => {
		return scope._quarterReduce(current.values,key)
	    }).reduce((a,b) => a+b)/empkeys.length
	    
	    let t2 = scope._quarterReduce(current.values,'qtrly_estabs_count')
	    totalEmp += t1
	    totalEst += t2
	    let lqempkeys = empkeys.map(x => 'lq_'+x)
	    
	    let lqt1 = 0
	    lqt1 = lqempkeys.map(key =>{
		return scope._quarterReduce(current.values,'lq_month1_emplvl')
	    }).reduce((a,b) => a+b)/lqempkeys.length
	    let lqt2 = scope._quarterReduce(current.values,'lq_qtrly_estabs_count')
	    
	    prev[twoDigit].empQuot = lqt1
	    prev[twoDigit].estQuot = lqt2
	    
	    prev[twoDigit].emp += t1
	    prev[twoDigit].est += t2
	    return prev
	},{})
	Object.keys(data).map((k) => {
	    let x = data[k]
	    x.empShare = x.emp/totalEmp || 0
	    x.estShare = x.est/totalEst || 0
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

    summarizeData(naicsCodes,naicsLib) {
	let codeRunner = (field1,field2,d) => {
	    naicsCodes[d][field1] = naicsCodes[d][field2]
	    return d
	}
	let dataFormatter = (field,d) => {
	    return {
		    axis:naicsLib[d].title.substr(0,6),
		    value:naicsCodes[d][field]
		}	
	}
	
	let estQuot =  Object.keys(naicsCodes)
            .map(codeRunner.bind(null,'est_quot','estQuot'))
	    .map(dataFormatter.bind(null,'est_quot'))

	let empQuot =  Object.keys(naicsCodes)
	    .map(codeRunner.bind(null,'emp_quot','empQuot'))
	    .map(dataFormatter.bind(null,'emp_quot'))

	let empShare = Object.keys(naicsCodes)
	    .map(dataFormatter.bind(null,'empShare'))
	let estShare = Object.keys(naicsCodes)
	    .map(dataFormatter.bind(null,'estShare'))
    
	return {
	    empShare:empShare,
	    estShare:estShare,
	    estQuot:estQuot,
	    empQuot:empQuot
	}
    }

    renderRadar(year,depth, filter,year2){
	let msa = this.props.currentMetro;
	let naicsCodes = this._processData(msa,year,depth,filter)
	let naicsCodesPast = this._processData(msa,year2 ||'2001',depth,filter)
	let naicsLib = this.props.naicsKeys
	if(!naicsCodes || !Object.keys(naicsCodes).length)
	    return (<span></span>)
	let curQuants = this.summarizeData(naicsCodes, naicsLib)
	let pastQuants = this.summarizeData(naicsCodesPast, naicsLib)
	let empShares = [pastQuants.empShare,curQuants.empShare]
	let empQuots = [pastQuants.empQuot, curQuants.empQuot]
	let estShares = [pastQuants.estShare, curQuants.estShare]
	let estQuots = [pastQuants.estQuot, curQuants.estQuot]

	let rOpts = {
	    w:190, h:190,
	    ExtraWidthX:130, TranslateX:50,
	    color: d3.scale.ordinal().range(['#FFF200','#7D8FAF'])
	}
	return (
		<div className='row'>
		<div className='col-sm-3' style={{'textAlign': 'center',padding:0}}>
		<strong>Employment Share by Industry</strong>
		<RadarChart divID='empShare' data={empShares} options={rOpts} />
		</div>
		<div className='col-sm-3' style={{'textAlign': 'center',padding:0}}>
		<strong>Employment Quotient by Industry</strong>
		<RadarChart divID='empQout' data={empQuots} options={rOpts} />
		</div>
		<div className='col-sm-3' style={{'textAlign': 'center',padding:0}}>
		<strong>Establishment Share by Industry</strong>
		<RadarChart divID='estShare' data={estShares} options={rOpts} />
		</div>
		<div className='col-sm-3' style={{'textAlign': 'center',padding:0}}>
		<strong>Establishment Quotient by Industry</strong>
		<RadarChart divID='estQout' data={estQuots} options={rOpts} />
		</div>
		</div>
	)
    }

    renderNaicsOverview (year, depth, filter) {
	let sortVariable = 'emp_quot'
	let msa = this.props.currentMetro
	if(!this.props.qcewData || !this.props.qcewData[msa] ||
	   !this.props.qcewData[msa][year])
	    return null

	let naicsCodes = this._processData(msa, year, depth, filter)
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

    componentDidUpdate (p,prevState){
	if(this.state.filter !== prevState.filter)
	    this._fecthData()
    }
    
    hasData () {
	return  this.props.naicsKeys
    }
    render () {

	
	if (!this.hasData()) return <span />
	    let naicsLib = this.props.naicsKeys
	let filter = this.state.filter
	let fkeys = (filter) ? this.props.naicsTable.Query(filter,1,true) : null
	let reset = <a onClick={this._setFilter.bind(this,null,2)}>reset</a>
	    return (
		    <div className='container'>
		    <NaicsGraph filter={fkeys}
		currentMetro={this.props.currentMetro} />
		    <div className='row' style={{'textAlign': 'center'}}>
		    <h4>{this.state.filter || '--'} | {naicsLib[this.state.filter] ? naicsLib[this.state.filter].title : 'All Sectors'} {this.state.depth > 2 ? reset : ''}</h4>
		    </div>
		    <div key='leftpad' style={{textAlign: 'left', padding: 15}}>
		    {naicsLib[this.state.filter] && naicsLib[this.state.filter].description ? naicsLib[this.state.filter].description.filter((d,i) => { return i < 4 && d !== "The Sector as a Whole"}).map((d,i) => { return <p key={'desc'+i}>{d}</p> }) : ''}
		</div>
		    <div>
	    	    {this.renderRadar(this.props.year,this.state.depth, this.state.filter)}
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
	naicsTable: state.metros.naicsLookup,
	loadState : state.metroQcewData.year_requests,
    })
}

export default connect((mapStateToProps), {
    loadQcewData : (msaId,codes) => loadMetroData(msaId,codes),
    loadQcewDataYear : (msaId, year, codes) => loadMetroDataYear(msaId, year, codes),
    loadNaicsKeys: () => loadNaicsKeys()
})(MetroQcew)

