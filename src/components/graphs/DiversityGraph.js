"use strict"
import React from 'react'
import { connect } from 'react-redux'
import { loadOpportunityData, loadForeignBornData, loadDiversityData, loadDiversityComposite } from 'redux/modules/diversityData'
import classes from '../../components/maps/NationalMap.scss'
import LineGraph from '../../components/graphs/LineGraph.js'
import BarChart from '../../components/graphs/BarChart.js'

export class DiversityGraph extends React.Component<void, Props, void> {
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

    if(!this.props[(this.props.selectedMetric)]){
      if(this.props.selectedMetric == "diversitycomposite"){
        if(this.props['diversityLoaded']){
          console.log("notloaded",this.props,([this.props.selectedMetric]));
          return this.props[(['load' + this.props.selectedMetric])]()          
        }
        else{
          return this.props[(['loaddiversitydata'])]()
        }
      }
      console.log("notloaded",this.props,([this.props.selectedMetric]));
      return this.props[(['load' + this.props.selectedMetric])]()
    }       
  }

  render () {
    this._initGraph();
    if(this.props[(this.props.selectedMetric)]){
      if(this.props.selectedMetric == 'opportunity'){
        console.log("divgraph render making bar chart")
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
  opportunity : state.diversityData.opportunity,
  foreignBorn : state.diversityData.foreignborn,
  diversityLoaded : state.diversityData.diversityLoaded,
  diversitycomposite : state.diversityData.diversitycomposite
})

export default connect((mapStateToProps), {
  loadopportunity: () => loadOpportunityData (),
  loadforeignBorn: () => loadForeignBornData (),
  loaddiversitydata: () => loadDiversityData (),
  loaddiversitycomposite: () => loadDiversityComposite ()
})(DiversityGraph)