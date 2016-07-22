/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import classes from 'styles/sitewide/index.scss'
// import DensityView from 'views/'

export class HomeView extends React.Component<void, Props, void> {
   constructor () {
    super()
    this._bucketClick = this._bucketClick.bind(this)
  }

  _bucketClick(d) {
    if(this.props.onComponentChange){
      this.props.onComponentChange(d.target.id)
    }
  }

  render () {
    
    var bucketDisplay = [];
    var components = ['combined', 'density', 'diversity', 'fluidity']

    components.forEach((v,i) => {
        bucketDisplay.push (
          <a 
            id={v}
            onClick={this._bucketClick} 
            type="button" 
            className={"btn btn-default " + (v == this.props.activeComponent ? classes["active"] : '')}
          >
            { v === 'combined' ? 'EEI' : v }
          </a>
        )   
    })
    
    return (
      <div className='pull-left'>
        <small>Entrepreneurial Ecosystem Index</small><br />
        <div className="btn-group" role="group">
          {bucketDisplay}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  metros : state.metros
})

export default connect((mapStateToProps), {})(HomeView)
