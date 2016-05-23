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
import LineGraph from '../../components/graphs/LineGraph.js'
import { loadDensityComposite } from 'redux/modules/densityData'   
import { loadFluidityComposite } from 'redux/modules/fluidityData'    
import { loadDiversityComposite } from 'redux/modules/diversityData'    
import { loadCombinedComposite } from 'redux/modules/combinedData'
import { browserHistory } from 'react-router'

export class HomeView extends React.Component<void, Props, void> {
   constructor () {
    super()
    this.state = {
      activeComponent:'combined',
      bucket:'all'
    }
    this._isActive = this._isActive.bind(this)
    this._linkIsActive = this._linkIsActive.bind(this)
    this._setActiveComponent = this._setActiveComponent.bind(this)
    this._setActiveBucket = this._setActiveBucket.bind(this)
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

  _setActiveBucket (bucket) {
    this.setState({'bucket':bucket});
  }   

  _isActive(type){
    return type === this.state.activeComponent ? classes['active'] : ''
  }

  _linkIsActive(type){
    return type === this.state.activeComponent ? classes['active-link'] : ''
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
      // if(
      //     this.state.bucket !== 'all' &&
      //   (
      //     this.props.metros[msaId] && 
      //     this.props.metros[msaId].pop && 
      //     this.props.metros[msaId].pop[2014] && 
      //     this.props.metros[msaId].pop[2014] >= +popGroups[this.state.bucket] &&
      //     (
      //       !popGroups[this.state.bucket+1] ||
      //       this.props.metros[msaId].pop[2014] <= +popGroups[(+this.state.bucket+1)] 
      //     ) 
      //   )
      // )
      // {
      //   console.log(
      //     msaId,
      //     this.state.bucket,
      //     (+this.state.bucket+1),
      //     this.props.metros[msaId].pop[2014],
      //     +popGroups[this.state.bucket],
      //     +popGroups[(+this.state.bucket+1)] || 'highest',
      //     this.props.metros[msaId].pop[2014] >= +popGroups[this.state.bucket] &&
      //     (
      //       !popGroups[+this.state.bucket+1] ||
      //       this.props.metros[msaId].pop[2014] <= +popGroups[+this.state.bucket+1] 
      //     )
      //   )
      // }

       if(
          this.state.bucket !== 'all' &&
        (
          this.props.metros[msaId] && 
          this.props.metros[msaId].pop && 
          this.props.metros[msaId].pop[2014] && 
          popScale(this.props.metros[msaId].pop[2014]) == this.state.bucket
        )
      )
      {
        console.log(
          msaId,
          this.state.bucket,
          this.props.metros[msaId].pop[2014],
          popScale(this.props.metros[msaId].pop[2014]),
          popScale(this.props.metros[msaId].pop[2014]) == this.state.bucket
        )
      }

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
            <LineGraph data={this.props[this.state.activeComponent + "composite"]} plot="value" dataType="raw" title={this.state.activeComponent + "composite"} graph={this.state.activeComponent + "composite"}/>
          </div>
          )
  }
  else{
    var graph = 'Loading...'
  }

    return (
      <div>
      <div className='container'>
        <div className='row'>
          <div className={'col-xs-12 ' + classes['text-div']}>
            <strong>Lorem</strong> ipsum dolor sit amet, mel nibh soluta molestiae in, ut vis illud utamur disputando, sed id eius bonorum. Mei vivendum adversarium ex, libris assentior eu per. In summo invenire interpretaris quo, ex vix partem facilisis signiferumque, ridens splendide conclusionemque an vis. Dico aliquip scriptorem vix et. Te eum omnes possit omittantur. Ei volutpat dignissim sit, erat option pri in.
          </div>
        </div>
        
        <div className='row' style={{padding:15, marginTop: 15}}>
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
          <div className='col-xs-2' style={{ paddingRight: 0}}>
            <RankBox 
              activeComponent={this.state.activeComponent} 
              popScale={popScale}
              bucket={this.state.bucket}
            />
          </div>
          <div className='col-xs-10' style={{ padding: 0}}>
            <NationalMap 
              metros={metrosInBucket} 
              activeComponent={this.state.activeComponent}
            />
          </div>
          {graph}
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
