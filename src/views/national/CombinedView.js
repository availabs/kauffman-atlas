/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import classes from './nationalView.scss'
import CombinedGraph from '../../components/graphs/CombinedGraph.js'
import NationalMap from 'components/maps/NationalMap'

type Props = {
};

export class CombinedView extends React.Component<void, Props, void> {
  static propTypes = {};

  constructor () {
    super()
    this.state = {
      'selectedMetric':"densitycomposite",
      'graphType':'bar',
      'plot':'value',
    }
    this._setMetric = this._setMetric.bind(this)
    this._setDataType = this._setDataType.bind(this)
    this._setRankVal = this._setRankVal.bind(this)
    this._setBarLine = this._setBarLine.bind(this)
  }

  _setMetric (e){
    console.log(d3.selectAll("."+classes["metricBox"]))
    
    d3.selectAll("."+classes["metricBox"])[0].forEach(metricBox => {
      metricBox.className = classes["metricBox"];
    })

    e.target.className = classes["active"] + " " + classes["metricBox"];     

    this.setState({'selectedMetric':e.target.id});
  }

  _setBarLine (e){
    console.log(d3.selectAll("."+classes["barLineBox"]))
    
    d3.selectAll("."+classes["barLineBox"])[0].forEach(barLineBox => {
      barLineBox.className = classes["barLineBox"];
    })

    e.target.className = classes["active"] + " " + classes["barLineBox"];     

    if(e.target.id == "bar"){
      d3.select("#rank")[0][0].className = classes["disabled"] + " " + classes["rankValBox"];
      d3.select("#value")[0][0].className = classes["disabled"] + " " +  classes["rankValBox"];
    }
    else{
      d3.select("#rank")[0][0].className = classes["rankValBox"];
      d3.select("#value")[0][0].className = classes["rankValBox"];
      d3.select("#"+this.state.plot)[0][0].className += " " + classes["active"];
    }
    this.setState({'graphType':e.target.id});
  }

  _setDataType (e){
    console.log(d3.selectAll("."+classes["rawRelBox"]))
    
    d3.selectAll("."+classes["rawRelBox"])[0].forEach(rawRelBox => {
      rawRelBox.className = classes["rawRelBox"];
    })

    e.target.className = classes["active"] + " " + classes["rawRelBox"];

    this.setState({'dataType':e.target.id});
  }

  _setRankVal (e){
    console.log(d3.selectAll("."+classes["rankValBox"]))
    
    d3.selectAll("."+classes["rankValBox"])[0].forEach(rankValBox => {
      rankValBox.className = classes["rankValBox"];
    })

    e.target.className = classes["active"] + " " + classes["rankValBox"];

    this.setState({'plot':e.target.id});
  }

  render () {

    console.log(this.state);
    
    const sectionStyle = {
      height: 200,
      border: '1px solid orangered'
    }

    return (
      <div>
        <div className='container text-center'>
          <div className='row'>
            <div className={'col-xs-3 ' + classes["metricBoxContainer"]}>
              <div id="rankValButtons" className={classes["rankValContainer"]}>
                <div id="rank" onClick={this._setRankVal} className={classes["disabled"] + " " + classes["rankValBox"]}>Rank</div>
                <div id="value" onClick={this._setRankVal} className={classes["disabled"] + " " + classes["active"] + " " + classes["rankValBox"]}>Value</div>
              </div>      
              <div id= "barLineButtons" className={classes["rankValContainer"]}>
                <div id="bar" onClick={this._setBarLine} className={classes["active"] + " " + classes["barLineBox"]}>Bar</div>
                <div id="line" onClick={this._setBarLine} className={classes["barLineBox"]}>Line</div>
              </div>         
              <div onClick={this._setMetric} id="combinedcomposite" className={classes["metricBox"]}>Combined Composite</div>
              <div onClick={this._setMetric} id="densitycomposite" className={classes["active"] + " " + classes["metricBox"]}>Density Composite</div>
              <div onClick={this._setMetric} id="fluiditycomposite" className={classes["metricBox"]}>Fluidity Composite</div>
              <div onClick={this._setMetric} id="diversitycomposite" className={classes["metricBox"]}>Diversity Composite</div>
            </div>
            <div className='col-xs-9'>
                  <NationalMap activeComponent="combined"/>
            </div>
          </div>       
        </div>
        <div className='container-fluid'>
          <div className = 'row'>
            <div className='col-xs-12'>
              <CombinedGraph graphType={this.state.graphType} plot={this.state.plot} dataType={this.state.dataType} selectedMetric={this.state.selectedMetric}/>
            </div>
          </div> 
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({})

export default connect((mapStateToProps), {})(CombinedView)
