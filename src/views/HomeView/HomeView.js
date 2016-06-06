//* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { browserHistory } from 'react-router'
import classes from 'styles/sitewide/index.scss'
import d3 from 'd3'
import NationalMap from 'components/maps/NationalMap'
import RankBox from 'components/ranks/RankBox'
import PopBuckets from 'components/ranks/PopBuckets'
import ComponentButtons from 'components/ranks/ComponentButtons'
import MapGraphButtons from 'components/ranks/MapGraphButtons'
import SubGraphButtons from 'components/ranks/SubGraphButtons'
import LineGraph from 'components/graphs/LineGraph.js'
import BarChart from 'components/graphs/BarChart.js'
import HoverBox from 'components/ranks/HoverBox'
import { loadDensityComposite,loadNewValues,loadShare } from 'redux/modules/densityData'   
import { loadFluidityComposite,loadInc5000Data, loadNetMigrationIrs, loadTotalMigration,loadAnnualChurn } from 'redux/modules/fluidityData'    
import { loadDiversityComposite,loadOpportunityData,loadForeignBornData } from 'redux/modules/diversityData'    
import { loadCombinedComposite } from 'redux/modules/combinedData'
import CategoryText from 'components/misc/categoryText'
let roundFormat = d3.format(".2f")

export class HomeView extends React.Component<void, Props, void> {
   constructor () {
    super()
    this.state = {
      activeComponent:'combined',
      bucket:'all',
      activeMapGraph:'map',
      metric:'composite',
      hoverMetro: null
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
    this.setState({activeComponent:type,metric:"composite"})
  }

  _setMapGraph (type) {
    this.setState({activeMapGraph:type})
  }

  _setMetric (type) {
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

  onMouseover(feature){
    let curFeature = feature.city ? feature.city.key : feature.id  
    this.setState({
      hoverMetro: curFeature
    })
  }

  renderMapGraph (metrosInBucket) {
    if(!this.props[this.state.activeComponent + (this.state.metric).replace(/ /g,'')]){
      this.props["get" + this.state.activeComponent + (this.state.metric).replace(/ /g,'')]()
      return <span />
    }
    if(this.state.activeMapGraph === 'map'){
      return (
        <NationalMap 
          metros={metrosInBucket} 
          activeComponent={this.state.activeComponent + (this.state.metric).replace(/ /g,'')}
          onMouseover={this.onMouseover}
        />
      )
    }else if((this.state.metric).replace(/ /g,'') === 'incomebasedonchildhood'){
      return (
       <BarChart    
          metros={metrosInBucket} 
          data={this.props[this.state.activeComponent + (this.state.metric).replace(/ /g,'')]} 
          plot="value" dataType="composite" title={this.state.activeComponent + (this.state.metric).replace(/ /g,'')} 
          graph="opportunitycomposite"
          onMouseover={this.onMouseover}
        />
      )
    }else {
      return (
        <LineGraph    
          metros={metrosInBucket} 
          data={this.props[this.state.activeComponent + (this.state.metric).replace(/ /g,'')]} 
          plot="value" dataType="relative" title={this.state.activeComponent + (this.state.metric).replace(/ /g,'')} 
          graph={this.state.activeComponent + "composite"}
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
          this.state.bucket === 'all' ||
        (
          this.props.metros[msaId] && 
          this.props.metros[msaId].pop && 
          this.props.metros[msaId].pop[2014] && 
          popScale(this.props.metros[msaId].pop[2014]) == this.state.bucket
        )
      )
    })

    return (
      <div> 
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
      <div className='container'>
  
        
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
            <strong>{this.state.activeComponent.toUpperCase()}</strong> {CategoryText[this.state.activeComponent].map(d => { return (<p>{d} </p>)})}
          </div>
        </div>
        
      </div>
      <div className='container'>
        <div className='row'>
          <div className='col-md-3' style={{padding:15}}>
            <RankBox 
              activeComponent={this.state.activeComponent} 
              popScale={popScale}
              bucket={this.state.bucket}
            />
            <HoverBox metroId={this.state.hoverMetro} activeComponent={this.state.activeComponent} />
          </div>
          <div id="mapDiv" className='col-md-9' style={{padding:15}}>
            <SubGraphButtons
              metric={this.state.metric}
              onComponentChange={this._setMetric} 
              activeComponent={this.state.activeComponent}
            />
            <MapGraphButtons
              mapGraph={this.state.activeMapGraph}
              onComponentChange={this._setMapGraph} 
              activeComponent={this.state.activeMapGraph}
            />
            
           
            {this.renderMapGraph(metrosInBucket)}          
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
  fluiditycomposite:state.fluidityData.compositeData,   
  fluidityhighgrowthfirms:state.fluidityData.inc5000,
  fluiditynetmigration:state.fluidityData.irsNet,
  fluiditytotalmigration:state.fluidityData.totalMigrationFlow,
  fluidityannualchurn:state.fluidityData.annualChurn,
  diversitycomposite : state.diversityData.diversitycomposite,    
  diversityincomebasedonchildhood:state.diversityData.opportunity,
  diversitypercentageofforiegnbornpopulation:state.diversityData.foreignborn,
  combinedcomposite : state.combinedData.combinedcomposite,
  metros : state.metros
})

export default connect((mapStateToProps), {
  getdensitycomposite: () => loadDensityComposite(),
  getdensitynewfirms: () => loadNewValues(),
  getdensityshareofemploymentinnewfirms: () => loadShare(),    
  getfluiditycomposite: () => loadFluidityComposite(),    
  getfluidityhighgrowthfirms: () => loadInc5000Data(),
  getfluiditynetmigration: () => loadNetMigrationIrs(),
  getfluiditytotalmigration: () => loadTotalMigration(),
  getfluidityannualchurn:() => loadAnnualChurn(),
  getdiversitycomposite: () => loadDiversityComposite(),    
  getdiversityincomebasedonchildhood: () => loadOpportunityData(),
  getdiversitypercentageofforiegnbornpopulation: () => loadForeignBornData(),
  getcombinedcomposite: () => loadCombinedComposite(),
})(HomeView)
