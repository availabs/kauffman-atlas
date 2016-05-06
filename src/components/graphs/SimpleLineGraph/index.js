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
		if(this.props.xAxis)
				this.state.graph.showX(this.props.xAxis)
		if(this.props.margin)
			 this.state.graph.margin(this.props.margin)
		if(this.props.xFormat)
				this.state.graph.xFormat(this.props.xFormat)
		if(this.props.yFormat)
				this.state.graph.yFormat(this.props.yFormat)
		if(this.props.xScaleType)
				this.state.graph.xScaleType(this.props.xScaleType)
		
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
			let title = this.props.title ? <h3>{this.props.title}</h3>:null;
    return (
			<div>
			{title}
      <div id={'lineGraph' + this.props.uniq} />
			</div>
    )
  }
}

LineGraph.propTypes = {
  data: React.PropTypes.array,
  uniq: React.PropTypes.string,
  xAxis: React.PropTypes.bool,
  margin: React.PropTypes.number,
	title: React.PropTypes.string,
	xFormat: React.PropTypes.func,
	yFormat: React.PropTypes.func,
	xScaleType: React.PropTypes.func
}

export default LineGraph
