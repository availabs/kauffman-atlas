"use strict"
import React from 'react'
import d3 from 'd3'
import { connect } from 'react-redux'
import { loadMetroData, loadMetroDataYear } from 'redux/modules/metroZbpData'
import naicsLib from 'static/data/naicsKeys'


export class MetroZbp extends React.Component<void, Props, void> {
  constructor () {
    super()
    this._fecthData = this._fecthData.bind(this)
    this._processData = this._processData.bind(this)
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

  _processData (year,depth,filter) {
    let currentData = this.props.zbpData[year][this.props.currentMetro] //2003
    let nationalData  = this.props.zbpData['national'][year]

    //console.log('test ',currentData, nationalData)
    let naicsKeys = Object.keys(currentData).filter(function(d){
      return ['totalEmp', 'totalEst'].indexOf(d) === -1
    })

     return naicsKeys.reduce(function(prev,current){
      var twoDigit = current.substr(0,4)
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
        console.log(current,nationalData)
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
    
    console.log('after', twoDigitSum)

    return twoDigitSum
  }

  renderNaicsOverview (year) {
    let sortVariable = 'emp_quot'
    let naicsCodes = this._processData(year)
    let naicsRows = Object.keys(naicsCodes)
      .map(d => {
        naicsCodes[d].emp_quot = (naicsCodes[d].empShare / naicsCodes[d].nat_empShare)/100
        naicsCodes[d].est_quot = (naicsCodes[d].estShare / naicsCodes[d].nat_estShare)/100
        return d
      })
      .sort(function(a,b){
        return naicsCodes[b][sortVariable] - naicsCodes[a][sortVariable]
      })
      .map(function(d){
      return (
        <tr>
          <td>{d} - {naicsLib[d].title.substr(0,55)}</td>
          <td>{naicsCodes[d].emp}</td>
          <td>{+(naicsCodes[d].empShare*100).toLocaleString()}%</td>
          <td>{+(naicsCodes[d].emp_quot*100).toLocaleString()}</td>
          <td>{naicsCodes[d].est}</td>
          <td>{+(naicsCodes[d].estShare*100).toLocaleString()}%</td>
          <td>{+(naicsCodes[d].est_quot*100).toLocaleString()}</td>
        </tr>
      )
    })

    return (
      <table className='table'>
        <thead>
          <tr>
            <td>Industry (Naics)</td>
            <td>Employment</td>
            <td>Employment Share</td>
            <td>Employment Quotient</td>
            <td>Establishments</td>
            <td>Establishment Share</td>
             <td>Establishment Quotient</td>
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
    return this.props.zbpData[this.props.year] && this.props.zbpData[this.props.year][this.props.currentMetro] && this.props.zbpData['national']
  }
  render () {
    if (!this.hasData()) return <span />
    
    return (
      <div className='container'>
        <div>
          {this.renderNaicsOverview(this.props.year)}
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

