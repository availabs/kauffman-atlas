"use strict"
import React from 'react'
import { connect } from 'react-redux'
import { loadInc5000Data,loadFluidityComposite,loadNetMigrationIrs,loadTotalMigration,loadInflowMigration,loadOutflowMigration} from 'redux/modules/fluidityData'
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
 
  componentWillReceiveProps (nextProps){
    if(this.props !== nextProps){
      this.setState({loaded:false})
    }
    if(!nextProps[nextProps.selectedMetric]){
      return this.props[('load'+[nextProps.selectedMetric])]()
    }
  }

  _initGraph () {
    if(!this.props[this.props.selectedMetric]){
      return this.props[('load'+[this.props.selectedMetric])]()
    }          
  }

  render () {
    this._initGraph();
    if(this.props[this.props.selectedMetric]){
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
  fluiditycomposite:state.fluidityData.compositeData,
  inc:state.fluidityData.inc5000,
  irsNet:state.fluidityData.irsNet,
  irsTotalMigration:state.fluidityData.totalMigrationFlow,
  irsInflowMigration:state.fluidityData.inflowMigration,
  irsOutflowMigration:state.fluidityData.outflowMigration,
  metros: state.metros
})

export default connect((mapStateToProps), {
  loadincData: () => loadInc5000Data (),
  loadfluiditycomposite: () => loadFluidityComposite (),
  loadirsNet: () => loadNetMigrationIrs (),
  loadirsTotalMigration: () => loadTotalMigration (),
  loadirsInflowMigration: () => loadInflowMigration (),
  loadirsOutflowMigration: () => loadOutflowMigration ()
})(FluidityGraph)