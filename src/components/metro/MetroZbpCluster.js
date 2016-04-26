"use strict"
import React from 'react'
import d3 from 'd3'
import { connect } from 'react-redux'
import { loadMetroData, loadMetroDataYear } from 'redux/modules/metroZbpData'
import naicsLib from 'static/data/naicsKeys'
import clusterLib from 'static/data/clusterLib'
import NetworkGraph from 'components/vis/NetworkGraph/NetworkGraph'


export class MetroZbp extends React.Component<void, Props, void> {
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
    //console.log(this.props.zbpData[this.props.year])
    if(!this.props.zbpData[this.props.year] || !this.props.zbpData[this.props.year][this.props.currentMetro]){
      return this.props.loadZbpDataYear(this.props.currentMetro,this.props.year)
    }

    if(!this.props.zbpData['national']){
      return this.props.loadZbpData('national')
    }
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

  _processData (year,depth,filter) {
    let currentData = this.props.zbpData[year][this.props.currentMetro] //2003
    let nationalData  = this.props.zbpData['national'][year]
    let naicsToCluster = this._naicsToCluster()
    //if(!filter) filter = 'x'

    //console.log('test ',currentData, nationalData)
    let naicsKeys = Object.keys(currentData).filter(function(d){
      return ['totalEmp', 'totalEst'].indexOf(d) === -1
    })

     if(filter){
      //do stuff
     }

    let data = naicsKeys.reduce(function(prev,current){
      var clusterCode = naicsToCluster[current]
      
      if(!prev[clusterCode]){
        prev[clusterCode] = {
          emp:0, est:0, empShare:0, estShare:0, 
          nat_emp:0, nat_est:0, nat_empShare:0, nat_estShare:0
        }
      }

      if(!nationalData[current]){
        //console.log(current,nationalData)
      }

      prev[clusterCode].emp += +currentData[current].emp
      prev[clusterCode].est += +currentData[current].est
      prev[clusterCode].empShare += +currentData[current].empShare
      prev[clusterCode].estShare += +currentData[current].estShare

      if(nationalData[current]){
        prev[clusterCode].nat_emp += +nationalData[current].emp
        prev[clusterCode].nat_est += +nationalData[current].est
        prev[clusterCode].nat_empShare += +nationalData[current].empShare
        prev[clusterCode].nat_estShare += +nationalData[current].estShare
      }

      return prev
    },{})

    Object.keys(data).forEach(d => {
      data[d].emp_quot = (data[d].empShare / data[d].nat_empShare)/100
      data[d].est_quot = (data[d].estShare / data[d].nat_estShare)/100
      return d
    })
    return data
    
  }

  _clusterToGraph (year) {
    let clusterCodes = this._processData(year)
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
            <td>{+(clusterCodes[d].emp_quot*100).toLocaleString()}</td>
            <td>{clusterCodes[d].est.toLocaleString()}</td>
            <td>{+(clusterCodes[d].estShare*100).toLocaleString()}%</td>
            <td>{+(clusterCodes[d].est_quot*100).toLocaleString()}</td>
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
    return this.props.zbpData[this.props.year] && this.props.zbpData[this.props.year][this.props.currentMetro] && this.props.zbpData['national'] ? true : false
  }

  render () {
    if (!this.hasData()) return <span />
    let reset = <a onClick={this._setFilter.bind(this,null,2)}>reset</a>
    return (
      <div className='container'>
        <div>
          {this._clusterToGraph(this.props.year)}
        </div>
        <div>
         {this.renderClusterOverview(this.props.year)}
        </div>
      </div>
    )
  }
  
}

const mapStateToProps = (state) => {
  return ({
    mapLoaded : state.geoData.loaded,
    metrosGeo : state.geoData.metrosGeo,
    zbpData : state.metroZbpData,
  })
}

export default connect((mapStateToProps), {
  loadZbpData: (currentMetro) => loadMetroData(currentMetro),
  loadZbpDataYear: (currentMetro,year) => loadMetroDataYear(currentMetro,year)
})(MetroZbp)

