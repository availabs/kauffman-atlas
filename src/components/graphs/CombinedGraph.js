"use strict"
import React from 'react'
import { connect } from 'react-redux'
import { loadDensityComposite } from 'redux/modules/densityData'
import { loadFluidityComposite } from 'redux/modules/fluidityData'
import { loadDiversityComposite } from 'redux/modules/diversityData'
import { loadCombinedComposite } from 'redux/modules/combinedData'
import classes from '../../components/maps/NationalMap.scss'
import LineGraph from '../../components/graphs/LineGraph.js'
import BarChart from '../../components/graphs/BarChart.js'

export class CombinedGraph extends React.Component<void, Props, void> {
  constructor () {
    super()
    this.state = {
      data:null,
      loaded:false,
      plot:"value",
      dataType:"raw"
    }
    this._initGraph = this._initGraph.bind(this)
  }

  componentWillMount () {
    this._initGraph();
  }
 
  componentWillReceiveProps (nextProps){
    if(this.props !== nextProps){
      this.setState({loaded:false})
    }
    if(!nextProps[nextProps.selectedMetric]){
      return this.props[('get'+[nextProps.selectedMetric])]()
    }
  }

  _initGraph () {
    if(!this.props[this.props.selectedMetric]){
      return this.props[('get'+[this.props.selectedMetric])]()
    }          
  }


  render () {
    this._initGraph();
    console.log(this.props.selectedMetric)
    if(this.props[(this.props.selectedMetric)]){
      console.log("combined render making line chart")
      if(this.props.graphType == "bar"){
        return (
          <BarChart data={this.props[this.props.selectedMetric]} plot={this.props.plot} dataType={this.props.dataType} title={this.props.selectedMetric} graph={this.props.selectedMetric}/>
        )
      }
      else{
       return (
          <LineGraph data={this.props[this.props.selectedMetric]} plot={this.props.plot} dataType={this.props.dataType} title={this.props.selectedMetric} graph={this.props.selectedMetric}/>
        )         
      }
        
    }
    else{
      console.log("rener mia",this.props);
      return (
        <div></div>
      )      
    }

  }
}

const mapStateToProps = (state) => ({
  densitycomposite:state.densityData.compositeData,
  fluiditycomposite:state.fluidityData.compositeData,
  diversitycomposite : state.diversityData.diversitycomposite,
  combinedcomposite : state.combinedData.combinedcomposite 
})

export default connect((mapStateToProps), {
  getdensitycomposite: () => loadDensityComposite(),
  getfluiditycomposite: () => loadFluidityComposite(),
  getdiversitycomposite: () => loadDiversityComposite (),
  getcombinedcomposite: () => loadCombinedComposite ()
})(CombinedGraph)
