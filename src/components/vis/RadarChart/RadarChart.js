import React from 'react'
import Radar from './Radar'
import _ from 'lodash'

export class RadarChart extends React.Component<void, Props, void> {
  
  componentDidMount () {
    this._drawGraph(this.props)
  }

  shouldComponentUpdate (nextProps) {
  
    let props = this.props

    if (_.isEqual(props.divID, nextProps.divID) && 
        _.isEqual(props.data, nextProps.data) && 
        _.isEqual(props.options, nextProps.options)) {

      return false
    }

    this._drawGraph (nextProps)
    return true
  }

  _drawGraph (props) {
    Radar.draw('#'+this.props.divID, props.data, props.options)
  }

  render () {
    return (
      <div id={this.props.divID} >
      </div>
    )
  }
}

export default RadarChart

