/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import classes from './nationalView.scss'
import NationalMap from 'components/maps/NationalMap'

type Props = {
};

export class DensityView extends React.Component<void, Props, void> {
  constructor () {
    super()
    this.state = {
      'selectedMetric':0
    }
  }



  static propTypes = {};

  render () {

    const sectionStyle = {
      height: 200,
      border: '1px solid orangered'
    }

    return (
      <div>
        <div className='container text-center'>
          <div className='row'>
            <div className={'col-xs-3 ' + classes["metricBoxContainer"]}>
              <div className={classes["active"] + " " + classes["metricBox"]}>Overall Density</div>
              <div className={classes["metricBox"]}>Share of Employment in New Firms</div>
              <div className={classes["metricBox"]}>New firms per 1000</div>
              <div className={classes["metricBox"]}>Sector Density</div>
            </div>
            <div className='col-xs-9'>
                  <NationalMap />
            </div>
          </div>            
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({})

export default connect((mapStateToProps), {})(DensityView)
