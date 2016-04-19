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
    let naicsKeys = Object.keys(currentData)
    naicsKeys.sort(function(a,b){
      return 
    })

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
    console.log(data);
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

