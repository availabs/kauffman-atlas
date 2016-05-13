/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import classes from './nationalView.scss'
import DiversityGraph from '../../components/graphs/DiversityGraph.js'
import NationalMap from 'components/maps/NationalMap'

type Props = {
};

export class DiversityView extends React.Component<void, Props, void> {
  static propTypes = {};

  constructor () {
    super()
    this.state = {
      'selectedMetric':"foreignBorn",
      'dataType':'relative',
      'plot':'rank'
    }
    this._setMetric = this._setMetric.bind(this)
    this._setDataType = this._setDataType.bind(this)
    this._setRankVal = this._setRankVal.bind(this)
  }

  _setMetric (e){
    //console.log(d3.selectAll("."+classes["metricBox"]))
    
    d3.selectAll("."+classes["metricBox"])[0].forEach(metricBox => {
      metricBox.className = classes["metricBox"];
    })

    e.target.className = classes["active"] + " " + classes["metricBox"];


    if(e.target.id == "opportunity"){
      d3.select("#opportunityButtons")[0][0].className = classes["rawRelContainer"]     
      d3.select("#otherButtons")[0][0].className = classes["hidden"]    
      this.setState({'selectedMetric':e.target.id,'dataType':'composite'});      
    }
    else{
      d3.select("#opportunityButtons")[0][0].className = classes["hidden"] + " " + classes["rawRelContainer"]     
      d3.select("#otherButtons")[0][0].className = ""

      if(e.target.id == "diversitycomposite"){
        d3.select("#raw")[0][0].className = classes["disabled"] + " " + classes["rawRelBox"];
        d3.select("#relative")[0][0].className = classes["disabled"] + " " +  classes["rawRelBox"];
      }
      else{
        d3.select("#raw")[0][0].className = classes["rawRelBox"];
        d3.select("#relative")[0][0].className = classes["rawRelBox"];
        d3.select("#" + this.state.dataType)[0][0].className = classes["active"] + " " +  classes["rawRelBox"];      
      }

      this.setState({'selectedMetric':e.target.id,dataType:'raw'});      
    }

  }

  _setDataType (e){   
    d3.selectAll("."+classes["rawRelBox"])[0].forEach(rawRelBox => {
      rawRelBox.className = classes["rawRelBox"];
    })

    e.target.className = classes["active"] + " " + classes["rawRelBox"];

    this.setState({'dataType':e.target.id});
  }

  _setRankVal (e){
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


      var buttons = (
        <div>   
          <div id="otherButtons">           
            <div className={classes["rawRelContainer"]}>
              <div id="raw" onClick={this._setDataType} className={classes["rawRelBox"]}>Raw</div>
              <div id="relative" onClick={this._setDataType} className={classes["active"] + " " + classes["rawRelBox"]}>Relative</div>
            </div>
            <div className={classes["rankValContainer"]}>
              <div id="rank" onClick={this._setRankVal} className={classes["active"] + " " + classes["rankValBox"]}>Rank</div>
              <div id="value" onClick={this._setRankVal} className={classes["rankValBox"]}>Value</div>
            </div> 
          </div>
          <div id="opportunityButtons" className={classes["hidden"] + " " +classes["rawRelContainer"]}>
            <div id="composite" onClick={this._setDataType} className={classes["active"] + " " + classes["rawRelBox"]}>Composite</div>
            <div id="highIncome" onClick={this._setDataType} className={classes["rawRelBox"]}>High Income</div>
            <div id="lowIncome" onClick={this._setDataType} className={classes["rawRelBox"]}>Low Income</div>
          </div>
        </div>)
    


    return (
      <div>
        <div className='container text-center'>
          <div className='row'>
            <div className={'col-xs-3 ' + classes["metricBoxContainer"]}>
              {buttons}
              <div onClick={this._setMetric} id="diversitycomposite" className={classes["metricBox"]}>Overall Diversity</div>
              <div onClick={this._setMetric} id="foreignBorn" className={classes["active"] + " " + classes["metricBox"]}>Foreign Born Population</div>
              <div onClick={this._setMetric} id="opportunity" className={classes["metricBox"]}>Income Gain/Loss from Childhood Residence</div>
            </div>
            <div className='col-xs-9'>
                <NationalMap />
            </div>
          </div>
          <div className = 'row'>
            <div className='col-xs-6'>
                <DiversityGraph plot={this.state.plot} dataType={this.state.dataType} selectedMetric={this.state.selectedMetric}/>                                          
            </div> 
            <div className='col-xs-6'>
                <DiversityGraph plot={this.state.plot} dataType={this.state.dataType} selectedMetric={this.state.selectedMetric}/>                                          
            </div>
          </div>        
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({})

export default connect((mapStateToProps), {})(DiversityView)
