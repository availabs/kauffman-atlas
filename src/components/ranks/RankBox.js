/* @flow */
import React from 'react'
import { connect } from 'react-redux'
import { loadDensityComposite } from 'redux/modules/densityData'
import { loadFluidityComposite } from 'redux/modules/fluidityData'
import { loadDiversityComposite } from 'redux/modules/diversityData'
import { loadCombinedComposite } from 'redux/modules/combinedData'
let roundFormat = d3.format(".2f")
import CategoryNames from 'components/misc/categoryNames'

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
  }

  hasData () {
    return (
      this.props.densitycomposite &&
      this.props.fluiditycomposite &&
      this.props.diversitycomposite && 
      this.props.combinedcomposite
    )
  }

  
  _inBucket(msaId) {
    return (this.props.metrosInBucket.indexOf(msaId) >= 0)
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
    .filter((d) => { return d.values.filter(e => { return e.x === year })[0] })
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

    var currentData = this.props[this.props.activeComponent + 'composite']      

    //Checking to see if passed year property is within bounds of composite data
    //If it isn't, choose the closest existing value

    //console.log(this.props.year)

    var minYear = d3.min(currentData, function(c) { return d3.min(c.values, function(v) { return v.x }); })
    var maxYear = d3.max(currentData, function(c) { return d3.max(c.values, function(v) { return v.x }); })

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
          <h4 style={{textAlign: 'center'}}><small style={{color:'#f5f5f5'}}>{CategoryNames[this.props.activeComponent + "composite"]} - {year}</small></h4>
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
  metros : state.metros
})

export default connect((mapStateToProps), {
  getdensitycomposite: () => loadDensityComposite(),
  getfluiditycomposite: () => loadFluidityComposite(),
  getdiversitycomposite: () => loadDiversityComposite(),
  getcombinedcomposite: () => loadCombinedComposite(),
})(RankBoxes)
