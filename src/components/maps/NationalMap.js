"use strict"
import React from 'react'
import d3 from 'd3'
import { connect } from 'react-redux'
import { loadNationalData } from 'redux/modules/geoData'
import topojson from 'topojson'
import classes from './NationalMap.scss'
import { withRouter } from 'react-router'


export class NationalMap extends React.Component<void, Props, void> {

  constructor () {
    super()

    this.state = {
      statesGeo: null, 
      metrosGeo: null,
    }
    this._initGraph = this._initGraph.bind(this)
    this._drawGraph = this._drawGraph.bind(this)
    this._msaClick = this._msaClick.bind(this)
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

    //Focus is the hover popup text
    var focus = svg.append("g")
          .attr("transform", "translate(-100,-100)")
          .attr("class", "focus");

    focus.append("text")
      .attr("y", 10)
      .style("font-size",".75em");
    
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
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .on('click',this._msaClick);

    function mouseover(d) {
        var popText = "",
            name;

        name = d.properties.NAME;
   
        popText += name 

        focus.attr("transform", "translate(50,0)");
        focus.select("text").text(popText);
    }

    function mouseout(d) {                              
        focus.attr("transform", "translate(-100,-100)");
    }

  }

   _msaClick (d) {
      console.log(d.id);
      this.context.router.push('/metro/'+d.id);   
  }


  _initGraph () {
    if(!this.props.loaded){
      return this.props.loadData()
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

NationalMap.contextTypes = {
  router: React.PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  loaded : state.geoData.loaded,
  statesGeo : state.geoData.statesGeo,
  metrosGeo : state.geoData.metrosGeo
})

export default connect((mapStateToProps), {
  loadData: () => loadNationalData(),
})(NationalMap)