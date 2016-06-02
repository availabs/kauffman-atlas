"use strict"
import React from 'react'
import d3 from 'd3'
import { connect } from 'react-redux'
import { loadMetroData, loadMetroDataYear } from 'redux/modules/metroQcewData'
import clusterLib from 'static/data/clusterLib'
import NetworkGraph from 'components/vis/NetworkGraph/NetworkGraph'
import {typemap} from 'support/qcew/typemap'

export class MetroQcewCluster extends React.Component<void, Props, void> {
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
    }
    
    _fecthData () {
	let qcew = this.props.qcewData
	let msa = this.props.currentMetro
	let year = this.props.year
	

	
	return this.props.loadZbpDataYear(this.props.currentMetro,
					      this.props.year,
					      Object.keys(this._naicsToCluster()))
    }

    _naicsToCluster () {
	return clusterLib.clusters.reduce((prev, cluster) => {
            Object.keys(cluster.naics_2012).forEach((naics) => {
		if(!prev[naics]) prev[naics] = null
		prev[naics] = cluster.cluster_code_t
            })
		return prev
	}, {})
    }

    _clusterToDict () {
	console.log('clusterLib', clusterLib)
	    return clusterLib.clusters.reduce((prev, cluster) => {
		prev[cluster.cluster_code_t] = cluster
		return prev
	    },{})
    }

    _processData (msa,year,depth,filter) {
	let currentData = d3.nest()
			    .key(x=>x.industry_code)
			    .entries(this.props.qcewData[msa][year])

	let naicsToCluster = this._naicsToCluster()
	console.log('my typemap',typemap)    
	let fields = typemap[this.props.type].reduce((a,b) => a.concat(b),[])
	let naicsKeys = currentData.filter((ind) => {
	    return ind.values.reduce((a,b) => {
		return a && naicsToCluster[ind.key] && fields.reduce((tf,field) => tf && b[field],true)
	    })
	})
	let totals = {emp:0, est:0, wages:0}
	console.log('my typemap',typemap)
	let fieldSegs = typemap[this.props.type]
	let data = naicsKeys.reduce((prev,current)=>{
	    var clusterCode = naicsToCluster[current.key]
	    if(!prev[clusterCode]){
		prev[clusterCode] = {
		    emp:0, est:0, empShare:0, estShare:0,emp_quot:0,est_quot:0 
		    ,wages:0, wagesShare:0,wages_quot:0
		}
	    }

	    let computed = {emp:0,est:0,wages:0,empQuot:0,estQuot:0,wagesQuot:0}
	    let catMap = ['emp','emp_quot','est','est_quot','wages','wages_quot']
	    fieldSegs.forEach((cat,i) => {
		let temp = cat.map(key => {
		    return this._quarterReduce(current.values,key)
		}).reduce((a,b) => a+b)/cat.length
		computed[catMap[2*i]] = temp
		let templq = cat.map(key => {
		    return this._quarterReduce(current.values,'lq_'+key)
		}).reduce((a,b) => {
		    if(isNaN(b))
			console.log(clusterCode,cat)
	            return a+b
		})/cat.length
		computed[catMap[2*i+1]] = templq*temp
	    })
	    if(clusterCode === '22')
		console.log(current.key,computed.emp,computed.emp_quot)
		
	    totals.emp += computed.emp
	    totals.est += computed.est
	    totals.wages += computed.wages

	    prev[clusterCode].emp += computed.emp
	    prev[clusterCode].est += computed.est
	    prev[clusterCode].wages += computed.wages
	    prev[clusterCode].emp_quot += computed.emp_quot
	    prev[clusterCode].est_quot += computed.est_quot
	    prev[clusterCode].wages_quot += computed.wages_quot

	    if(isNaN(prev[clusterCode].emp_quot))
		console.log(currrent.key)
	    return prev
	},{})

	    Object.keys(data).forEach(d => {
		data[d].emp_quot = (data[d].emp_quot/data[d].emp) || 0
		data[d].est_quot = (data[d].est_quot/data[d].est) || 0
		data[d].wages_quot = (data[d].wages_quot/data[d].wages) || 0    
		data[d].empShare = (data[d].emp / totals.emp) 
		data[d].estShare = (data[d].est / totals.est)
		data[d].wagesShare = (data[d].wages/totals.wages)
	    })
	    return data
	
    }

    _quarterReduce(obj,field) {
	let total = obj.reduce((x,y) => {
	    return x + +y[field]
	},0)
	return total/4
    }
    
    _clusterToGraph (msa,year) {
	let clusterCodes = this._processData(msa,year)
	    let clusterDict = this._clusterToDict()
	    let clusterToIndex = {}
	let nodes = Object.keys(clusterCodes).map(function(d,i){
	    clusterCodes[d]['name'] = d
	    clusterCodes[d]['cluster_name'] = clusterDict[d].short_name_t
	    clusterToIndex[d] = i
	    return clusterCodes[d]
	})

	    let links = nodes.map(function(d){
		let relations = clusterDict[d.name].related_clusters || []
		return relations.map(r => {
		    return {
			source: clusterToIndex[d.name],
			target: clusterToIndex[r.cluster_code_t],
			value: r.related_avg*10 //related_percentage
		    }
		});
	    }).reduce((a, b) => a.concat(b), [])
	    // console.log('links', links.length)
	    let mean = d3.mean(links, function(d) { return d.value })
	    links = links.filter(d => {
		return nodes[d.source] && nodes[d.target] // && d.value > mean
	    })
	    // console.log('links pruned', links.length)
	    // console.log(d3.min(links, function(d) { return d.value }),d3.max(links, function(d) { return d.value }), )
	    return (
		<NetworkGraph divID='networkGraph' data={{nodes,links}} options={{}} />
	    )
    }

    renderClusterOverview (year, depth, filter) {
	let clusterCodes = this._processData(year,depth, filter)
	    let clusterDict = this._clusterToDict()
	    //console.log('cluster Dictionary', clusterDict)
	    
	    let clusterRows = Object.keys(clusterCodes)
				    .sort((a,b) => {
					return clusterCodes[b][this.state.sort] - clusterCodes[a][this.state.sort]
				    })
				    .map((d) =>{
					return (
					    <tr key={d}>
						<td>
						    <a onClick={this._setFilter.bind(this, d, this.state.depth+1)}>{d} | {clusterDict[d] ? clusterDict[d].name_t : '' } </a></td>
						<td>{clusterCodes[d].emp.toLocaleString()}</td>
						<td>{+(clusterCodes[d].empShare*100).toLocaleString()}%</td>
						<td>{+(clusterCodes[d].emp_quot).toLocaleString()}</td>
						<td>{clusterCodes[d].est.toLocaleString()}</td>
						<td>{+(clusterCodes[d].estShare*100).toLocaleString()}%</td>
						<td>{+(clusterCodes[d].est_quot).toLocaleString()}</td>
						<td>{clusterCodes[d].wages.toLocaleString()}</td>
						<td>{+(clusterCodes[d].wagesShare*100).toLocaleString()}%</td>
						<td>{+(clusterCodes[d].wages_quot).toLocaleString()}</td>
					    </tr>
					)
				    })

	    return (
		<table className='table'>
		    <thead>
			<tr>
			    <td>Employment</td>
			    <td><a onClick={this._setSort.bind(this,'emp')}>Employment</a></td>
			    <td><a onClick={this._setSort.bind(this,'empShare')}>Employment Share</a></td>
			    <td><a onClick={this._setSort.bind(this,'emp_quot')}>Employment Quotient</a></td>
			    <td><a onClick={this._setSort.bind(this,'est')}>Establishments</a></td>
			    <td><a onClick={this._setSort.bind(this,'estShare')}>Establishment Share</a></td>
			    <td><a onClick={this._setSort.bind(this,'est_quot')}>Establishment Quotient</a></td>
			    <td><a onClick={this._setSort.bind(this,'wages')}>Total Wages</a></td>
			    <td><a onClick={this._setSort.bind(this,'wagesShare')}>Total Wages Share</a></td>
			    <td><a onClick={this._setSort.bind(this,'wages_quot')}>Total Wages Quotient</a></td>
			    
			</tr>
		    </thead>
		    <tbody>
			{clusterRows}
		    </tbody>
		</table>
	    )

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
	
	console.log('sort', sort)
	    this.setState({
		sort
	    })
    }

    componentDidMount() {
	this._fecthData ()
    }
    
    componentWillReceiveProps (nextProps){
	this._fecthData ()
    }

    hasData () {
	let msa = this.props.currentMetro
	let year = this.props.year
	let data = this.props.qcewData
	return this.props.naicsKeys && data && data[msa] &&
	       data[msa][year]
    }

    render () {
	let msa = this.props.currentMetro
	let year = this.props.year

	if (!this.hasData()) return <span />
		let reset = <a onClick={this._setFilter.bind(this,null,2)}>reset</a>
		return (
		<div className='container'>
		    <div>
			{/*this._clusterToGraph(msa,year)*/}
		    </div>
		    <div>
			{this.renderClusterOverview(msa,year)}
		    </div>
		</div>
		)
    }
    
}

const mapStateToProps = (state) => {
    return ({
	mapLoaded : state.geoData.loaded,
	metrosGeo : state.geoData.metrosGeo,
	qcewData : state.metroQcewData.yeardata,
	naicsKeys : state.metros.naicsKeys
    })
}

export default connect((mapStateToProps), {
    loadZbpData: (currentMetro) => loadMetroData(currentMetro),
    loadZbpDataYear: (currentMetro,year,codes) => loadMetroDataYear(currentMetro,year,codes),
    loadNaicsKeys: () => loadNaicsKeys()
})(MetroQcewCluster)

