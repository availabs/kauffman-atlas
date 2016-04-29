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
      return this.props.loadData()
    }
  }

  _initGraph () {
    if(!this.props.loaded){
      return this.props.loadData()
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
  loaded : state.fluidityData.loaded,
  composite:state.fluidityData.newValuesData,
  inc5000:state.fluidityData.newValuesData,
  netMigrationIrs:state.fluidityData.newValuesData,
  netMigrationACS:state.fluidityData.newValuesData,
  totalMigration:state.fluidityData.newValuesData,
  inflowMigration:state.fluidityData.newValuesData,
  outflowMigration:state.fluidityData.newValuesData,
  metros: state.metros
})

export default connect((mapStateToProps), {
  loadData: () => loadFluidityData()
})(FluidityGraph)