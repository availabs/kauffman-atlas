import React from 'react'
import Radar from './Radar'

export class RadarChart extends React.Component<void, Props, void> {
  
  componentDidMount () {
    this._drawGraph(this.props)
  }

  componentWillReceiveProps (nextProps){
     this._drawGraph (nextProps)
  }

  _drawGraph (props) {
    //console.log('radarDest', props.data, props.options)
    Radar.draw('#'+this.props.divID, props.data, props.options)
  }

  render () {
    return (
      <div id={this.props.divID} >
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

export default RadarChart

