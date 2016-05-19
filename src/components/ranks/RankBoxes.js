/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { loadDensityComposite } from 'redux/modules/densityData'
import { loadFluidityComposite } from 'redux/modules/fluidityData'
import { loadDiversityComposite } from 'redux/modules/diversityData'
import { loadCombinedComposite } from 'redux/modules/combinedData'
import classes from 'styles/sitewide/index.scss'
import { browserHistory } from 'react-router'
let roundFormat = d3.format(".2f")
        

export class RankBoxes extends React.Component<void, Props, void> {
   constructor () {
    super()
    this.state = {
      activeComponent:'combined',
    }
    this._initGraph = this._initGraph.bind(this)
    this._isActive = this._isActive.bind(this)
    this._linkIsActive = this._linkIsActive.bind(this)
    this._setActiveComponent = this._setActiveComponent.bind(this)
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

  hasData () {
    return (
      this.props.densitycomposite &&
      this.props.fluiditycomposite &&
      this.props.diversitycomposite
    )
  }

  _setActiveComponent(type){
    this.setState({activeComponent:type})
    if(this.props.onComponentChange){
      this.props.onComponentChange(type)
    }
  }

  _isActive(type){
    return type === this.state.activeComponent ? classes['active'] : ''
  }

  _linkIsActive(type){
    return type === this.state.activeComponent ? classes['active-link'] : ''
  }

  _inBucket(msaId) {
    return (this.props.bucket === 'all' ||
        (this.props.metros[msaId] && 
        this.props.metros[msaId].pop && 
        this.props.metros[msaId].pop[2014] && 
        this.props.popScale(this.props.metros[msaId].pop[2014]) == this.props.bucket))
  }

  _topFiveList(type,length=5){
    let currentData = this.props[type + 'composite']
    return currentData.filter((msa) => {
      return this._inBucket(msa.key)
    })
    .filter((d,i) => { return i < length })
    .map((metro,i) => {
      return (
        <div className={classes["msa"]}>
          <div id={i} className={classes["name"]}>{(i+1) + ". " + metro["name"]}</div>
          <div id={metro.id} className={classes["score"]}>{roundFormat(metro.values[metro.values.length-1].y)}</div>
        </div> 
      )
    })
  }

  render () {
    if(!this.hasData()) return <div> Loading... </div>
   
    let topFiveDensity = this._topFiveList('density')
    let topFiveFluidity = this._topFiveList('fluidity')
    let topFiveDiversity = this._topFiveList('diversity')
    let topFiveCombined = this._topFiveList('combined')
    
    return (
      <div className='row'>
        <div className='col-xs-3' onClick={this._setActiveComponent.bind(null,'combined')}>
          <div className={classes['selector-buttons']+' '+this._isActive('combined')}>
            <Link className={this._linkIsActive('combined') +' '+ classes['darklink']} to='/combined'>
            Combined
            </Link>
            <div className={classes["topFive"]}>{topFiveCombined}</div>
          </div>
        </div>
        <div className='col-xs-3' onClick={this._setActiveComponent.bind(null,'density')}>
         <div className={classes['selector-buttons']+' '+this._isActive('density')}>
            <Link className={classes['darklink'] + ' ' + this._linkIsActive('density')} to='/density'>
            Density
            </Link>
            <div className={classes["topFive"]}>{topFiveDensity}</div>
          </div>
        </div>
        <div className='col-xs-3' onClick={this._setActiveComponent.bind(null,'fluidity')}>
          <div className={classes['selector-buttons']+' '+this._isActive('fluidity')}>
            <Link className={classes['darklink'] + ' ' + this._linkIsActive('fluidity')} to='/fluidity'>
            Fluidity
            </Link>
            <div className={classes["topFive"]}>{topFiveFluidity}</div>
          </div>
        </div>
        <div className='col-xs-3' onClick={this._setActiveComponent.bind(null,'diversity')}>
          <div className={classes['selector-buttons']+' '+this._isActive('diversity')}>
            <Link className={classes['darklink'] + ' ' + this._linkIsActive('diversity')} to='/diversity'>
            Diversity
            </Link>
            <div className={classes["topFive"]}>{topFiveDiversity}</div>
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
})(RankBoxes)
