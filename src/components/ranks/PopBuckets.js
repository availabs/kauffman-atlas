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
    d3.selectAll(".popBucket")[0].forEach(bucketDiv => {
      bucketDiv.className = "btn btn-default popBucket";
    })

    //d.target.className = "btn btn-default popBucket " + classes["active"];

    if(this.props.onBucketChange){
      this.props.onBucketChange(d.target.id)
    }
  }

  render () {    
    var bucketDisplay = [];
    this.props.popScale.forEach((v,i) => {
        bucketDisplay.push (
          <a 
            id={i}
            onClick={this._bucketClick} 
            type="button" 
            className={"btn btn-default " + (i == this.props.bucket ? classes["active"] : '')}
          >
            { ((this.props.popScale[i])).toLocaleString()  +  (this.props.popScale[(i+1)] ? " - " + this.props.popScale[(i+1)] : "")}
            <sup>th</sup>
          </a>
        )   
    })
    bucketDisplay.push( 
      <a 
        id="all" 
        onClick={this._bucketClick} 
        type="button" 
        className={"btn btn-default " + ('all' == this.props.bucket ? classes["active"] : '')}
      >
        All Metros
      </a>
    )

    return (
      <div className='pull-right'>
        <small>Metro Population Percentile</small><br />
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
