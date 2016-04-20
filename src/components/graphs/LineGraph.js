"use strict"
import React from 'react'
import d3 from 'd3'
import { connect } from 'react-redux'
import { loadDensityData } from 'redux/modules/densityData'
import topojson from 'topojson'
import classes from '../../components/maps/NationalMap.scss'


export class LineGraph extends React.Component<void, Props, void> {
  constructor () {
    super()
    this.state = {
      data:null
    }
    this._initGraph = this._initGraph.bind(this)
    this._drawGraph = this._drawGraph.bind(this)
  }

  componentDidMount (){
    this._initGraph()
  }
  
  componentWillReceiveProps (nextProps){
    if(this.props.loaded !== nextProps.loaded){
      this._drawGraph(nextProps);
    }
  }

  _drawGraph (props) {
    let width = document.getElementById("mapDiv").offsetWidth
    let height = width  * 0.4



    var x = d3.scale.linear()
        .domain([0,100])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0,100])
        .range([0,height]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    let svg = d3.select("#lineGraph svg")
      .attr('viewBox','0 0 ' + width + ' ' + height)

    svg.append("g")
      .attr("class", "x axis")
      .style("stroke","black")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .style("text-anchor", "end")
      .attr("dx","50em")
      .attr("dy","3em")
      .text("Year");

    svg.append("g")
      .attr("class", "y axis")
      .style("stroke","black")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", "-5em")
      .attr("dy", "2em")
      .attr("x","-15em")
      .style("text-anchor", "end"); 

  }

  _initGraph () {
    // if(!this.props.loaded){
    //   return this.props.loadData()
    // }
    this._drawGraph(this.props)

  }

  render () {

    return (
      <div id="lineGraph" className={classes['svg-container']}>
        <svg className={classes['.svg-content-responsive']} preserveAspectRatio='xMinYMin meet'/>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  // loaded : state.densityData.loaded,
  // data: state.densityData.data
})

export default connect((mapStateToProps), {
  // loadData: () => loadDensityData(),
})(LineGraph)