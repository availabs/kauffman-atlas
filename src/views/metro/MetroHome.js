/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import MetroMap from 'components/maps/MetroMap'
import MetroZbp from 'components/metro/MetroZbp'
import classes from '../national/nationalView.scss'

type Props = {
};

export class MetroHome extends React.Component<void, Props, void> {
  static propTypes = {};

  render () {

    let metroId = this.props.router.locationBeforeTransitions.pathname.split('/')[2]
    if(!this.props.metros[metroId]){
      return (
        <div>
          <div className='container text-center'>
            <div className='row'>
              <div className='col-xs-12'>
                <h4>Invalid Metro Area Code {metroId}</h4>
                {JSON.stringify(this.props.router)}
              </div>
            </div>            
          </div>
        </div>
      ) 
    }
    else{
      return (
        <div>
        <div className='container text-center'>
          <div className='row'>
            <div className={'col-xs-3 ' + classes["metricBoxContainer"]}>
              <div className={classes["active"] + " " + classes["metricBox"]}>Density</div>
              <div className={classes["metricBox"]}>Fluidity</div>
              <div className={classes["metricBox"]}>Diversity</div>
              <div className={classes["metricBox"]}>Composite</div>
            </div>
            <div className='col-xs-9'>
                <MetroMap currentMetro={metroId} />
            </div>
          </div>
          <div className='row'>
            <MetroZbp currentMetro={metroId} />
          </div>           
        </div>
        </div>
      )      
    }

  }
}

const mapStateToProps = (state) => ({
  router : state.router,
  metros : state.metros
})

export default connect((mapStateToProps), {})(MetroHome)
