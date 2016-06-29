"use strict"
import React from 'react'
import d3 from 'd3'
import { connect } from 'react-redux'
import { loadNationalData } from 'redux/modules/geoData'
import { loadDensityComposite,loadNewValues,loadShare,loadShareEmpNoAccRet,loadShareEmpHighTech, } from 'redux/modules/densityData'   
import { loadFluidityComposite,loadInc5000Data, loadNetMigrationIrs, loadTotalMigration,loadAnnualChurn } from 'redux/modules/fluidityData'    
import { loadDiversityComposite,loadOpportunityData,loadForeignBornData,loadEmpVarianceData } from 'redux/modules/diversityData'    
import { loadCombinedComposite } from 'redux/modules/combinedData'
import topojson from 'topojson'
import classes from './NationalMap.scss'
import { withRouter } from 'react-router'
let roundFormat = d3.format(".2f")

export class NationalMap extends React.Component<void, Props, void> {

  constructor () {
    super()

    this.state = {
      statesGeo: null, 
      metrosGeo: null,
      height:0,
      width:0
    }

    this._initGraph = this._initGraph.bind(this)
    this._drawGraph = this._drawGraph.bind(this)
    this._drawMetros = this._drawMetros.bind(this)
    this._msaClick = this._msaClick.bind(this)
    this._mouseout = this._mouseout.bind(this)
    this._mouseover = this._mouseover.bind(this)
    this._legendColor = this._legendColor.bind(this)
  }

  _initGraph () {
    //Load map data if it is not present
    if(!this.props.loaded){
      return this.props.loadData()
    }
    //Load data about the active componsent if it is not present
    if(!this.props[(this.props.activeComponent)]){
      console.log("loading active", this.props.activeComponent);
      return this.props[('get'+this.props.activeComponent)]()
    }
    //If we already have metros drawn, we only want to redraw the metros
    if(d3.selectAll("."+classes['msa'])[0].length > 0){
      this._drawMetros(this.props);       
    }
    //All other cases result in drawing the whole map
    else{
      this._drawGraph(this.props)      
    }
  }

  componentDidMount (){
    let width = document.getElementById("mapDiv").offsetWidth
    let height = width  * 0.6

    //Triggers render(_initGraph)
    this.setState({width:width,height:height})          
  }

  //Returning true triggers render(_initGraph)
  shouldComponentUpdate(nextProps,nextState){
    //If there are no drawn metro areas, we need to update the map
    if(d3.selectAll("."+classes['msa'])[0].length == 0){
      return true
    }
    if(!nextProps[(nextProps.activeComponent)]){
      console.log("should comp update getting active")
      return true;
    }
    //Case to remedy issue on graph pages -- which dont have a list of metros
    else if(!this.props.metros){
      return false
    }
    //If both metro lists are the same length, it is possible they are the same.
    else if(this.props.metros.length == nextProps.metros.length){
      //Check to see if they are
      for(var i=0; i<this.props.metros.length; i++){
        if(this.props.metros[i] != nextProps.metros[i]){
          return true;
        }
      }
      //If we never find a mismatch, the list of metros is the same, we don't need to redraw anything.
      return false; 
    }
    //If the length of the metro lists are not the same, we know we need to update the map
    else{
      return true;
    }
  }

  //We would only want to change the colors after a props change
  //Changing the color does NOT trigger a render(_initGraph)
  componentWillReceiveProps (nextProps){
    //Load data about the active componsent if it is not present
    if(!nextProps[(nextProps.activeComponent)]){
      console.log("loading active", nextProps.activeComponent);
      nextProps[('get'+nextProps.activeComponent)]()
    }
    if(this.props.activeComponent !== nextProps.activeComponent || this.props.activeColor !== nextProps.activeColor){
      if(nextProps.loaded){
        this._colorMetros(nextProps);        
      }      
    }
    if(this.props.legendHover !== nextProps.legendHover){
      if(nextProps.loaded){
        this._legendColor(nextProps);        
      }      
    }
  }


  _legendColor(props){
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? "rgb("+(parseInt(result[1], 16))+", "+(parseInt(result[2], 16))+", "+parseInt(result[3], 16)+")" : null
    }
    function shadeRGBColor(color, percent) {
        var f=color.split(","),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=parseInt(f[0].slice(4)),G=parseInt(f[1]),B=parseInt(f[2]);
        return "rgb("+(Math.round((t-R)*p)+R)+","+(Math.round((t-G)*p)+G)+","+(Math.round((t-B)*p)+B)+")";
    }                            


    var scope = this;

    if(!Array.isArray(props[(props.activeComponent)])){
      var data = props[(props.activeComponent)]['relative']
    }
    else{
      var data = props[(props.activeComponent)]
    }

    d3.selectAll("."+classes['msa'])[0].forEach(metro => {
      if(metro.style.fill == hexToRgb(props.legendHover)){   
        metro.style.fill = shadeRGBColor(hexToRgb(props.legendHover),-.3)  
      }
      else{
        data.forEach(metroArea => {
          if(metroArea.key == metro.id.substring(3)){
            if(props.activeColor == "ranks"){
              metro.style.fill = metroArea.color;              
            }
            else{
              metro.style.fill = metroArea.scoreColor;  
            }
          }
        })
      }
    })
  }

  _colorMetros(props){
    console.log("color nat map",props)

    if(!Array.isArray(props[(props.activeComponent)])){
      var data = props[(props.activeComponent)]['relative']
    }
    else{
      var data = props[(props.activeComponent)]
    }

    d3.selectAll("."+classes['msa'])
      .style("fill",function(d){   
        var color = "chartreuse"  
        data.forEach(metroArea => {
          if(metroArea.key == d.id){
            if(props.activeColor == "ranks"){
              color = metroArea.color;              
            }
            else{
              color = metroArea.scoreColor;  
            }
          }
        })
        return color;
      })
  }

  _drawMetros (props) {
    console.log("draw metro nat map")
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
    let width = this.state.width;
    let height = this.state.height;


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

    let svg = d3.select("#map svg")
      .attr('viewBox','0 0 ' + width + ' ' + height)

    //Remove all of the old metros
    d3.selectAll("."+classes['msa']).remove()

    if(!Array.isArray(props[(props.activeComponent)])){
      var data = props[(props.activeComponent)]['relative']
    }
    else{
      var data = props[(props.activeComponent)]
    }
    svg.selectAll(".msa")
      .data(metrosGeo.features)
      .enter().append('path')
      .attr("class",classes['msa'])
      .attr("d", path)
      .style("fill",function(d){   
        var color = "chartreuse"  
        data.forEach(metroArea => {
          if(metroArea.key == d.id){
            if(props.activeColor == "ranks"){
              color = metroArea.color;              
            }
            else{
              color = metroArea.scoreColor;  
            }
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
    console.log("drawgraph nat map")
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


    let width = this.state.width;
    let height = this.state.height;

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

    d3.selectAll("."+classes['msa']).remove()

    let svg = d3.select("#map svg")
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

    var data;

    if(!Array.isArray(props[(props.activeComponent)])){
      data = props[(props.activeComponent)]['relative']
    }
    else{
      data = props[(props.activeComponent)]
    }

    svg.selectAll(".msa")
      .data(metrosGeo.features)
      .enter().append('path')
      .attr("class",classes['msa'])
      .attr("d", path)
      .style("fill",function(d){   
        var color = "chartreuse"  
        data.forEach(metroArea => {
          if(metroArea.key == d.id){
            if(props.activeColor == "ranks"){
              color = metroArea.color;              
            }
            else{
              color = metroArea.scoreColor;  
            }
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
    this.context.router.push('/metro/'+d.id+'/combined');   
  }

  _mouseout (d){
    var scope = this;

    var focus = d3.select(".focus")                             
    focus.attr("transform", "translate(-100,-100)");

    var oldColor = d3.select(d.shape).style("fill")

    if(!Array.isArray(this.props[(this.props.activeComponent)])){
      var data = this.props[(this.props.activeComponent)]['relative']
    }
    else{
      var data = this.props[(this.props.activeComponent)]
    }

    d3.select(d.shape).style("fill",function(d){   
      var color = "chartreuse"  
      data.forEach(metroArea => {
        if(metroArea.key == d.id){
          if(scope.props.activeColor == "ranks"){
            color = metroArea.color;              
          }
          else{
            color = metroArea.scoreColor;  
          }
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

    this.props.onMouseover.bind(d);
    this.props.onMouseover(d)

    var oldColor = d3.select(d.shape).style("fill")
    d3.select(d.shape).style("fill",shadeRGBColor(oldColor,-.2))

    var popText = d.properties.NAME 

    var focus = d3.select(".focus") 
    focus.attr("transform", "translate(50,0)");
    focus.select("text").text(popText);
  }

  render () {
    this._initGraph()
    return (
      <div className={classes['svg-container']} id="map">
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
  densitynewfirms:state.densityData.newValuesData,
  densityshareofemploymentinnewfirms:state.densityData.shareData,
  densityshareEmpNoAccRet:state.densityData.shareEmpNoAccRet,
  densityshareEmpHighTech:state.densityData.shareEmpHighTech,
  fluiditycomposite:state.fluidityData.compositeData,   
  fluidityhighgrowthfirms:state.fluidityData.inc5000,
  fluiditynetmigration:state.fluidityData.irsNet,
  fluiditytotalmigration:state.fluidityData.totalMigrationFlow,
  fluidityannualchurn:state.fluidityData.annualChurn,
  diversitycomposite : state.diversityData.diversitycomposite,    
  diversityincomebasedonchildhood:state.diversityData.opportunity,
  diversitypercentageofforiegnbornpopulation:state.diversityData.foreignborn,
  diversityemploymentlocationquotientvariance:state.diversityData.empVariance,
  combinedcomposite : state.combinedData.combinedcomposite,
})

export default connect((mapStateToProps), {
  loadData: () => loadNationalData(),
  getdensitycomposite: () => loadDensityComposite(),
  getdensitynewfirms: () => loadNewValues(),
  getdensityshareofemploymentinnewfirms: () => loadShare(),  
  getdensityshareEmpNoAccRet: () => loadShareEmpNoAccRet(),
  getdensityshareEmpHighTech: () => loadShareEmpHighTech(),     
  getfluiditycomposite: () => loadFluidityComposite(),    
  getfluidityhighgrowthfirms: () => loadInc5000Data(),
  getfluiditynetmigration: () => loadNetMigrationIrs(),
  getfluiditytotalmigration: () => loadTotalMigration(),
  getfluidityannualchurn:() => loadAnnualChurn(),
  getdiversitycomposite: () => loadDiversityComposite(),    
  getdiversityincomebasedonchildhood: () => loadOpportunityData(),
  getdiversitypercentageofforiegnbornpopulation: () => loadForeignBornData(),
  getdiversityemploymentlocationquotientvariance: () => loadEmpVarianceData(),
  getcombinedcomposite: () => loadCombinedComposite(),
  changeHomeState: (state) => changeHomeState(state)
})(NationalMap)