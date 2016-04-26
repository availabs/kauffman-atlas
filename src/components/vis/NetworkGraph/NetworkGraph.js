import React from 'react'
import Network from './Network'

export class NetworkGraph extends React.Component<void, Props, void> {
  
  componentDidMount () {
    this._drawGraph(this.props)
  }

  componentWillReceiveProps (nextProps){
     this._drawGraph (nextProps)
  }

  _drawGraph (props) {
    //console.log('radarDest', props.data, props.options)
    let width = document.getElementById(this.props.divID).offsetWidth
    let height = width  * 0.6
    //connsole.
    Network.draw('#'+this.props.divID, props.data, {w:width,h:height})
  }

  render () {
    return (
      <div id={this.props.divID} >
      </div>
    )
  }
}

export default NetworkGraph

