"use strict"
import React from 'react'
import { connect } from 'react-redux'
import { loadIrsData,loadAcsData,loadInc5000Data,loadFluidityComposite,loadFluidityData, loadNetMigrationIrs,loadNetMigrationAcs,loadTotalMigration,loadInflowMigration,loadOutflowMigration} from 'redux/modules/fluidityData'
import topojson from 'topojson'
import classes from '../../components/maps/NationalMap.scss'
import LineGraph from '../../components/graphs/LineGraph.js'

export class FluidityGraph extends React.Component<void, Props, void> {
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
    let dataset = (this.props.selectedMetric).substring(0,3);

    if(!this.props[(dataset + "Loaded")]){
      console.log("notloaded",this.props,('load'+[dataset] + 'Data'));
      return this.props[('load'+[dataset] + 'Data')]()
    }
    if(!this.props[this.props.selectedMetric]){
      console.log("noMetric",(('load'+[this.props.selectedMetric])));
      return this.props[('load'+[this.props.selectedMetric])]()
    }          
  }

  render () {
    let dataset = (this.props.selectedMetric).substring(0,3);
    this._initGraph();
    if(this.props[(dataset + "Loaded")] && this.props[this.props.selectedMetric]){
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
  irsLoaded : state.fluidityData.irsLoaded,
  acsLoaded : state.fluidityData.acsLoaded,
  incLoaded : state.fluidityData.inc5000Loaded,
  fluLoaded : state.fluidityData.fluLoaded,
  fluiditycomposite:state.fluidityData.compositeData,
  inc:state.fluidityData.inc5000,
  irsNet:state.fluidityData.irsNet,
  acsNet:state.fluidityData.acsNet,
  irsTotalMigration:state.fluidityData.totalMigrationFlow,
  irsInflowMigration:state.fluidityData.inflowMigration,
  irsOutflowMigration:state.fluidityData.outflowMigration,
  metros: state.metros
})

export default connect((mapStateToProps), {
  loadfluData: () => loadFluidityData (),
  loadirsData: () => loadIrsData (),
  loadacsData: () => loadAcsData (),
  loadincData: () => loadInc5000Data (),
  loadfluiditycomposite: () => loadFluidityComposite (),
  loadirsNet: () => loadNetMigrationIrs (),
  loadacsNet: () => loadNetMigrationAcs (),
  loadirsTotalMigration: () => loadTotalMigration (),
  loadirsInflowMigration: () => loadInflowMigration (),
  loadirsOutflowMigration: () => loadOutflowMigration ()
})(FluidityGraph)