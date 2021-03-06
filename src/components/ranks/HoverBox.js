//* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { browserHistory } from 'react-router'
import classes from 'styles/sitewide/index.scss'
import d3 from 'd3'
import { loadDensityComposite,loadNewValues,loadShare,loadShareEmpNoAccRet,loadShareEmpHighTech, } from 'redux/modules/densityData'   
import { loadFluidityComposite,loadInc5000Data, loadNetMigrationIrs, loadTotalMigration,loadAnnualChurn } from 'redux/modules/fluidityData'    
import { loadDiversityComposite,loadOpportunityData,loadForeignBornData,loadEmpVarianceData,loadEmpHHIData } from 'redux/modules/diversityData'    
import { loadCombinedComposite } from 'redux/modules/combinedData'
import CategoryNames from 'components/misc/categoryNames'
import CategoryUnits from 'components/misc/categoryUnits'

let roundFormat = d3.format(".2f")

let categories = {
  combined: ['combinedcomposite', 'densitycomposite', 'fluiditycomposite', 'diversitycomposite'],
  density: ['densitycomposite','densitynewfirms', 'densityshareofemploymentinnewfirms','densityshareEmpNoAccRet','densityshareEmpHighTech'],
  diversity: ['diversitycomposite','diversityincomebasedonchildhood','diversitypercentageofforeignbornpopulation','diversityemploymentlocationquotientvariance','diversityemploymenthhi'],
  fluidity: ['fluiditycomposite','fluidityhighgrowthfirms','fluiditynetmigration','fluiditytotalmigration','fluidityannualchurn'],
  qwiDensity: ['qwiDensityshareEmpAll','qwiDensityshareEmpInfo','qwiDensityshareEmpPro']      
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
      let fulldata = this.props[cat] && this.props[cat].relative ? this.props[cat].relative : this.props[cat]

      fulldata = fulldata || [];

      let isData = fulldata.filter(metro => { 
        return metro.key == this.props.metroId
      })[0]

      let data = isData && isData.values ? isData.values : []

      let score = {};
      if(cat == 'diversityincomebasedonchildhood'){
        score = data.filter(d => 
          { return d.x === 'combined' })[0] || {}    
      }
      else{
        score = data.filter(d => 
          { return d.x === year })[0] || {}        
      }

      console.log()

      return (
        <tr>
          <td style={{fontSize: 10}}>{CategoryNames[cat]}</td>
          <td style={{textAlign: 'center', fontSize: 12}}>{score.rank ? score.rank : ""}</td>
          <td style={{textAlign: 'center', fontSize: 12}}>{(score.score || score.score === 0) ? roundFormat(score.score) : ""}</td>
          <td style={{textAlign: 'center', fontSize: 12}}>{CategoryNames[cat].split(' ').length > 1 ? (score.y || score.y === 0) ? roundFormat(score.y) + ((CategoryUnits[CategoryNames[cat]] == "%") ? "%" : '') : "" : ""}</td>
        </tr>
      )
    }) 
  }
      
  render () {
    if(!this.props.metroId) return (<span />)

    let year = this.props.year ? this.props.year : 2013;

    return (
      <div style={{margin:0, marginTop:10, backgroundColor: 'rgb(125, 143, 175)', color:'#f5f5f5', borderRadius: 3}}>
        <div className = 'row'>
          <h4 style={{textAlign: 'left', paddingLeft: 25, paddingRight: 25}}>
          <small style={{color:'#f5f5f5'}}>
            {this.props.metros[this.props.metroId] ? this.props.metros[this.props.metroId].name.split('-').join(' ') : ''}
          </small>
          </h4>
          <h4 style={{textAlign: 'center'}}>
            <small style={{color:'#f5f5f5'}}>
              {year}
            </small>
          </h4>
        </div> 
        <table className='table'>
          <thead>
            <tr>
              <th />
              <th style={{fontSize:12}}>Rank</th>
              <th style={{fontSize:12}}>Score</th>
              <th style={{fontSize:12}}>Value</th>
            </tr>
          </thead>
          <tbody>
            {this.renderCombinedScores(this.props.activeComponent, year)}
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
  densityshareEmpNoAccRet:state.densityData.shareEmpNoAccRet,
  densityshareEmpHighTech:state.densityData.shareEmpHighTech,
  fluiditycomposite:state.fluidityData.compositeData,   
  fluidityhighgrowthfirms:state.fluidityData.inc5000,
  fluiditynetmigration:state.fluidityData.irsNet,
  fluiditytotalmigration:state.fluidityData.totalMigrationFlow,
  fluidityannualchurn:state.fluidityData.annualChurn,
  diversitycomposite : state.diversityData.diversitycomposite,    
  diversityincomebasedonchildhood:state.diversityData.opportunity,
  diversitypercentageofforeignbornpopulation:state.diversityData.foreignborn,
  diversityemploymentlocationquotientvariance:state.diversityData.empVariance,
  diversityemploymenthhi:state.diversityData.empHHI,
  combinedcomposite : state.combinedData.combinedcomposite,
  metros : state.metros,
})

export default connect((mapStateToProps), {
  getdensitycomposite: () => loadDensityComposite(),
  getdensitynewfirms: () => loadNewValues(),
  getdensityshareofemploymentinnewfirms: () => loadShare(),  
  getdensityshareEmpNoAccRet: () => loadShareEmpNoAccRet(),
  getdensityshareEmpHighTech: () => loadShareEmpHighTech(),     
  getfluiditycomposite: () => loadFluidityComposite(),    
  getfluidityhighgrowthfirms: () => loadInc5000Data(),
  getfluiditynetmigration: () => loadNetMigrationIrs(),
  getfluiditytotalmigration: () => loadTotalMigration(),
  getfluidityannualchurn:() => loadAnnualChurn(),
  getdiversitycomposite: () => loadDiversityComposite(),    
  getdiversityincomebasedonchildhood: () => loadOpportunityData(),
  getdiversitypercentageofforeignbornpopulation: () => loadForeignBornData(),
  getdiversityemploymentlocationquotientvariance: () => loadEmpVarianceData(),
  getdiversityemploymenthhi: () => loadEmpHHIData(),
  getcombinedcomposite: () => loadCombinedComposite(),
  changeHomeState: (state) => changeHomeState(state)
})(HoverBox)
