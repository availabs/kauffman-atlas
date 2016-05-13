"use strict"
import React from 'react'
import { connect } from 'react-redux'
import { loadNewValues,loadShare,loadDensityComposite } from 'redux/modules/densityData'
import topojson from 'topojson'
import classes from '../../components/maps/NationalMap.scss'
import LineGraph from '../../components/graphs/LineGraph.js'
import { data } from 'static/data/test'

export class DensityGraph extends React.Component<void, Props, void> {
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
      console.log("data",this.props[this.props.selectedMetric])
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
  newValues: state.densityData.newValuesData,
  share:state.densityData.shareData,
  densitycomposite:state.densityData.compositeData,
  metros: state.metros
})

export default connect((mapStateToProps), {
  loadnewValues: () => loadNewValues(),
  loadshare: () => loadShare(),
  loaddensitycomposite: () => loadDensityComposite()
})(DensityGraph)