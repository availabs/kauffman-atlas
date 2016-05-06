import React from 'react'
import d3 from 'd3'
import GraphSouce from './MultiLineGraphSource'

// import styles from './Race.scss'

class LineGraph extends React.Component {
  constructor (props) {
    super()
    this.state = {
      graph: GraphSouce()
        .xScaleType('ordinal')
        .tickPadding(0.5)
        .showY(false)
        .showGrid(false)

        //.xTickSize(1, 0)
        //.yTickSize(3, 0)
        //.yFormat(d => d + '%')
        .margin({left: 0, right: 0, top:10}),
        // .mousemove(mousemove)
        // .mouseout(mouseout)
        // .click(this.changeMonth)
    }
    this. _resize = this. _resize.bind(this)
  }

  componentDidMount () {
    d3.select('#lineGraph' + this.props.uniq)
      .append('svg')
      .call(this.state.graph)

    this.state.graph
      .data(this.props.data)



    this.state.graph
      .size({
        width: document.getElementById('lineGraph' + this.props.uniq).offsetWidth,
        height: this.props.options.height || 215
      })()
    window.addEventListener('resize', this._resize)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this._resize)
  }

  _resize () {
    this.state.graph
      .size({
        width: document.getElementById('lineGraph' + this.props.uniq).offsetWidth,
        height: this.props.options.height || 215
      })()
  }

  render () {
    return (
      <div id={'lineGraph' + this.props.uniq} />
    )
  }
}

LineGraph.propTypes = {
  data: React.PropTypes.array,
  uniq: React.PropTypes.string
}

export default LineGraph
