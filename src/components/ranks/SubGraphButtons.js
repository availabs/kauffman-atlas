/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import classes from 'styles/sitewide/index.scss'
// import DensityView from 'views/'

export class SubGraphButtons extends React.Component<void, Props, void> {
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
    console.log(this.props.activeComponent)
    if(this.props.activeComponent == "combined"){
      var components = []      
    }
    if(this.props.activeComponent == "density"){
      var components = ['composite','new firms','share of employment in new firms']      
    }
    if(this.props.activeComponent == "diversity"){
      var components = ['composite','income based on childhood','percentage of foriegn born population']      
    }
    if(this.props.activeComponent == "fluidity"){
      var components = ['composite','high growth firms','net migration','total migration','annual churn']      
    }


    components.forEach((v,i) => {
        bucketDisplay.push (
          <a 
            id={v}
            onClick={this._bucketClick} 
            type="button" 
            className={"btn btn-default " + (v == this.props.metric ? classes["active"] : '')}
          >
            { v }
          </a>
        )   
    })
    
    return (
      <div className='pull-left'>
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

export default connect((mapStateToProps), {})(SubGraphButtons)
