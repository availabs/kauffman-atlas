/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { loadDensityComposite } from 'redux/modules/densityData'
import { loadFluidityComposite } from 'redux/modules/fluidityData'
import { loadDiversityComposite } from 'redux/modules/diversityData'
import { loadCombinedComposite } from 'redux/modules/combinedData'
import { loadShareEmpAll } from 'redux/modules/qwiDensityData'
import classes from 'styles/sitewide/index.scss'
let roundFormat = d3.format(".2f")

export class RankBoxes extends React.Component<void, Props, void> {
   constructor () {
    super()
    this._initGraph = this._initGraph.bind(this)
    this._topFiveList = this._topFiveList.bind(this)
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
    if(!this.props['qwiDensityshareEmpAll']){
      this.props['getqwiDensityshareEmpAll']()          
    }    
  }

  hasData () {
    return (
      this.props.densitycomposite &&
      this.props.fluiditycomposite &&
      this.props.diversitycomposite && 
      this.props.qwiDensityshareEmpAll
    )
  }

  
  _inBucket(msaId) {
    return (this.props.bucket === 'all' ||
        (this.props.metros[msaId] && 
        this.props.metros[msaId].pop && 
        this.props.metros[msaId].pop[2014] && 
        this.props.popScale(this.props.metros[msaId].pop[2014]) == this.props.bucket))
  }

  _sortCities(year){
    return (a,b) => {
      var aValue,
      bValue;

      a.values.forEach(yearValues => {
        if(yearValues.x == year){
          aValue = yearValues.y;
        }
      })            

      b.values.forEach(yearValues => {
        if(yearValues.x == year){
          bValue = yearValues.y;
        }
      })       

      if(aValue > bValue){
        return -1;
      }
      if(bValue > aValue){
        return 1;
      }           
            
      return 0;     
    }
  }

  _topFiveList(currentData,length,year){


    currentData.sort(this._sortCities(year));      

    return currentData.filter((msa) => {
      return this._inBucket(msa.key)
    })
    .filter((d,i) => { return d.values.filter(e => { return e.x === year })[0] })
    .filter((d,i) => { return i < length  })
    .map((metro,i) => {
      var topValue = metro.values.filter(d => { return d.x === year })[0].y
      return (
        <tr>
          <td>{(i+1)}</td>
          <td><small>{metro["name"]}</small></td>
          <td>{roundFormat(topValue)}</td>
        </tr> 
      )
    })
  }

  render () {
    if(!this.hasData()) return <div> Loading... </div>
  
    //Current hack for displaying qwi data
    if(this.props.activeComponent == "qwiDensity"){
      var currentData = this.props.qwiDensityshareEmpAll
    }
    else{
      var currentData = this.props[this.props.activeComponent + 'composite']      
    }

    //Checking to see if passed year property is within bounds of composite data
    //If it isn't, choose the closest existing value
    var minYear = currentData[0].values[0].x;
    var maxYear = currentData[0].values[currentData[0].values.length-1].x;

    if(this.props.year >=  minYear && this.props.year <= maxYear){ 
      var year = this.props.year;
    } 
    else{
      var year = Math.abs(this.props.year-minYear) < Math.abs(this.props.year-maxYear) ? minYear : maxYear
    }

    let topFive = this._topFiveList(currentData,5,year)

    return (
      <div className='row' style={{margin:0, marginTop:10, backgroundColor: 'rgb(125, 143, 175)', color:'#f5f5f5', borderRadius: 3}}>
        <div className='col-xs-12' >
          <h4 style={{textAlign: 'center'}}><small style={{color:'#f5f5f5'}}>Top 5 Metro Areas</small></h4>
          <h4 style={{textAlign: 'center'}}><small style={{color:'#f5f5f5'}}>{year}</small></h4>
           <table className='table'>
          <thead>
            <tr>
              <th>#</th>
              <th>Metro</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {topFive}
          </tbody>
        </table>
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
  qwiDensityshareEmpAll:state.qwiDensityData.shareEmpAll,
  metros : state.metros
})

export default connect((mapStateToProps), {
  getdensitycomposite: () => loadDensityComposite(),
  getfluiditycomposite: () => loadFluidityComposite(),
  getdiversitycomposite: () => loadDiversityComposite(),
  getcombinedcomposite: () => loadCombinedComposite(),
  getqwiDensityshareEmpAll: () => loadShareEmpAll(),
})(RankBoxes)
