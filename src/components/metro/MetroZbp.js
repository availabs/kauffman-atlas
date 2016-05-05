"use strict"
import React from 'react'
import d3 from 'd3'
import { connect } from 'react-redux'
import { loadMetroData, loadMetroDataYear } from 'redux/modules/metroZbpData'
import { loadNaicsKeys } from 'redux/modules/msaLookup'
//import naicsLib from 'static/data/naicsKeys'
import RadarChart from 'components/vis/RadarChart/RadarChart'


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

    if(!this.props.naicsKeys){
      return this.props.loadNaicsKeys()
    }
  }

  _processData (year,depth,filter) {
    let currentData = this.props.zbpData[year][this.props.currentMetro] //2003
    let nationalData  = this.props.zbpData['national'][year]
    let naicsLib = this.props.naicsKeys
    if(!depth) depth = 2
    //if(!filter) filter = 'x'

    //console.log('test ',currentData, nationalData)
    let naicsKeys = Object.keys(currentData).filter(function(d){
      return ['totalEmp', 'totalEst'].indexOf(d) === -1
    })


     if(filter){
      naicsKeys = naicsKeys.filter(k => {
        let key = k.substr(0,depth)
        //filter = naicsLib[filter].part_of_range ? naicsLib[filter].part_of_range : filter
        k = naicsLib[k].part_of_range ? naicsLib[k].part_of_range : k
        //console.log(k,filter,k.indexOf(filter))
        return k.indexOf(filter) == 0

      })
     }
     return naicsKeys.reduce(function(prev,current){
      var twoDigit = current.substr(0,depth)
      if(naicsLib[twoDigit].part_of_range){
        twoDigit = naicsLib[twoDigit].part_of_range;
      }
      
      if(!prev[twoDigit]){
        prev[twoDigit] = {
          emp:0, est:0, empShare:0, estShare:0, 
          nat_emp:0, nat_est:0, nat_empShare:0, nat_estShare:0
        }
      }
      if(!nationalData[current]){
        //console.log(current,nationalData)
      }
      prev[twoDigit].emp += +currentData[current].emp
      prev[twoDigit].est += +currentData[current].est
      prev[twoDigit].empShare += +currentData[current].empShare
      prev[twoDigit].estShare += +currentData[current].estShare
      if(nationalData[current]){
        prev[twoDigit].nat_emp += +nationalData[current].emp
        prev[twoDigit].nat_est += +nationalData[current].est
        prev[twoDigit].nat_empShare += +nationalData[current].empShare
        prev[twoDigit].nat_estShare += +nationalData[current].estShare
      }

      return prev
    },{})
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
    let naicsCodes = this._processData(year,depth,filter)
    let naicsLib = this.props.naicsKeys
    let estQuot =  Object.keys(naicsCodes).map(d => {
        naicsCodes[d].est_quot = (naicsCodes[d].estShare / naicsCodes[d].nat_estShare)/100
        return d
    })
    .map(d => {
      return {
        axis: naicsLib[d].title.substr(0,6),
        value:naicsCodes[d].est_quot
      }
    })

    let empQuot =  Object.keys(naicsCodes).map(d => {
        naicsCodes[d].emp_quot = (naicsCodes[d].empShare / naicsCodes[d].nat_empShare)/100
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
    let naicsCodes = this._processData(year,depth, filter)
    let naicsLib = this.props.naicsKeys
    let naicsRows = Object.keys(naicsCodes)
      .map(d => {
        naicsCodes[d].emp_quot = (naicsCodes[d].empShare / naicsCodes[d].nat_empShare)/100
        naicsCodes[d].est_quot = (naicsCodes[d].estShare / naicsCodes[d].nat_estShare)/100
        return d
      })
      .sort((a,b) => {
        return naicsCodes[b][this.state.sort] - naicsCodes[a][this.state.sort]
      })
      .map((d) =>{
      return (
        <tr key={d}>
          <td><a onClick={this._setFilter.bind(this, d, this.state.depth+1)} alt={naicsLib[d].description}>{d} | {naicsLib[d].title}</a></td>
          <td>{naicsCodes[d].emp.toLocaleString()}</td>
          <td>{+(naicsCodes[d].empShare*100).toLocaleString()}%</td>
          <td>{+(naicsCodes[d].emp_quot*100).toLocaleString()}</td>
          <td>{naicsCodes[d].est.toLocaleString()}</td>
          <td>{+(naicsCodes[d].estShare*100).toLocaleString()}%</td>
          <td>{+(naicsCodes[d].est_quot*100).toLocaleString()}</td>
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
        {naicsRows}
        </tbody>
      </table>
    )
  }

  componentDidMount() {
    this._fecthData ()
  }
  
  componentWillReceiveProps (nextProps){
    this._fecthData ()
  }

  hasData () {
    return this.props.zbpData[this.props.year] && 
      this.props.zbpData[this.props.year][this.props.currentMetro] && 
      this.props.zbpData['national'] &&
      this.props.naicsKeys
  }
  render () {
    if (!this.hasData()) return <span />
    let naicsLib = this.props.naicsKeys
    let reset = <a onClick={this._setFilter.bind(this,null,2)}>reset</a>
    return (
      <div className='container'>
        <div>
          {this.renderRadar(this.props.year,this.state.depth, this.state.filter)}
        </div>
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
    zbpData : state.metroZbpData,
    naicsKeys : state.metros.naicsKeys
  })
}

export default connect((mapStateToProps), {
  loadZbpData: (currentMetro) => loadMetroData(currentMetro),
  loadZbpDataYear: (currentMetro,year) => loadMetroDataYear(currentMetro,year),
  loadNaicsKeys: () => loadNaicsKeys()
})(MetroZbp)

