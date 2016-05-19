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
    this._drawMetros = this._drawMetros.bind(this)
    this._msaClick = this._msaClick.bind(this)
    this._mouseout = this._mouseout.bind(this)
  }

  componentDidMount (){
    this._initGraph()
  }
  
  componentWillReceiveProps (nextProps){
    if(this.props.loaded !== nextProps.loaded){
      this._drawGraph(nextProps);
    }
    if(this.props.metros !== nextProps.metros && this.props.activeComponent === nextProps.activeComponent){
      if(nextProps.loaded){
        this._drawMetros(nextProps);        
      }
    }
    if(this.props.activeComponent !== nextProps.activeComponent){
      if(nextProps.loaded){
        this._colorMetros(nextProps);        
      }      
    }
  }

  _colorMetros(props){
    d3.selectAll("."+classes['msa'])
      .style("fill",function(d){   
        var color = "chartreuse"  
        props[(props.activeComponent+"composite")].forEach(metroArea => {
          if(metroArea.key == d.id){
            color = metroArea.color;
          }
        })
        return color;
      })
  }

  _drawMetros (props) {
    let statesGeo = props.statesGeo
    let metrosGeo = Object.assign({},props.metrosGeo);

    metrosGeo.features = metrosGeo.features.filter(d => {
      var inBucket = false;
      props.metros.forEach(msaId => {
        if(d.id == msaId){
          inBucket = true;
        } 
      })
      return inBucket;
    })      

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

    //Remove all of the old metros
    d3.selectAll("."+classes['msa']).remove()

    svg.selectAll(".msa")
      .data(metrosGeo.features)
      .enter().append('path')
      .attr("class",classes['msa'])
      .attr("d", path)
      .style("fill",function(d){   
        var color = "chartreuse"  
        props[(props.activeComponent+"composite")].forEach(metroArea => {
          if(metroArea.key == d.id){
            color = metroArea.color;
          }
        })
        return color;
      })
      .attr("id",function(d){d.shape =this; return "msa"+d.id;})
      .on("mouseover", this._mouseover)
      .on("mouseout", this._mouseout)
      .on('click',this._msaClick);
  }

  _drawGraph (props) {
    let statesGeo = props.statesGeo
    let metrosGeo = Object.assign({},props.metrosGeo);

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
      .attr("d", path)
      .style("fill",function(d){   
        var color = "chartreuse"  
        props[(props.activeComponent+"composite")].forEach(metroArea => {
          if(metroArea.key == d.id){
            color = metroArea.color;
          }
        })
        return color;
      })
      .attr("id",function(d){d.shape =this; return "msa"+d.id;})
      .on("mouseover", this._mouseover)
      .on("mouseout", this._mouseout)
      .on('click',this._msaClick);
  }

  _msaClick (d) {
    console.log(d.id);
    this.context.router.push('/metro/'+d.id);   
  }

  _mouseout (d){
    var scope = this;

    var focus = d3.select(".focus")                             
    focus.attr("transform", "translate(-100,-100)");

    var oldColor = d3.select(d.shape).style("fill")

    d3.select(d.shape).style("fill",function(d){   
      var color = "chartreuse"  
      scope.props[(scope.props.activeComponent+"composite")].forEach(metroArea => {
        if(metroArea.key == d.id){
          color = metroArea.color;
        }
      })
      return color;
    })    
  }

  _mouseover (d) {
    function shadeRGBColor(color, percent) {
        var f=color.split(","),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=parseInt(f[0].slice(4)),G=parseInt(f[1]),B=parseInt(f[2]);
        return "rgb("+(Math.round((t-R)*p)+R)+","+(Math.round((t-G)*p)+G)+","+(Math.round((t-B)*p)+B)+")";
    }                            

    var oldColor = d3.select(d.shape).style("fill")
    d3.select(d.shape).style("fill",shadeRGBColor(oldColor,-.2))

    var popText = d.properties.NAME 

    var focus = d3.select(".focus") 
    focus.attr("transform", "translate(50,0)");
    focus.select("text").text(popText);
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
  metrosGeo : state.geoData.metrosGeo,
  densitycomposite:state.densityData.compositeData,
  fluiditycomposite:state.fluidityData.compositeData,
  diversitycomposite : state.diversityData.diversitycomposite,
  combinedcomposite : state.combinedData.combinedcomposite
})

export default connect((mapStateToProps), {
  loadData: () => loadNationalData(),
})(NationalMap)