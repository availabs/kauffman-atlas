"use strict"
import React from 'react'
import d3 from 'd3'
import { connect } from 'react-redux'
import { loadMetroData } from 'redux/modules/metroZbpData'


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

  _processData () {
    if (!this.props.zbpData[this.props.currentMetro]) return {}
    let data = this.props.zbpData[this.props.currentMetro]
    let year = Object.keys(data)[Object.keys(data).length - 1]
    let currentData = data[year] //2003
    let naicsKeys = Object.keys(currentData).filter(function(d){
      return ['totalEmp', 'totalEst'].indexOf(d) === -1
    })
    naicsKeys.sort((a, b) => {
      return currentData[b]['estShare'] - currentData[a]['estShare']
    })

    var twoDigitSum = naicsKeys.reduce(function(prev,current){
      var twoDigit = current.substr(0,2)
      if(!prev[twoDigit]){
        prev[twoDigit] = 0
      }
      prev[twoDigit] += +currentData[current]['estShare']
      return prev
    },{})

    var sorted =  naicsKeys.map((d) => {
      return +(currentData[d]['estShare']*100).toFixed(2)
    })
    
    

    console.log('after', twoDigitSum)

    return data
  }

  componentDidMount() {
    this._fecthData ()
  }
  
  componentWillReceiveProps (nextProps){
    this._fecthData ()
  }

  render () {
    let data = this._processData()
    return (
      <div className='container'>
        {this.props.zbpData[this.props.currentMetro] ? JSON.stringify(Object.keys(this.props.zbpData[this.props.currentMetro])) : 'no data'}
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

