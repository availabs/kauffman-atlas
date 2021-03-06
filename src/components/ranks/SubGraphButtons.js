/* @flow */
import React from 'react'
import { connect } from 'react-redux'
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
    let names = {
      'composite': 'Composite',
      'new firms': 'New Firms / 1k' ,
      'share of employment in new firms' : '% Employment in New Firms',
      'shareEmpNoAccRet' : '% Employment in Traded New Firms',
      'shareEmpHighTech' : '% Employment in High Tech New Firms',
      'income based on childhood' : 'Equality of Opportunity',
      'percentage of foreign born population' : '% Foreign Born',
      'employment location quotient variance' : 'Economic Diversity',
      'employment hhi' : 'HHI',
      'high growth firms' : 'High Growth Firms',
      'net migration' : 'Net Migration',
      'total migration' : 'Population Flux',
      'annual churn' : 'Employment Churn'
    }

    var bucketDisplay = [];
    if(this.props.activeComponent == "combined"){
      var components = []      
    }
    if(this.props.activeComponent == "density"){
      var components = ['composite', 'new firms','share of employment in new firms','shareEmpNoAccRet','shareEmpHighTech' ] 
    }
    if(this.props.activeComponent == "diversity"){
      var components = ['composite','income based on childhood','percentage of foreign born population','employment location quotient variance', 'employment hhi']      
    }
    if(this.props.activeComponent == "fluidity"){
      var components = ['composite','high growth firms','net migration','total migration','annual churn']      
    }

    if(this.props.pull && this.props.pull == "right"){
      var className = "pull-right"
    }
    else{
      var className = "pull-left"
    }

    components.forEach((v) => {
        bucketDisplay.push (
          <a 
            id={v}
            onClick={this._bucketClick} 
            type="button" 
            className={"btn btn-default " + "pull-left" + " " + (v == this.props.metric ? classes["active"] : '')}
          >
            { names[v] }
          </a>
        )   
    })
    

    return (
      <div className="pull-right">
        <div className={"btn-group " + className} role="group">
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
