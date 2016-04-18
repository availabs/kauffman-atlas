/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import MetroMap from 'components/maps/MetroMap'

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
              <div className='col-xs-12'>
                <h4>{this.props.metros[metroId]}</h4>
                <MetroMap currentMetro={metroId} />
              </div>
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
