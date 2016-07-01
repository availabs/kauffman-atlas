//* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import classes from 'components/maps/NationalMap.scss'
import d3 from 'd3'
import { loadDensityComposite,loadNewValues,loadShare,loadShareEmpNoAccRet,loadShareEmpHighTech, } from 'redux/modules/densityData'    
import { loadFluidityComposite,loadInc5000Data, loadNetMigrationIrs, loadTotalMigration,loadAnnualChurn } from 'redux/modules/fluidityData'    
import { loadDiversityComposite,loadOpportunityData,loadForeignBornData,loadEmpVarianceData } from 'redux/modules/diversityData'    
import { loadCombinedComposite } from 'redux/modules/combinedData'
let roundFormat = d3.format(".1f")

export class MapGraphLegend extends React.Component<void, Props, void> {
  constructor () {
    super()

    this.state = {
      height:0,
      width:0
    }

    this._drawLegend = this._drawLegend.bind(this)
  }
 

  //We would only want to change the colors after a props change
  //Changing the color does NOT trigger a render(_drawLegend)
  componentWillReceiveProps (nextProps){
    //Load data about the active componsent if it is not present
    if(!nextProps[(nextProps.activeComponent)]){
      console.log("loading active", nextProps.activeComponent);
      nextProps[('get'+nextProps.activeComponent)]()  
    }

  }

  componentDidMount (){
    let width = document.getElementById("mapDiv").offsetWidth
    let height = width  * 0.075

    //Triggers render(_drawLegend)
    this.setState({width:width,height:height})          
  }

  //Returning true triggers render(_drawLegend)
  shouldComponentUpdate(nextProps,nextState){
    //If there are no drawn metro areas, we need to update the map

    if(d3.selectAll(".legend")[0].length == 0){
      return true
    }
    else if (this.props.mapGraph !== nextProps.mapGraph){
      return true
    }
    else if (this.props.activeColor !== nextProps.activeColor){
      return true
    }
    else if(this.props.activeComponent === nextProps.activeComponent){
      return false;             
    }
    else{
      return true;
    }
  }

  _drawLegend (props) {
    d3.selectAll(".legend").remove()
    var svg = d3.select("#legend svg")
      .attr('viewBox','-90 -20 ' + (this.state.width) + ' ' + (this.state.height))

    var valueArray = [];

    if(!Array.isArray(props[(props.activeComponent)])){
      var data = props[(props.activeComponent)]['relative']
    }
    else{
      var data = props[(props.activeComponent)]
    }

    data.forEach(metro => {
      metro.values.forEach(yearValue => {
        if(yearValue.x == 2013 || (props.activeComponent=="diversityincomebasedonchildhood" && yearValue.x =="combined")){
          valueArray.push(yearValue.y)           
        }
      })
    })


    if(this.props.activeColor == "ranks"){
      var colorDomain = valueArray;
      var colorRange = ["#996b25", "#c58a30", "#dea44a", "#e2ae5e", "#b1bbcf", "#97a5bf", "#7d8faf", "#64728c", "#3e4757"]    
    }
    else{
      var colorDomain = d3.range(d3.min(valueArray),d3.max(valueArray),((d3.max(valueArray)-d3.min(valueArray))/9))
      var colorRange = ["#996b25", "#c58a30", "#dea44a", "#e2ae5e", "#b1bbcf", "#97a5bf", "#7d8faf", "#64728c", "#3e4757"]        
    }



    var color = d3.scale.quantile()
      .domain(colorDomain)
      .range((colorRange).reverse()) 

  


    let legend = svg.append("g")
      .attr("transform", "translate(" + -40 + "," + 0 + ")")
      .attr("class", "legend")
      .append('g')
    
    legend
      .append('text')
      .attr("dx", 0)
      .attr("dy", ".35em")
      .text( 'Value')


    let legendCells = legend
      .selectAll('.legendCells')
      .data(color.quantiles())
      .enter()
      
    legendCells
      .append('rect')
      .attr("height", 15)
      .attr("width", 30)
      .attr("transform", function(d,i) {return "translate(" + (i * 30) + ",24)" })
      .attr('fill', function(d) {return color(d)} )
      .on('mouseover',this.props.legendHover.bind(null,color))
      .on('mouseout',this.props.legendHoverOut)
      
    legendCells
      .append('text')
      .attr("transform", function(d,i) {return "translate(" + (i * 30) + ",16)" })
      .attr("dx", 4)
      .attr("dy", ".35em")
      .style('font-size', '10px')
      .text(function(d) {
        return roundFormat(d);
      })
      .on('mouseover',this.props.legendHover.bind(null,color))
      .on('mouseout',this.props.legendHoverOut)
  }


  render () {
    console.log("mapgraphlegend render");

    if(!this.props[(this.props.activeComponent)]){
      return <span/>
    }
    else{
      this._drawLegend(this.props);
    }
    return (
      <div className={classes['svg-container']} id="legend">
        <svg className={classes['.svg-content-responsive']} preserveAspectRatio='xMinYMin meet'/>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
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
  diversitypercentageofforeignbornpopulation:state.diversityData.foreignborn,
  diversityemploymentlocationquotientvariance:state.diversityData.empVariance,
  combinedcomposite : state.combinedData.combinedcomposite,
  metros : state.metros,
})

export default connect((mapStateToProps), {
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
  getdiversitypercentageofforeignbornpopulation: () => loadForeignBornData(),
  getdiversityemploymentlocationquotientvariance: () => loadEmpVarianceData(),
  getcombinedcomposite: () => loadCombinedComposite(),
  changeHomeState: (state) => changeHomeState(state)
})(MapGraphLegend)
  








