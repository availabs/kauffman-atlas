use strict"
import React from 'react'
import d3 from 'd3'
import { connect } from 'react-redux'
import { loadNationalData } from 'redux/modules/geoData'
import { loadMetroData } from 'redux/modules/metroZbpData'
import topojson from 'topojson'
import classes from './NationalMap.scss'


export class MetroZbp extends React.Component<void, Props, void> {
  constructor () {
    super()
    this._fecthData = this._initGraph.bind(this)
  }

  componentDidMount() {
    this._fecthData ()
  }
  componentWillReceiveProps (nextProps){
    this._fecthData ()
  }

  _fecthData () {
    if(!this.props.zbpData[this.props.currentMetro]){
      return this.props.loadZbpData(this.props.currentMetro)
    }
  }

  render () {
   
    return (
      <div className='container'>
        {this.props.zbpData[this.props.currentMetro]}
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
  loadData: () => loadNationalData(),
  loadZbpData: (currentMetro) => loadMetroData(currentMetro)
})(MetroMap)

