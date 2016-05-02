"use strict"
import React from 'react'
import d3 from 'd3'
import { connect } from 'react-redux'
import { loadNationalData } from 'redux/modules/geoData'
import topojson from 'topojson'
import classes from './NationalMap.scss'


export class NationalMap extends React.Component<void, Props, void> {
  constructor () {
    super()
    this.state = {
      statesGeo: null, 
      metrosGeo: null,
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
    let statesGeo = props.statesGeo
    let metrosGeo = props.metrosGeo
    let width = document.getElementById("mapDiv").offsetWidth
    let height = width  * 0.6

    var projection = d3.geo.albersUsa();

    var path = d3.geo.path()
      .projection(projection);

    projection
        .scale(1)
        .translate([0, 0]);

    var b = path.bounds(statesGeo),
        s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection
        .scale(s)
        .translate(t);

    let svg = d3.select("#mapDiv svg")
    .attr('viewBox','0 0 ' + width + ' ' + height)
    
    svg.selectAll(".state")
      .data(statesGeo.features)
      .enter().append('path')
      .attr('class',classes['state'])
      .attr("d", path);


    svg.selectAll(".msa")
      .data(metrosGeo.features)
      .enter().append('path')
      .attr("class",classes['msa'])
      .attr("id",function(d){return "msa"+d.id;})
      .attr("d", path)
      .on('click',props.click || null);
  }

  _initGraph () {
    if(!this.props.loaded){
      return this.props.loadData()
    }
    this._drawGraph(this.props)

  }

  render () {
    console.log(d3.select("#msa31080"))
    return (
      <div id="mapDiv" className={classes['svg-container']}>
        <svg className={classes['.svg-content-responsive']} preserveAspectRatio='xMinYMin meet'/>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  loaded : state.geoData.loaded,
  statesGeo : state.geoData.statesGeo,
  metrosGeo : state.geoData.metrosGeo
})

export default connect((mapStateToProps), {
  loadData: () => loadNationalData(),
})(NationalMap)