/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { loadDensityComposite } from 'redux/modules/densityData'
import { loadFluidityComposite } from 'redux/modules/fluidityData'
import { loadDiversityComposite } from 'redux/modules/diversityData'
import { loadCombinedComposite } from 'redux/modules/combinedData'
import classes from 'styles/sitewide/index.scss'
let roundFormat = d3.format(".2f")

export class RankBoxes extends React.Component<void, Props, void> {
   constructor () {
    super()
    this._initGraph = this._initGraph.bind(this)
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
  
    let topFive = this._topFiveList(this.props.activeComponent)

    return (
      <div className='row'>
        <div className='col-xs-12' >
          Top 5 Metro Areas
          <div className={classes["topFive"]}>{topFive}</div>
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
