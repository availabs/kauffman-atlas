//* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { browserHistory } from 'react-router'
import classes from 'styles/sitewide/index.scss'
import d3 from 'd3'
import { loadDensityComposite,loadNewValues,loadShare } from 'redux/modules/densityData'   
import { loadFluidityComposite,loadInc5000Data, loadNetMigrationIrs, loadTotalMigration,loadAnnualChurn } from 'redux/modules/fluidityData'    
import { loadDiversityComposite,loadOpportunityData,loadForeignBornData } from 'redux/modules/diversityData'    
import { loadCombinedComposite } from 'redux/modules/combinedData'
let roundFormat = d3.format(".2f")
let categeoryNames = {
  combinedcomposite: 'Combined',
  densitycomposite: 'Density',
  fluiditycomposite: 'Fluidity',
  diversitycomposite: 'Diversity',
  densitynewfirms: 'New Firms per 1k Pop',
  densityshareofemploymentinnewfirms: '% Emp in New Firms',
  diversityincomebasedonchildhood: 'Equality of Opportunity',
  diversitypercentageofforiegnbornpopulation: '% Foreign Born',
  fluidityhighgrowthfirms: 'High Growth Firms',
  fluiditynetmigration: 'Net Migration',
  fluiditytotalmigration: 'Total Migration',
  fluidityannualchurn: 'Employee Churn'
}

let categories = {
  combined: ['combinedcomposite', 'densitycomposite', 'fluiditycomposite', 'diversitycomposite'],
  density: ['densitycomposite','densitynewfirms', 'densityshareofemploymentinnewfirms'],
  diversity: ['diversitycomposite','diversityincomebasedonchildhood','diversitypercentageofforiegnbornpopulation'],
  fluidity: ['fluiditycomposite','fluidityhighgrowthfirms','fluiditynetmigration','fluiditytotalmigration','fluidityannualchurn']
}

export class HoverBox extends React.Component<void, Props, void> {
  constructor () {
    super()
    //this.onMouseover = this.onMouseover.bind(this)
  }
 
    
  _checkData (type) {         
    let hasdata = true;
    categories[type].forEach((cat) => {
      if(!this.props[cat]){
        this.props['get'+cat]()
        hasdata = false
      }
    })
    return hasdata
  }

  
  renderCombinedScores(type,year){

    if(!this._checkData(type)){
      return (<tr />)
    }
    return categories[type].map((cat) => {
      console.log('props cat', cat, this.props[cat])
      let fulldata = this.props[cat] && this.props[cat].relative ? this.props[cat].relative : this.props[cat]
      fulldata = fulldata || []
      let isData = fulldata.filter(metro => { 
        return metro.key == this.props.metroId
      })[0]
      console.log('isData', isData)
      let data = isData && isData.values ? isData.values : []
      console.log('test data', data)
      let score = data.filter(d => 
        { return d.x === year })[0] || {}

        return (
          <tr>
            <td>{categeoryNames[cat]}</td>
            <td>{score.rank}</td>
            <td>{ roundFormat(score.y)}</td>
          </tr>
        )
    }) 
  }
      
  render () {
    //console.log('the metro',)
    if(!this.props.metroId) return (<span />)
    return (
      <div style={{margin:0, marginTop:10, backgroundColor: 'rgb(125, 143, 175)', color:'#f5f5f5', borderRadius: 3}}>
        <div className = 'row'>
        <h4 style={{textAlign: 'center'}}>
          <small style={{color:'#f5f5f5'}}>
            {this.props.metros[this.props.metroId] ? this.props.metros[this.props.metroId].name : ''}
          </small>
          </h4>
        </div> 
        <table className='table'>
          <thead>
            <tr>
              <th />
              <th>Rank</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {this.renderCombinedScores(this.props.activeComponent, 2012)}
          </tbody>
        </table>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  densitycomposite:state.densityData.compositeData,    
  densitynewfirms:state.densityData.newValuesData,
  densityshareofemploymentinnewfirms:state.densityData.shareData,
  fluiditycomposite:state.fluidityData.compositeData,   
  fluidityhighgrowthfirms:state.fluidityData.inc5000,
  fluiditynetmigration:state.fluidityData.irsNet,
  fluiditytotalmigration:state.fluidityData.totalMigrationFlow,
  fluidityannualchurn:state.fluidityData.annualChurn,
  diversitycomposite : state.diversityData.diversitycomposite,    
  diversityincomebasedonchildhood:state.diversityData.opportunity,
  diversitypercentageofforiegnbornpopulation:state.diversityData.foreignborn,
  combinedcomposite : state.combinedData.combinedcomposite,
  metros : state.metros
})

export default connect((mapStateToProps), {
  getdensitycomposite: () => loadDensityComposite(),
  getdensitynewfirms: () => loadNewValues(),
  getdensityshareofemploymentinnewfirms: () => loadShare(),    
  getfluiditycomposite: () => loadFluidityComposite(),    
  getfluidityhighgrowthfirms: () => loadInc5000Data(),
  getfluiditynetmigration: () => loadNetMigrationIrs(),
  getfluiditytotalmigration: () => loadTotalMigration(),
  getfluidityannualchurn:() => loadAnnualChurn(),
  getdiversitycomposite: () => loadDiversityComposite(),    
  getdiversityincomebasedonchildhood: () => loadOpportunityData(),
  getdiversitypercentageofforiegnbornpopulation: () => loadForeignBornData(),
  getcombinedcomposite: () => loadCombinedComposite(),
})(HoverBox)
