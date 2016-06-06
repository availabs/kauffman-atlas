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
  diversitycomposite: 'Diversity'
}

export class HoverBox extends React.Component<void, Props, void> {
   constructor () {
    super()
    //this.onMouseover = this.onMouseover.bind(this)
  }
  componentWillMount () {    
    this._initGraph();    
  }   
    
  _initGraph () {   
    if(!this.props['densitycomposite']){    
      this.props['getdensitycomposite']()   
    }   
    if(!this.props['fluiditycomposite']){   
      this.props['getfluiditycomposite']()    
    }   
    if(!this.props['diversitycomposite']){    
      this.props['getdiversitycomposite']()   
    }   
    if(!this.props['combinedcomposite']){   
      this.props['getcombinedcomposite']()            
    }           
  }

  
  renderCombinedScores(type,year){

    let categories = {
      combined: ['combinedcomposite', 'densitycomposite', 'fluiditycomposite', 'diversitycomposite']
    }
    return categories[type].map((cat) => {
      let isData = this.props[cat].filter(metro => { 
        return metro.key == this.props.metroId
      })[0] 

      let data = isData ? isData.values : []


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
            {this.renderCombinedScores('combined', 2012)}
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
