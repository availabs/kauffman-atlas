"use strict"
import React from 'react'
import d3 from 'd3'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { loadMetroData, loadMetroDataYear } from 'redux/modules/metroQcewData'
import { loadNaicsKeys } from 'redux/modules/msaLookup'
import { setYear } from 'redux/modules/metroTime'
//import naicsLib from 'static/data/naicsKeys'
import RadarChart from 'components/vis/RadarChart/RadarChart'
import classes from 'styles/sitewide/index.scss'
import NaicsGraph from 'components/graphs/NaicsGraph'
import {typemap} from 'support/qcew/typemap'
import YearSelect from 'components/misc/yearselect'
let startingYear = '2001'
export class MetroQcew extends React.Component<void, Props, void> {
    constructor () {
	super()
	this.state = {
	    depth: 2,
	    filter: null,
	    sort: 'type_quot'
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
	let fields = typemap[this.props.type]
	let naicsKeys = currentData.filter((ind)=>{
	    return ind.values.reduce((a,b) => { 
		return a && fields.reduce((tf,field) => tf && b[field],true)
	    },true)
	})

	if(filter){
	    let truekeys = this.props.naicsTable.Query(filter,1,true)
	    naicsKeys = naicsKeys.filter(obj => truekeys.indexOf(obj.key) >= 0)
	}
	let totalType = 0
	var scope = this
	var data = naicsKeys.reduce((prev,current) => {
	    var twoDigit = current.key.substr(0,depth)
	    if(naicsLib[twoDigit].part_of_range){
		twoDigit = naicsLib[twoDigit].part_of_range;
	    }
	    if(!prev[twoDigit]){
		prev[twoDigit] = {
		    type:0,  typeShare:0 
		}
	    }

	    let t1 = 0
	    t1 = fields.map(key => {
		return scope._quarterReduce(current.values,key)
	    }).reduce((a,b) => a+b)/fields.length
	    
	    totalType += t1

	    let lqtypekeys = fields.map(x => 'lq_'+x)
	    
	    let lqt1 = 0
	    
	    lqt1 = lqtypekeys.map(key =>{
		return scope._quarterReduce(current.values,key)
	    }).reduce((a,b) => a+b)/lqtypekeys.length
	    
	    prev[twoDigit].typeQuot = lqt1
	    
	    prev[twoDigit].type += t1
	    
	    return prev
	},{})
	Object.keys(data).map((k) => {
	    let x = data[k]
	    x.typeShare = x.type/totalType || 0
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
	
	let typeQuot =  Object.keys(naicsCodes)
            .map(codeRunner.bind(null,'type_quot','typeQuot'))
	    .map(dataFormatter.bind(null,'type_quot'))


	let typeShare = Object.keys(naicsCodes)
	    .map(dataFormatter.bind(null,'typeShare'))

    
	return {
	    typeShare:typeShare,
	    typeQuot:typeQuot
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
	let typeShares = [pastQuants.typeShare,curQuants.typeShare]
	let typeQuots = [pastQuants.typeQuot, curQuants.typeQuot]
	

	let rOpts = {
	    w:190, h:190,
	    ExtraWidthX:130, TranslateX:50,
	    color: d3.scale.ordinal().range(['#4CAF50','#7D8FAF'])
	}
	return (
	    <div className='row'>
		<div className='col-sm-2'>
		    <strong>Year Select</strong>
		    <div className='row'>
			<YearSelect id='current' type='current' year={this.props.year}/>
		    </div>
		    <div className='row'>
			<YearSelect id='secondary' type='syear' year={this.props.syear}/>
		    </div>
		</div>
		<div className='col-sm-5'
		     style={{'textAlign': 'center',padding:0}}>
		    <strong>{this.props.title} Share by Industry</strong>
		    <RadarChart divID='typeShare' data={typeShares}
				options={rOpts} />
		</div>

		<div className='col-sm-5'
		     style={{'textAlign': 'center',padding:0}}>
		    <strong>{this.props.title} Quotient by Industry</strong>
		    <RadarChart divID='typeQout' data={typeQuots}
				options={rOpts} />
		</div>
	    </div>
	)
    }

    renderNaicsOverview (year, depth, filter) {
	let sortVariable = 'type_quot'
	let msa = this.props.currentMetro
	if(!this.props.qcewData || !this.props.qcewData[msa] ||
	   !this.props.qcewData[msa][year])
	    return null

	let metro = this.props.currentMetro
	let page = this.props.title
	let naicsCodes = this._processData(msa, year, depth, filter)
	let naicsLib = this.props.naicsKeys
	let naicsRows = Object.keys(naicsCodes)
	    .map(d => {
		naicsCodes[d].type_quot = naicsCodes[d].typeQuot
		return d
	    })
	    .sort((a,b) => {
		return naicsCodes[b][this.state.sort] - naicsCodes[a][this.state.sort]
	    })
	    .map((d) =>{
		return (
		    <tr key={d}>
			<td>
			    <Link to ={'/metro/'+metro+'/'+page+'/'+d}
				  className={classes['bluelink']}
				  onClick={this._setFilter
					       .bind(this, d,
						     this.state.depth+1)}
				  alt={naicsLib[d].description}>
				{d} | {naicsLib[d].title}
			    </Link>
			</td>
			<td>{naicsCodes[d].type.toLocaleString()}</td>
			<td>{+(naicsCodes[d].typeShare*100).toLocaleString()}%</td>
			<td>{+(naicsCodes[d].type_quot).toLocaleString()}</td>
		    </tr>
		)
	    })

	return (
	    <table className='table'>
		<thead>
		    <tr>
			<td>{this.props.title}</td>
			<td><a className={classes['bluelink']}
			       onClick={this._setSort.bind(this,'type')}>
			    {this.props.title}</a></td>
			<td><a className={classes['bluelink']}
			       onClick={this._setSort.bind(this,'typeShare')}>
			    {this.props.title} Share</a></td>
			<td><a className={classes['bluelink']}
			       onClick={this._setSort.bind(this,'type_quot')}>
			    {this.props.title} Quotient</a></td>
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
    
    componentWillReceiveProps (nextProps) {
	this._fecthData();
	let naics_code = nextProps.params.naics_code
	if(naics_code && (naics_code !== this.state.filter)){
	    this.setState({filter:naics_code,depth:naics_code.length+1})
	}
	if(!naics_code && (this.state.filter)){
	    this.setState({filter:null,depth:2})
	}
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
	let reset =(
	    <Link to={'/metro/'+this.props.currentMetro+'/'+this.props.title}
		onClick={this._setFilter.bind(this,null,2)}>
		{' reset'}
	    </Link>)
	    return (
	    <div className='container'>
		<div className='row' style={{'textAlign': 'center'}}>
		    <h4>{this.state.filter || '--'} |
			{naicsLib[this.state.filter] ?
			 naicsLib[this.state.filter].title : 'All Sectors'}
			{this.state.depth > 2 ? reset : ''}</h4>
		</div>
		<div key='leftpad' style={{textAlign: 'left', padding: 15}}>
		    {naicsLib[this.state.filter] && naicsLib[this.state.filter].description ? naicsLib[this.state.filter].description.filter((d,i) => { return i < 4 && d !== "The Sector as a Whole"}).map((d,i) => { return <p key={'desc'+i}>{d}</p> }) : ''}
		</div>
		<NaicsGraph filter={fkeys}
			    currentMetro={this.props.currentMetro}
			    type={this.props.type}
			    title={this.props.title}
		/>
		<div>
	    	    {this.renderRadar(this.props.year,this.state.depth, this.state.filter,this.props.syear)}
	    	</div>
		<div>

		    {this.renderNaicsOverview(this.props.year,this.state.depth, this.state.filter,this.props.syear)}
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
    loadNaicsKeys: () => loadNaicsKeys(),
    loadYear : (year) => setYear(year)
})(MetroQcew)

