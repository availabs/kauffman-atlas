"use strict"
import React from 'react'
import d3 from 'd3'
import { connect } from 'react-redux'
import { loadMetroData } from 'redux/modules/metroZbpData'
import naicsLib from 'static/data/naicsKeys'


export class MetroZbp extends React.Component<void, Props, void> {
  constructor () {
    super()
    this._fecthData = this._fecthData.bind(this)
    this._processData = this._processData.bind(this)
  }
  
  _fecthData () {
    if(!this.props.zbpData[this.props.currentMetro]){
      return this.props.loadZbpData(this.props.currentMetro)
    }
  }

  _processData (year) {
    if (!this.props.zbpData[this.props.currentMetro]) return {}
    let data = this.props.zbpData[this.props.currentMetro]
    console.log(data, year)
    let currentData = data[year] //2003
    let naicsKeys = Object.keys(currentData).filter(function(d){
      return ['totalEmp', 'totalEst'].indexOf(d) === -1
    })
    naicsKeys.sort((a, b) => {
      return currentData[b]['estShare'] - currentData[a]['estShare']
    })

    var twoDigitSum = naicsKeys.reduce(function(prev,current){
      var twoDigit = current.substr(0,2)
      if(naicsLib[twoDigit].part_of_range){
        twoDigit = naicsLib[twoDigit].part_of_range
      }
      if(!prev[twoDigit]){
        prev[twoDigit] = {emp:0, est:0, empShare:0, estShare:0}
      }

      prev[twoDigit].emp += +currentData[current].emp
      prev[twoDigit].est += +currentData[current].est
      prev[twoDigit].estShare += +currentData[current].estShare
      prev[twoDigit].empShare += +currentData[current].empShare
      return prev
    },{})

    var sorted =  naicsKeys.map((d) => {
      return +(currentData[d]['estShare']*100).toFixed(2)
    })
    
    

    console.log('after', twoDigitSum)

    return twoDigitSum
  }

  renderNaicsOverview (year) {
    let sortVariable = 'emp'
    let naicsCodes = this._processData(year)
    let naicsRows = Object.keys(naicsCodes)
      .sort(function(a,b){
        return naicsCodes[b][sortVariable] - naicsCodes[a][sortVariable]
      })
      .map(function(d){
        return (
          <tr>
            <td>{d} - {naicsLib[d]['title']}</td>
            <td>{naicsCodes[d].emp}</td>
            <td>{+(naicsCodes[d].empShare*100).toLocaleString()}%</td>
            <td>{naicsCodes[d].est}</td>
            <td>{+(naicsCodes[d].estShare*100).toLocaleString()}%</td>
          </tr>
        )
      })

    return (
      <table className='table'>
      <thead>
        <tr>
          <th>Industry (Naics)</th>
          <th>Employment</th>
          <th>Employment Share</th>
          <th>Establishments</th>
          <th>Establishment Share</th>
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

  render () {
    let data = this.props.zbpData[this.props.currentMetro]
    let years = []
    if(data) {
      years = Object.keys(data)
      .filter((d) => {return d})
      .map((d) => {
        return (
          <div>
            <h4>{d}</h4>
              {this.renderNaicsOverview(d)}
          </div>
        )
      })
    
    }

    return (
      <div className='container'>
        {this.props.zbpData[this.props.currentMetro] ? JSON.stringify(Object.keys(this.props.zbpData[this.props.currentMetro])) : 'no data'}
        {years}
      </div>
    )
  }
  
}

const mapStateToProps = (state) => {
  return ({
    mapLoaded : state.geoData.loaded,
    metrosGeo : state.geoData.metrosGeo,
    zbpData : state.metroZbpData
  })
}

export default connect((mapStateToProps), {
  loadZbpData: (currentMetro) => loadMetroData(currentMetro)
})(MetroZbp)

