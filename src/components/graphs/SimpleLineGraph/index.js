import React from 'react'
import d3 from 'd3'
import GraphSource from './MultiLineGraphSource'
import _ from 'lodash'
import { connect } from 'react-redux'

// import styles from './Race.scss'

class LineGraph extends React.Component {
    constructor (props) {
	super()
	this.state = {
	    graph: GraphSource()
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
	if(this.props.hover)
		this.state.graph.mouseListener({ml:this.props.hover})
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

      //if (this.props.onMouse) {
        //this.props.onMouse(data.map(x => ({
          //key   : x.key,
          //value : onMouseSearcher(new Date(d.point.x).getTime(), x.values, 0, x.values.length),
          //color : x.color,
        //})))
      //}

      if (this.props.quarterChangeListener) {
        this.props.quarterChangeListener(d.point.x) 
      }
    }
    
    componentWillUnmount () {
	window.removeEventListener('resize', this._resize)
    }

    componentWillReceiveProps (nProps) {
	if(!_.isEqual(this.state.graph.data(),nProps.data)){
            if(nProps.yFormat) {
              this.state.graph.yFormat(nProps.yFormat)
            }
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
	        </div>
	)
    }
}


//function onMouseSearcher (xDateTime, lineDataArr, i, j) {
  //if (i === j) { return 0 }

  //let x = (i === j) ? i : (i + Math.floor((j-i)/2))

  //let point = lineDataArr[x]

  //let yDateTime = new Date(point.key).getTime()

  //if (xDateTime < yDateTime) {
    //return onMouseSearcher(xDateTime, lineDataArr, i, x)
  //} else if (xDateTime > yDateTime){
    //return onMouseSearcher(xDateTime, lineDataArr, x, j)
  //} else {
    //return point.values.y
  //}
//}



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
