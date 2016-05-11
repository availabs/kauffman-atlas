"use strict"
import React from 'react'
import { connect } from 'react-redux'
import { loadDensityData,loadDensityComposite } from 'redux/modules/densityData'
import { loadFluidityData,loadFluidityComposite } from 'redux/modules/fluidityData'
import { loadDiversityData,loadDiversityComposite } from 'redux/modules/diversityData'
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
 
  _initGraph () {
    var dataset = this.props.selectedMetric.split("composite")[0];
    console.log(dataset)

    if(dataset == "combined"){
      if(!this.props.densityloaded){
        return this.props.loaddensityData()
      }
      if(!this.props['densitycomposite']){
        return this.props['getdensitycomposite']()
      }
      if(!this.props.fluidityloaded){
        return this.props.loadfluidityData()
      }
      if(!this.props['fluiditycomposite']){
        return this.props['getfluiditycomposite']()
      }
      if(!this.props.diversityloaded){
        return this.props.loaddiversityData()
      }
      if(!this.props['diversitycomposite']){
        return this.props['getdiversitycomposite']()
      } 

      if(!this.props['combinedcomposite']){
        console.log("getting combo comp")
        return this.props['getcombinedcomposite']()        
      }
    }
    else{
      if(!this.props[(dataset + "loaded")]){
        return this.props[(['load' + dataset + "Data"])]()          
      }       
      if(!this.props[(this.props.selectedMetric)]){
        console.log('dont have metric')
        return this.props[(['get' + this.props.selectedMetric])]()
      }      
    }

  }

  render () {
    this._initGraph();
    console.log(this.props.selectedMetric)
    if(this.props[(this.props.selectedMetric)]){
      console.log("combined render making line chart")
      if(this.props.selectedMetric == "combinedcomposite"){
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
  densityloaded:state.densityData.loaded,
  fluiditycomposite:state.fluidityData.compositeData,
  fluidityloaded:state.fluidityData.fluLoaded,
  diversityloaded : state.diversityData.diversityLoaded,
  diversitycomposite : state.diversityData.diversitycomposite,
  combinedcomposite : state.combinedData.combinedcomposite 
})

export default connect((mapStateToProps), {
  loaddensityData: () => loadDensityData(),
  getdensitycomposite: () => loadDensityComposite(),
  loadfluidityData: () => loadFluidityData(),
  getfluiditycomposite: () => loadFluidityComposite(),
  loaddiversityData: () => loadDiversityData (),
  getdiversitycomposite: () => loadDiversityComposite (),
  getcombinedcomposite: () => loadCombinedComposite ()
})(CombinedGraph)
