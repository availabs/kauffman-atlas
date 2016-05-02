"use strict"
import React from 'react'
import { connect } from 'react-redux'
import { loadFluidityData } from 'redux/modules/fluidityData'
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
    if(this.props.loaded !== nextProps.loaded){
      // return this.props.loadData()
    }
  }

  _initGraph () {
    if(!this.props.loaded){
      // return this.props.loadData()
    }     
  }

  render () {
    this._initGraph();
    if(this.props.loaded){
      console.log(this.props[this.props.selectedMetric])
       return (
          <LineGraph data={this.props[this.props.selectedMetric]} plot={this.props.plot} dataType={this.props.dataType} title={this.props.selectedMetric} graph={this.props.selectedMetric}/>
        )     
    }
    else{
      return (
        <div></div>
      )      
    }

  }
}

const mapStateToProps = (state) => ({
  irsLoaded : state.fluidityData.irsLoaded,
  acsLoaded : state.fluidityData.acsLoaded,
  inc5000Loaded : state.fluidityData.inc5000Loaded,
  composite:state.fluidityData.composite,
  inc5000:state.fluidityData.inc5000,
  netMigrationIrs:state.fluidityData.netMigrationIrs,
  netMigrationACS:state.fluidityData.netMigrationACS,
  totalMigration:state.fluidityData.totalMigration,
  inflowMigration:state.fluidityData.inflowMigration,
  outflowMigration:state.fluidityData.outflowMigration,
  metros: state.metros
})

export default connect((mapStateToProps), {
  loadComposite: () => loadComposite (),
  loadInc5000Data: () => loadInc5000Data (),
  loadNetMigrationIrs: () => loadNetMigrationIrs (),
  loadNetMigrationAcs: () => loadNetMigrationAcs (),
  loadTotalMigration: () => loadTotalMigration (),
  loadInflowMigration: () => loadInflowMigration (),
  loadOutflowMigration: () => loadOutflowMigration ()
})(FluidityGraph)