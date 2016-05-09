"use strict"
import React from 'react'
import { connect } from 'react-redux'
import { loadDensityData,loadDensityComposite } from 'redux/modules/densityData'
import { loadFluidityData,loadFluidityComposite } from 'redux/modules/fluidityData'
import { loadDiversityData,loadDiversityComposite } from 'redux/modules/diversityData'
import { loadCombinedData, loadCombinedComposite } from 'redux/modules/combinedData'
import classes from '../../components/maps/NationalMap.scss'
import LineGraph from '../../components/graphs/LineGraph.js'

export class CombinedGraph extends React.Component<void, Props, void> {
  constructor () {
    super()
    this.state = {
      data:null,
      loaded:false,
      plot:"rank",
      dataType:"raw"
    }
    this._initGraph = this._initGraph.bind(this)
  }

  componentWillMount () {
    this._initGraph();
  }
 
  _initGraph () {
    var dataset = this.props.selectedMetric.split("composite")[0];
    console.log(dataset)

    if(!this.props[(dataset + "loaded")]){
      return this.props[(['load' + dataset + "Data"])]()          
    }       
    if(!this.props[(this.props.selectedMetric)]){
      console.log('dont have metric')
      return this.props[(['get' + this.props.selectedMetric])]()
    }
  }

  render () {
    this._initGraph();
    console.log(this.props.selectedMetric)
    if(this.props[(this.props.selectedMetric)]){
      console.log("combined render making line chart")
     return (
        <LineGraph data={this.props[this.props.selectedMetric]} plot={this.props.plot} dataType={this.props.dataType} title={this.props.selectedMetric} graph={this.props.selectedMetric}/>
      )         
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
  densityloaded:state.densityData.loaded,
  fluiditycomposite:state.fluidityData.compositeData,
  fluidityloaded:state.fluidityData.fluLoaded,
  diversityloaded : state.diversityData.diversityLoaded,
  diversitycomposite : state.diversityData.diversitycomposite,
  combinedloaded : state.combinedData.combinedLoaded,
  combinedcomposite : state.combinedData.combinedcomposite 
})

export default connect((mapStateToProps), {
  loaddensityData: () => loadDensityData(),
  getdensitycomposite: () => loadDensityComposite(),
  loadfluidityData: () => loadFluidityData(),
  getfluiditycomposite: () => loadFluidityComposite(),
  loaddiversityData: () => loadDiversityData (),
  getdiversitycomposite: () => loadDiversityComposite (),
  loadcombinedData: () => loadCombinedData (),
  getcombinedcomposite: () => loadCombinedComposite ()
})(CombinedGraph)
