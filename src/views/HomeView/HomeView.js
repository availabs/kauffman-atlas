//* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { browserHistory } from 'react-router'
import classes from 'styles/sitewide/index.scss'
import mapClasses from 'components/maps/NationalMap.scss'
import d3 from 'd3'
import NationalMap from 'components/maps/NationalMap'
import RankBox from 'components/ranks/RankBox'
import PopBuckets from 'components/ranks/PopBuckets'
import ComponentButtons from 'components/ranks/ComponentButtons'
import MapGraphButtons from 'components/ranks/MapGraphButtons'
import ColorButtons from 'components/ranks/ColorButtons'
import SubGraphButtons from 'components/ranks/SubGraphButtons'
import LineGraph from 'components/graphs/LineGraph.js'
import BarChart from 'components/graphs/BarChart.js'
import HoverBox from 'components/ranks/HoverBox'
import MapGraphLegend from 'components/ranks/MapGraphLegend'
import { loadDensityComposite,loadNewValues,loadShare,loadShareEmpNoAccRet,loadShareEmpHighTech, } from 'redux/modules/densityData'   
import { loadFluidityComposite,loadInc5000Data, loadNetMigrationIrs, loadTotalMigration,loadAnnualChurn } from 'redux/modules/fluidityData'    
import { loadDiversityComposite,loadOpportunityData,loadForeignBornData,loadEmpVarianceData } from 'redux/modules/diversityData'    
import { loadCombinedComposite } from 'redux/modules/combinedData'
import { changeHomeState } from 'redux/modules/homeData'
import CategoryText from 'components/misc/categoryText'
let roundFormat = d3.format(".2f")

export class HomeView extends React.Component<void, Props, void> {
   constructor () {
    super()

    this.state = {
      legendHoverColor:null
    }

    this._isActive = this._isActive.bind(this)
    this._linkIsActive = this._linkIsActive.bind(this)
    this._setActiveComponent = this._setActiveComponent.bind(this)
    this._setActiveBucket = this._setActiveBucket.bind(this)
    this._setMapGraph = this._setMapGraph.bind(this)
    this._setMetric = this._setMetric.bind(this)
    this.onMouseover = this.onMouseover.bind(this)
    this.legendHover = this.legendHover.bind(this)
    this.legendHoverOut = this.legendHoverOut.bind(this)
    this._setActiveColor = this._setActiveColor.bind(this)
  }
  componentWillMount () {    
    this._initGraph();    
  }   
  

  _initGraph () {   
    if(!this.props['densitycomposite']){    
      this.props['getdensitycomposite']()   
    }   
    if(!this.props['fluiditycomposite']){   
      this.props['getfluiditycomposite']()    
    }   
    if(!this.props['diversitycomposite']){    
      this.props['getdiversitycomposite']()   
    }   
    if(!this.props['combinedcomposite']){   
      this.props['getcombinedcomposite']()            
    }           
  }

  _setActiveComponent (type) {
    if(type == "qwiDensity"){
      this.props.changeHomeState({activeComponent:type,metric:"shareEmpAll"})      
    }else{
      this.props.changeHomeState({activeComponent:type,metric:"composite"})      
    }

  }

  _setMapGraph (type) {
    if(type == 'map'){
      this.props.changeHomeState({activeMapGraph:type,hoverYear:2013})
    }
    else{
      this.props.changeHomeState({activeMapGraph:type})      
    }

  }

  _setMetric (type) {
    this.props.changeHomeState({metric:type})
  }


  _setActiveBucket (bucket) {
    this.props.changeHomeState({'bucket':bucket});
  }   
  _setActiveColor (color) {
    this.props.changeHomeState({'activeColor':color});
  }   

  _isActive(type){
    return type === this.props.homeState.activeComponent ? classes['active'] : ''
  }

  _linkIsActive(type){
    return type === this.props.homeState.activeComponent ? classes['active-link'] : ''
  }

  onMouseover(feature){
    let curFeature = feature.city ? feature.city.key : feature.id  

    this.props.changeHomeState({
      hoverMetro: curFeature,
      hoverYear: feature.year
    })
  }

  legendHover(quantileColorScale,curQuantile){
    this.setState({legendHoverColor:quantileColorScale(curQuantile)})

  }
  legendHoverOut(){
    this.setState({legendHoverColor:null})
  }

  renderMapGraph (metrosInBucket) {
    if(!this.props[this.props.homeState.activeComponent + (this.props.homeState.metric).replace(/ /g,'')]){
      this.props["get" + this.props.homeState.activeComponent + (this.props.homeState.metric).replace(/ /g,'')]()
      return <span />
    }
    if(this.props.homeState.activeMapGraph === 'map'){
      return (
        <NationalMap 
          metros={metrosInBucket} 
          activeColor={this.props.homeState.activeColor}
          activeComponent={this.props.homeState.activeComponent + (this.props.homeState.metric).replace(/ /g,'')}
          onMouseover={this.onMouseover}
          legendHover={this.state.legendHoverColor}
        />
      )
    }else if((this.props.homeState.metric).replace(/ /g,'') === 'incomebasedonchildhood'){
      return (
       <BarChart    
          metros={metrosInBucket} 
          data={this.props[this.props.homeState.activeComponent + (this.props.homeState.metric).replace(/ /g,'')]} 
          plot="value" dataType="composite" title={this.props.homeState.activeComponent + (this.props.homeState.metric).replace(/ /g,'')} 
          graph="opportunitycomposite"
          onMouseover={this.onMouseover}
        />
      )
    }else {
      return (
        <LineGraph    
          metros={metrosInBucket} 
          activeColor={this.props.homeState.activeColor}
          data={this.props[this.props.homeState.activeComponent + (this.props.homeState.metric).replace(/ /g,'')]} 
          plot="value" dataType="relative" title={this.props.homeState.activeComponent + (this.props.homeState.metric).replace(/ /g,'')} 
          graph={this.props.homeState.activeComponent + "composite"}
          onMouseover={this.onMouseover}
        />
      )
    }
  }

  render () {
    var popDomain = Object.keys(this.props.metros).reduce((popDomain,msaId) => {
      if(this.props.metros[msaId].pop){
        if(this.props.metros[msaId].pop[2014]){
          popDomain.push(this.props.metros[msaId].pop[2014]);          
        }
      }
      return popDomain;
    },[])

    var popScale = d3.scale.quantile()
        .domain(popDomain)
        .range([0,1,2,3])

    var metrosInBucket = Object.keys(this.props.metros).filter(msaId => {
      return (
          this.props.homeState.bucket === 'all' ||
        (
          this.props.metros[msaId] && 
          this.props.metros[msaId].pop && 
          this.props.metros[msaId].pop[2014] && 
          popScale(this.props.metros[msaId].pop[2014]) == this.props.homeState.bucket
        )
      )
    })

    return (
      <div> 
        <div className='container'>
           <div className='row'>
            <div className={'col-xs-12 ' + classes['text-div']}>
              <strong>{this.props.homeState.activeComponent.toUpperCase()}</strong> {CategoryText[this.props.homeState.activeComponent].map(d => { return (<p>{d} </p>)})}
            </div>
          </div>
          <div className='row' style={{padding:15}} >
            <ComponentButtons
              onComponentChange={this._setActiveComponent} 
              activeComponent={this.props.homeState.activeComponent}
            />
            <PopBuckets 
              popScale={popScale} 
              onBucketChange={this._setActiveBucket} 
              bucket={this.props.homeState.bucket}
            />
          </div>
        </div>
        <div className='container'>
          <div className='row'>
            <div className='col-md-3' style={{padding:15}}>
              <RankBox 
                activeComponent={this.props.homeState.activeComponent} 
                popScale={popScale}
                bucket={this.props.homeState.bucket}
                year={this.props.homeState.hoverYear}
              />
              <HoverBox metroId={this.props.homeState.hoverMetro} year={this.props.homeState.hoverYear} activeComponent={this.props.homeState.activeComponent} />
            </div>
            <div id="mapDiv" className='col-md-9' >

                <div className='col-md-9' style={{padding:20}}>
                  <SubGraphButtons
                    metric={this.props.homeState.metric}
                    onComponentChange={this._setMetric} 
                    activeComponent={this.props.homeState.activeComponent}
                  />
                </div>
                <MapGraphButtons
                  mapGraph={this.props.homeState.activeMapGraph}
                  onComponentChange={this._setMapGraph} 
                />
                <ColorButtons
                  colorButton={this.props.homeState.activeColor}
                  onComponentChange={this._setActiveColor} 
                />
                <MapGraphLegend 
                  mapGraph={this.props.homeState.activeMapGraph}
                  activeColor={this.props.homeState.activeColor}
                  activeComponent={(this.props.homeState.activeComponent + "" + this.props.homeState.metric).replace(/ /g,'')}            
                  legendHover={this.legendHover}
                  legendHoverOut={this.legendHoverOut}
                />  

              {this.renderMapGraph(metrosInBucket)}       
            </div>
          </div>
        </div>
        <div className='container-fluid' style={{backgroundColor: 'rgb(125, 143, 175)', color:'#f5f5f5'}}>
          <div className='container'>
            <div className='row'>
              <div className={'col-xs-12 ' + classes['text-div']}>
                <p>The <strong>  Entrepreneurial Ecosystem Atlas </strong>  is a set of interactive tools designed to provide a visual understanding of the economic indicators of entrepreneurial ecosystems in the United States.  The Entrepreneurial Ecosystems Index combines a dozen different indicators to rank metropolitan statistical areas (MSAs) across the nation. The index is broken down into three major categories: Density, Diversity and Fluidity. </p>
                <p>In defining Density, Diversity and Fluidity we’ve taken guidance from a report by Dane Stangler and Jordan Bell-Masterson, and published by the Kauffman Foundation, entitled “Measuring an Entrepreneurial Ecosystem.”</p>
                <p>This page begins with a view of the overall index, the Entrepreneurial Ecosystem Index (EEI). You can toggle between the EEI, Density, Diversity and Fluidity. Additionally you can toggle between viewing the data in the form of a map or a graph and you can filter the visualizations by population.</p>
                <p>Clicking on a metropolitan area will take you to a page full of additional analytics and visualizations for that metropolitan area.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
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
  metros : state.metros,
  homeState : state.homeData
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
  getdiversitypercentageofforiegnbornpopulation: () => loadForeignBornData(),
  getdiversityemploymentlocationquotientvariance: () => loadEmpVarianceData(),
  getcombinedcomposite: () => loadCombinedComposite(),
  changeHomeState: (state) => changeHomeState(state)
})(HomeView)
