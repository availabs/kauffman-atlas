/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import MetroMap from 'components/maps/MetroMap'
import MetroZbpCluster from 'components/metro/MetroZbpCluster'
import MetroZbp from 'components/metro/MetroZbp'
import classes from 'styles/sitewide/index.scss'
// import classes from '../national/nationalView.scss'

type Props = {
};

export class MetroHome extends React.Component<void, Props, void> {
  constructor () {
    super()
    this.state = {
     display: 'industry'
    }
    this.renderDisplay = this.renderDisplay.bind(this)
    this._selectDisplay = this._selectDisplay.bind(this)
  }

  _selectDisplay (display) {
    this.setState({display})
  }

  renderDisplay(){
    let metroId = this.props.router.locationBeforeTransitions.pathname.split('/')[2]
    console.log('test', metroId)
    return <span />
    // switch(this.state.display){
    //   case 'industry':
    //     return (
    //        <MetroZbp currentMetro={metroId} year='2012'/>
    //     )
    //   case 'cluster':
    //     return (
    //        <MetroZbpCluster currentMetro={metroId} year='2012'/>
    //     )
    //   default:
    //     return (
    //       <MetroZbp currentMetro={metroId} year='2012'/>
    //     )
    // }
  }

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
      console.log('test 2', metroId, this.props.metros[metroId])
      return (
        <div className='container text-center'>
          <h4>{this.props.metros[metroId].name}</h4>
          <div className='row'>
            <div className={'col-xs-3 ' + classes["metricBoxContainer"]}>
              <div className={classes["selector-buttons"]}>Density</div>
              <div className={classes["selector-buttons"]}>Fluidity</div>
              <div className={classes["selector-buttons"]} onClick={this._selectDisplay.bind(this,'industry')}>Industry Overview</div>
              <div className={classes["selector-buttons"]} onClick={this._selectDisplay.bind(this,'cluster')}>Cluster Overview</div>
            </div>
            <div className='col-xs-9'>
                <MetroMap currentMetro={metroId} />
                Population: {this.props.metros[metroId].pop['2012']}
            </div>
          </div>
          <div className='row'>
            {this.renderDisplay()}
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
