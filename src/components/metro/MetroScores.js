import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { loadMetroGdp, loadMetroGdpPerCapita } from 'redux/modules/metroGdpData'
import { loadMetroScores } from 'redux/modules/metroScoresData'
import MetroMap from 'components/maps/MetroMap'
import LineGraph from 'components/graphs/SimpleLineGraph'

export class MetroScoresOverview extends React.Component<void, Props, void> {
  _fetchData () {
    if(!this.props.gdpData[this.props.metroId] || !this.props.gdpData[this.props.metroId].gdp){
      return this.props.loadGdpData(this.props.metroId)
    }
    if(!this.props.gdpData[this.props.metroId] || !this.props.gdpData[this.props.metroId].gdp_per_capita){
      return this.props.loadGdpPerCapita(this.props.metroId)
    }
    if(!this.props.metroScores[this.props.metroId]){
      return this.props.loadMetroScores(this.props.metroId)
    }
  }

  componentDidMount() {
    this._fetchData ()
  }
  
  componentWillReceiveProps (nextProps){
    this._fetchData ()
  }

  hasData () {
    return this.props.gdpData[this.props.metroId] &&
      this.props.gdpData[this.props.metroId].gdp &&
      this.props.gdpData[this.props.metroId].gdp_per_capita &&
      this.props.metroScores[this.props.metroId]      
  }

  render () {
    if (!this.hasData()) return <span />
    console.log('got data', this.props.metroScores[this.props.metroId])
  
    let year = 2012
    let scores = this.props.metroScores[this.props.metroId];
    let combined = scores.combined.composite ?  scores.combined.composite.values.filter(d => { return d.x === year })[0] || {} : {}
    let densityComposite = scores.density.composite.values.filter(d => { return d.x === year })[0] || {}
    let densityNewFirms = scores.density.newFirms.relative.values.filter(d => { return d.x === year })[0] || {}
    let densityShareEmp = scores.density.shareEmp.relative.values.filter(d => { return d.x === year })[0] || {}
    let fluidityComposite = scores.fluidity.composite ? scores.fluidity.composite.values.filter(d => { return d.x === year })[0] || {} : {}
    let fluidityHighRaw = scores.fluidity.highGrowth ? scores.fluidity.highGrowth.raw.values.filter(d => { return d.x === year })[0] || {} : {}
    let fluidityHighGrowth = scores.fluidity.highGrowth ? scores.fluidity.highGrowth.relative.values.filter(d => { return d.x === year })[0] || {} : {}
    let fluidityNetMigration = scores.fluidity.netMigration.relative.values.filter(d => { return d.x === year })[0] || {}
    let fluidityTotalMigration = scores.fluidity.totalMigration.relative.values.filter(d => { return d.x === year })[0] || {}
    let diversityComposite = scores.diversity.composite ? scores.diversity.composite.values.filter(d => { return d.x === year })[0] || {} : {}
    let diversityForeignBorn =  scores.diversity.foreignborn.relative.values.filter(d => { return d.x === year })[0] || {}
    let diversityOppHigh =  scores.diversity.opportunity ? scores.diversity.opportunity.values[1] || {} : {}
    let diversityOppLow =  scores.diversity.opportunity ? scores.diversity.opportunity.values[0] || {} : {}



    console.log('test',combined)

    return (
      <div className='container'>
        <h4>{this.props.metroData.name}</h4>
        Scores
        <div>
          <h4>AEA Composite Index</h4>
          <h4>{combined.y ? combined.y.toLocaleString() : 'NA'}</h4> 
          Rank {combined.rank}
        </div>
        <div className='row' style={{marginBottom: 25}}>
          <div className='col-xs-4'>
            <h4>Density Composite Index</h4>
            <h4>{densityComposite.y.toLocaleString()}</h4>
            Rank {densityComposite.rank}
          </div>
           <div className='col-xs-4'>
            <h4> Firms / 1k </h4>
            <h4>{densityNewFirms.y.toLocaleString()}</h4> 
            Rank {densityNewFirms.rank}
          </div>
            <div className='col-xs-4'>
            <h4> Share of Employment in New Firms </h4>
            <h4>{(100*densityShareEmp.y).toLocaleString()}%</h4> 
            Rank {densityShareEmp.rank}
          </div>
        </div>
        <div className='row' style={{marginBottom: 25}}>
          <div className='col-xs-4'>
            <h4>Fluidity Composite Index</h4>
            <h4>{fluidityComposite.y ? fluidityComposite.y.toLocaleString() : 'NA'}</h4>
            Rank {fluidityComposite.rank}
          </div>
           <div className='col-xs-2'>
            <h4> High Growth Firms / 1k Pop </h4>
            <h4>{fluidityHighGrowth.y ? fluidityHighGrowth.y.toLocaleString() : 'NA'}</h4> 
            Rank {fluidityHighGrowth.rank}
          </div>
          <div className='col-xs-2'>
            <h4> High Growth Firms </h4>
            <h4>{fluidityHighRaw.y ? fluidityHighRaw.y.toLocaleString() : 'NA'}</h4> 
            Rank {fluidityHighRaw.rank}
          </div>
          <div className='col-xs-2'>
            <h4> Net Mirgration (inflow - outflow) </h4>
            <h4>{(fluidityNetMigration.y*100).toLocaleString()}%</h4> 
            Rank {densityShareEmp.rank}
          </div>
          <div className='col-xs-2'>
            <h4> Total Migration (inflow + outflow) </h4>
            <h4>{(fluidityTotalMigration.y*100).toLocaleString()}%</h4> 
            Rank {fluidityTotalMigration.rank}
          </div>
        </div>
        <div className='row' style={{marginBottom: 25}}>
          <div className='col-xs-4'>
            <h4>Diversity Composite Index</h4>
            <h4>{diversityComposite.y ? diversityComposite.y.toLocaleString() : 'NA'}</h4>
            Rank {diversityComposite.rank}
          </div>
           <div className='col-xs-4'>
            <h4> % Foreign Born </h4>
            <h4>{diversityForeignBorn.y.toLocaleString()}</h4> 
            Rank {diversityForeignBorn.rank}
          </div>
          <div className='col-xs-2'>
            <h4> Opportunity for Low Income Children </h4>
            <h4>{(diversityOppLow.y*100).toLocaleString()}</h4> 
            Rank {diversityOppLow.rank}
          </div>
          <div className='col-xs-2'>
            <h4> Opportunity for High Income Children </h4>
            <h4>{(diversityOppHigh.y*100).toLocaleString()}</h4> 
            Rank {diversityOppHigh.rank}
          </div>
        </div>
      </div>
    )      
  }
}

const mapStateToProps = (state) => {
  return ({
    metroScores : state.metroScoresData,
    gdpData : state.metroGdpData
  })
}

export default connect((mapStateToProps), {
  loadGdpPerCapita: (currentMetro) => loadMetroGdpPerCapita (currentMetro),
  loadGdpData: (currentMetro) => loadMetroGdp (currentMetro),
  loadMetroScores: (currentMetro) => loadMetroScores (currentMetro)  
})(MetroScoresOverview)