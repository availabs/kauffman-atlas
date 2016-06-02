/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import classes from 'styles/sitewide/index.scss'
import d3 from 'd3'
import NationalMap from 'components/maps/NationalMap'
import RankBox from 'components/ranks/RankBox'
import PopBuckets from 'components/ranks/PopBuckets'
import ComponentButtons from 'components/ranks/ComponentButtons'
import MapGraphButtons from 'components/ranks/MapGraphButtons'
import SubGraphButtons from 'components/ranks/SubGraphButtons'
import LineGraph from '../../components/graphs/LineGraph.js'
import { loadDensityComposite } from 'redux/modules/densityData'   
import { loadFluidityComposite } from 'redux/modules/fluidityData'    
import { loadDiversityComposite } from 'redux/modules/diversityData'    
import { loadCombinedComposite } from 'redux/modules/combinedData'
import { browserHistory } from 'react-router'
let roundFormat = d3.format(".2f")

export class HomeView extends React.Component<void, Props, void> {
   constructor () {
    super()
    this.state = {
      activeComponent:'combined',
      bucket:'all',
      activeMapGraph:'map',
      metric:'composite'
    }
    this._isActive = this._isActive.bind(this)
    this._linkIsActive = this._linkIsActive.bind(this)
    this._setActiveComponent = this._setActiveComponent.bind(this)
    this._setActiveBucket = this._setActiveBucket.bind(this)
    this._setMapGraph = this._setMapGraph.bind(this)
    this._setMetric = this._setMetric.bind(this)
    this.onMouseover = this.onMouseover.bind(this)
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
    this.setState({activeComponent:type})
  }

  _setMapGraph (type) {
    if(type == 'graph'){
      d3.select('#mapComponent')[0][0].className = 'hidden'
      d3.select('#graphComponent')[0][0].className = ''
    }
    else{
      d3.select('#mapComponent')[0][0].className = ''
      d3.select('#graphComponent')[0][0].className = 'hidden'      
    }
    this.setState({activeMapGraph:type})
  }

  _setMetric (type) {
    console.log(type);
    this.setState({metric:type})
  }


  _setActiveBucket (bucket) {
    this.setState({'bucket':bucket});
  }   

  _isActive(type){
    return type === this.state.activeComponent ? classes['active'] : ''
  }

  _linkIsActive(type){
    return type === this.state.activeComponent ? classes['active-link'] : ''
  }

  onMouseover(hoverBox,feature){
    let year = 2012;

    if(feature.city){
      var curFeature = feature.city
      curFeature.id = curFeature.key
    }
    else{
      var curFeature = feature      
    }

    let combinedScore = this.props.combinedcomposite.filter(metro => { 
      return metro.key == curFeature.id})[0].values.filter(d => 
        { return d.x === year })[0] || {}

    let densityScore = this.props.densitycomposite.filter(metro => { 
      return metro.key == curFeature.id})[0].values.filter(d => 
        { return d.x === year })[0] || {}

    let fluidityScore = this.props.fluiditycomposite.filter(metro => { 
      return metro.key == curFeature.id})[0].values.filter(d => 
        { return d.x === year })[0] || {}

    let diversityScore = this.props.diversitycomposite.filter(metro => { 
      return metro.key == curFeature.id})[0].values.filter(d => 
        { return d.x === year })[0] || {}      

    var combinedText = "Combined " + combinedScore.rank + " " + roundFormat(combinedScore.y)
    var densityText = "Density " + densityScore.rank + " " + roundFormat(densityScore.y)
    var fluidityText = "Fluidity " + fluidityScore.rank + " " + roundFormat(fluidityScore.y)
    var diversityText = "Diversity " + diversityScore.rank + " " + roundFormat(diversityScore.y)

    d3.select("#combinedScore").text(combinedText)
    d3.select("#densityScore").text(densityText)
    d3.select("#fluidityScore").text(fluidityText)
    d3.select("#diversityScore").text(diversityText)
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
          this.state.bucket === 'all' ||
        (
          this.props.metros[msaId] && 
          this.props.metros[msaId].pop && 
          this.props.metros[msaId].pop[2014] && 
          popScale(this.props.metros[msaId].pop[2014]) == this.state.bucket
        )
      )
    })

    if(this.props[this.state.activeComponent + "composite"]){
      var graph = (       
          <div className='col-xs-10' style={{ padding: 0}}>
            <LineGraph    
            metros={metrosInBucket} 
            data={this.props[this.state.activeComponent + "composite"]} 
            plot="value" dataType="raw" title={this.state.activeComponent + "composite"} 
            graph={this.state.activeComponent + "composite"}
            onMouseover={this.onMouseover.bind(null,hoverBox)}
            />
          </div>
            )
    }
    else{
        var graph = 'Loading...'
    }    
  
    var map=
      (<NationalMap 
        metros={metrosInBucket} 
        activeComponent={this.state.activeComponent}
        onMouseover={this.onMouseover.bind(null,hoverBox)}
      />)
  


  var hoverBox = (
    <div style={{marginTop: 15,marginLeft: 15}}>
      <div className = 'row'>
      Metro Area Scores
      </div> 
      <div className={"row "+classes['hoverScoreHeader']}>
        <strong >Index</strong><strong >Rank</strong><strong >Score</strong>      
      </div>
      <div className={classes['hoverScoreContainer']}>
        <div id="combinedScore" className={"row " +classes['hoverScore']}></div>
        <div id="densityScore" className={"row " +classes['hoverScore']}></div>
        <div id="fluidityScore" className={"row " +classes['hoverScore']}></div>
        <div id="diversityScore" className={"row " +classes['hoverScore']}></div>
      </div>
    </div>
    )

    return (
      <div>
      <div className='container'>
        <div className='row'>
          <div className={'col-xs-12 ' + classes['text-div']}>
            The <strong> Atlas of Entreprenurial Activity </strong> is a set of interactive tools and indices designed to provide a visual understanding of the economic indicators of entreprenurial ecosystems in the United States. Take a broad view of the United States with AEA Inddex which combines a dozen different indicators to rank metropolitan areas on their entreprenurial ecosystems or get a detailed overview of entreprenurial and economic activity of individual metropolitan areas. 
          </div>
        </div>
        
        <div className='row' style={{padding:15, marginTop: 15}} >
          <ComponentButtons
            onComponentChange={this._setActiveComponent} 
            activeComponent={this.state.activeComponent}
          />
          <PopBuckets 
            popScale={popScale} 
            onBucketChange={this._setActiveBucket} 
            bucket={this.state.bucket}
          />
        </div>
        <div className='row'>
          <div className={'col-xs-12 ' + classes['text-div']}>
            <strong>{this.state.activeComponent.toUpperCase()}</strong> ipsum dolor sit amet, mel nibh soluta molestiae in, ut vis illud utamur disputando, sed id eius bonorum. Mei vivendum adversarium ex, libris assentior eu per. In summo invenire interpretaris quo, ex vix partem facilisis signiferumque, ridens splendide conclusionemque an vis. Dico aliquip scriptorem vix et. Te eum omnes possit omittantur. Ei volutpat dignissim sit, erat option pri in.
          </div>
        </div>
        
      </div>
      <div className='container'>
        <div className='row'>
          <div className='col-xs-2' style={{padding:15}}>
            <RankBox 
              activeComponent={this.state.activeComponent} 
              popScale={popScale}
              bucket={this.state.bucket}
            />
            {hoverBox}
          </div>
          <div id="mapDiv" className='col-xs-10' style={{padding:15}}>
            <SubGraphButtons
              onComponentChange={this._setMetric} 
              activeComponent={this.state.activeComponent}
            />
            <MapGraphButtons
              onComponentChange={this._setMapGraph} 
              activeComponent={this.state.activeMapGraph}
            />
            <div id='mapComponent'>
            {map}
            </div>
            <div id='graphComponent'  className='hidden'>
            {graph} 
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
  fluiditycomposite:state.fluidityData.compositeData,   
  diversitycomposite : state.diversityData.diversitycomposite,    
  combinedcomposite : state.combinedData.combinedcomposite,
  metros : state.metros
})

export default connect((mapStateToProps), {
  getdensitycomposite: () => loadDensityComposite(),    
  getfluiditycomposite: () => loadFluidityComposite(),    
  getdiversitycomposite: () => loadDiversityComposite(),    
  getcombinedcomposite: () => loadCombinedComposite()
})(HomeView)
