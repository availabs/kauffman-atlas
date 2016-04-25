/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import classes from './nationalView.scss'
import DensityGraph from '../../components/graphs/DensityGraph.js'
import NationalMap from 'components/maps/NationalMap'

type Props = {
};

export class DensityView extends React.Component<void, Props, void> {
  static propTypes = {};

  constructor () {
    super()
    this.state = {
      'selectedMetric':0
    }
    this._setMetric = this._setMetric.bind(this)
  }

  _setMetric (e){
    console.log(d3.selectAll("."+classes["metricBox"]))
    
    d3.selectAll("."+classes["metricBox"])[0].forEach(metricBox => {
      metricBox.className = classes["metricBox"];
    })

    e.target.className = classes["active"] + " " + classes["metricBox"];

    this.setState({'selectedMetric':e.target.id});
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
              <div onClick={this._setMetric} id="0" className={classes["metricBox"]}>Overall Density</div>
              <div onClick={this._setMetric} id="share" className={classes["active"] + " " + classes["metricBox"]}>Share of Employment in New Firms</div>
              <div onClick={this._setMetric} id="newValues" className={classes["metricBox"]}>New firms per 1000</div>
              <div onClick={this._setMetric} id="3" className={classes["metricBox"]}>Sector Density</div>
            </div>
            <div className='col-xs-9'>
                  <NationalMap />
                  <DensityGraph selectedMetric={this.state.selectedMetric}/>
            </div>

          </div>            
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({})

export default connect((mapStateToProps), {})(DensityView)
