import React from 'react'
import d3 from 'd3'
import GraphSouce from './MultiLineGraphSource'
import _ from 'lodash'
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
        .margin({left: 0, right: 0, top: 10})
        // .mousemove(mousemove)
        // .mouseout(mouseout)
        // .click(this.changeMonth)
    }
      this. _resize = this. _resize.bind(this)
      this._mouseListener = this._mouseListener.bind(this)
  }

  componentDidMount () {
      if(this.props.yAxis){
	  this.state.graph.showY(true)
	  
	  this.state.graph.showGrid(true)
      }
      if(this.props.xAxis){
	  this.state.graph.showX(this.props.xAxis)
	  
      }
      if(this.props.margin)
	  this.state.graph.margin(this.props.margin)
      if(this.props.xFormat)
	  this.state.graph.xFormat(this.props.xFormat)
      if(this.props.yFormat)
	  this.state.graph.yFormat(this.props.yFormat)
      if(this.props.xScaleType)
	  this.state.graph.xScaleType(this.props.xScaleType)
      if(this.props.tooltip)
	  this.state.graph.mouseListener({ml:this._mouseListener})
    d3.select('#lineGraph' + this.props.uniq)
      .append('svg')
      .call(this.state.graph)

    this.state.graph
      .data(this.props.data)

      

    this.state.graph
      .size({
        width: document.getElementById('lineGraph' + this.props.uniq).offsetWidth,
        height: this.props.options && this.props.options.height || 215
      })()
    window.addEventListener('resize', this._resize)
  }

    _mouseListener (d,data) {
	console.log(d.point.x)
	
	let tableData = data.map(x => {
	    console.log(d.point.x)
	    let offset = x.values[0].key
	    return {key:x.key,value:x.values[d.point.x-offset].values.y || 0}
	})
	
  }
    
  componentWillUnmount () {
    window.removeEventListener('resize', this._resize)
  }

    componentWillReceiveProps (nProps) {
	console.log('MLG new PROPS',nProps)
	console.log(this.state.graph.data())
	if(!_.isEqual(this.state.graph.data(),nProps.data)){
	    this.state.graph.data(nProps.data)
	    this.state.graph
		.size({
		    width: document.getElementById('lineGraph' + this.props.uniq).offsetWidth,
		    height: this.props.options && this.props.options.height || 215
      })()
	}
    }
    
  _resize () {
    this.state.graph
      .size({
        width: document.getElementById('lineGraph' + this.props.uniq).offsetWidth,
        height: (this.props.options && this.props.options.height) || 215
      })()
  }

  render () {
      let title = this.props.title ? <h3>{this.props.title}</h3>:null;
      return (
	      <div>
	      {title}
	      <div id={'lineGraph' + this.props.uniq} />
	      <div id={'tooltip' + this.props.uniq}
	  style={{position:'absolute',overflow:'hidden'}}
	  />
	  </div>
    )
  }
}

LineGraph.propTypes = {
  data: React.PropTypes.array,
  uniq: React.PropTypes.string,
  xAxis: React.PropTypes.bool,
  margin: React.PropTypes.object,
	title: React.PropTypes.string,
	xFormat: React.PropTypes.func,
	yFormat: React.PropTypes.func,
	xScaleType: React.PropTypes.string,
	yAxis: React.PropTypes.bool
}

export default LineGraph
