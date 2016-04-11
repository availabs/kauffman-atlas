/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import NationalMap from 'components/maps/NationalMap'

type Props = {
};

export class DiversityView extends React.Component<void, Props, void> {
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
            <div className='col-xs-12'>
              <h4>Diversity View</h4>
                          <NationalMap />
            </div>
          </div>            
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({})

export default connect((mapStateToProps), {})(DiversityView)
