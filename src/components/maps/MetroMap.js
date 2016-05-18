"use strict"
import React from 'react'
import d3 from 'd3'
import { connect } from 'react-redux'
import { loadNationalData } from 'redux/modules/geoData'
import { loadMetroData } from 'redux/modules/metroZbpData'
import { loadMetroScores } from 'redux/modules/metroScoresData'
import topojson from 'topojson'
import classes from './NationalMap.scss'


export class MetroMap extends React.Component<void, Props, void> {
  constructor () {
    super()
    this.state = {
      metrosGeo: null,
      statesGeo:null,
      zbpData:null,
      metroScores:null
    }

    this._initGraph = this._initGraph.bind(this)
    this._drawGraph = this._drawGraph.bind(this)
  }

  componentWillReceiveProps (nextProps){
    if(this.props.mapLoaded !== nextProps.mapLoaded && this.props.zbpLoaded !== nextProps.zbpLoaded){
      this._drawGraph(nextProps);
    }
  }

  _drawGraph (props) {
    let metrosGeo = Object.assign({},props.metrosGeo);
    let statesGeo = Object.assign({},props.statesGeo);

    metrosGeo.features = metrosGeo.features.filter(d => {
      return d.id == props.currentMetro;
    })

    statesGeo.features = statesGeo.features.filter(d => {
      var match = false;
      props.metroScores[props.currentMetro].stateName.forEach(stateName => {
        if(d.properties.NAME == stateName){
          match = true;
        }
      }) 
      return match;
    })


    let width = document.getElementById("mapDiv").offsetWidth //? document.getElementById("mapDiv").offsetWidth : 200
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
      .attr("class",'msa '+classes['singleMsa'])
      .attr("id",function(d){return "msa"+d.id;})
      .attr("d", path)
      .on('click',props.click || null);


  }

  componentDidMount () {
    this._initGraph();
  }

  _initGraph () {

    if(!this.props.mapLoaded){
      return this.props.loadData()
    }
    if(!this.props.zbpData){
      return this.props.loadZbpData(this.props.currentMetro)
    }

    this._drawGraph(this.props)
  }

  render () {
    return (
      <div id="mapDiv" className={classes['svg-container']}>
        <svg className={classes['.svg-content-responsive']} preserveAspectRatio='xMinYMin meet'/>
      </div>
    )
  }
  
}

const mapStateToProps = (state) => {
  
  return ({
    metroScores : state.metroScoresData,
    mapLoaded : state.geoData.loaded,
    statesGeo : state.geoData.statesGeo,
    metrosGeo : state.geoData.metrosGeo,
    zbpData : state.metroZbpData
  })
}

export default connect((mapStateToProps), {
  loadData: () => loadNationalData(),
  loadZbpData: (currentMetro) => loadMetroData(currentMetro),
  loadMetroScores: (currentMetro) => loadMetroScores (currentMetro)  
})(MetroMap)

