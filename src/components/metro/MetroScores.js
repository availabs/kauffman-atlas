import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { loadMetroGdp, loadMetroGdpPerCapita } from 'redux/modules/metroGdpData'
import { loadMetroScores } from 'redux/modules/metroScoresData'
import MetroMap from 'components/maps/MetroMap'
import classes from 'styles/sitewide/index.scss'
import LineGraph from 'components/graphs/SimpleLineGraph'
import ReactTooltip from 'react-tooltip'
import CategoryText from 'components/misc/categoryText'


export class MetroScoresOverview extends React.Component<void, Props, void> {
  constructor (props) {
    super()
    this.state = {
      displayYear:0
    }
    this.hover = this.hover.bind(this)
   }


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

  formatData (data, color='#7d8faf') {
      let output = [{
      key:'',
      strokeWidth: 2,
      color: color,
      values: data
        //.filter(d => { return d.x >= 2001})
        .map((d,i) => {
        return {
          key: d.x,
          values:{
            x: +d.x,
            y: +d.y
          }
        }
      })
    }]
    if(output[0].values[0]){
      let first = output[0].values[0].values.y
      let last = output[0].values[output[0].values.length-1].values.y
      let graphcolor = first > last ? '#db9a36' : '#7d8faf'
      output[0].color = graphcolor
    }
    
    
    return output;
  }

  hover(d){
    this.setState({displayYear:d.point.x});
  }

  render () {
    if (!this.hasData()) return <span />
    //console.log('got data', this.props.metroScores[this.props.metroId])

    let year = 2013
    let scores = this.props.metroScores[this.props.metroId];
    let combined = scores.combined.composite ?  scores.combined.composite.values.filter(d => { return d.x === year })[0] || {} : {}
    let combinedSelected = scores.combined.composite ?  scores.combined.composite.values.filter(d => { return d.x === this.state.displayYear })[0] || null : null
    let combinedGraph = this.formatData(scores.combined.composite ? scores.combined.composite.values : [])

    let densityComposite = scores.density.composite.values.filter(d => { return d.x === year })[0] || {}
    let densityCompositeSelected = scores.density.composite.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let densityCompositeGraph = this.formatData(scores.density.composite.values)
    let densityNewFirms = scores.density.newFirms.relative.values.filter(d => { return d.x === year })[0] || {}
    let densityNewFirmsSelected = scores.density.newFirms.relative.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let densityNewFrirmsGraph = this.formatData(scores.density.newFirms.relative.values)
    let densityShareEmp = scores.density.shareEmp.relative.values.filter(d => { return d.x === year })[0] || {}
    let densityShareEmpSelected = scores.density.shareEmp.relative.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let densityShareEmpGraph = this.formatData(scores.density.shareEmp.relative.values)

    let fluidityComposite = scores.fluidity.composite ? scores.fluidity.composite.values.filter(d => { return d.x === year })[0] || {} : {}
    let fluidityCompositeSelected = scores.fluidity.composite ? scores.fluidity.composite.values.filter(d => { return d.x === this.state.displayYear })[0] || null : null
    let fluidityCompositeGraph = this.formatData(scores.fluidity.composite ? scores.fluidity.composite.values : [])
    let fluidityHighRaw = scores.fluidity.highGrowth ? scores.fluidity.highGrowth.raw.values.filter(d => { return d.x === year })[0] || {} : {}
    let fluidityHighRawSelected = scores.fluidity.highGrowth ? scores.fluidity.highGrowth.raw.values.filter(d => { return d.x === this.state.displayYear })[0] || null : null
    let fluidityHighRawGraph =  this.formatData(scores.fluidity.highGrowth ? scores.fluidity.highGrowth.raw.values.filter(d => { return d.x >= 2007 }) : [])
    let fluidityHighGrowth = scores.fluidity.highGrowth ? scores.fluidity.highGrowth.relative.values.filter(d => { return d.x === year })[0] || {} : {}
    let fluidityHighGrowthSelected = scores.fluidity.highGrowth ? scores.fluidity.highGrowth.relative.values.filter(d => { return d.x === this.state.displayYear })[0] || null : null
    let fluidityHighGrowthGraph =  this.formatData(scores.fluidity.highGrowth ? scores.fluidity.highGrowth.relative.values.filter(d => { return d.x >= 2007 }) : [])
    let fluidityNetMigration = scores.fluidity.netMigration.relative.values.filter(d => { return d.x === year })[0] || {}
    let fluidityNetMigrationSelected = scores.fluidity.netMigration.relative.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let fluidityNetMigrationGraph = this.formatData(scores.fluidity.netMigration.relative.values)
    let fluidityTotalMigration = scores.fluidity.totalMigration.relative.values.filter(d => { return d.x === year })[0] || {}
    let fluidityTotalMigrationSelected = scores.fluidity.totalMigration.relative.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let fluidityTotalMigrationGraph = this.formatData(scores.fluidity.totalMigration.relative.values)
    
    let diversityComposite = scores.diversity.composite ? scores.diversity.composite.values.filter(d => { return d.x === year })[0] || {} : {}
    let diversityCompositeSelected = scores.diversity.composite ? scores.diversity.composite.values.filter(d => { return d.x=== this.state.displayYear })[0] || null : null
    let diversityCompositeGraph = this.formatData(scores.diversity.composite ? scores.diversity.composite.values : [])
    let diversityForeignBorn =  scores.diversity.foreignborn.relative.values.filter(d => { return d.x === year })[0] || {}
    let diversityForeignBornSelected =  scores.diversity.foreignborn.relative.values.filter(d => { return d.x=== this.state.displayYear })[0] || null
    let diversityForeignBornGraph = this.formatData(scores.diversity.foreignborn ? scores.diversity.foreignborn.relative.values : [])
    
    let diversityOppHigh =  scores.diversity.opportunity ? scores.diversity.opportunity.values[1] || {} : {}
    let diversityOppLow =  scores.diversity.opportunity ? scores.diversity.opportunity.values[0] || {} : {}

    let rowStyle = {
      //marginBottom: 25,
      borderTop: '1px solid #5d5d5d'
      //backgroundColor: '#efefef',
      //boxShadow: '2px 2px 2px #5d5d5d'
    }

    let graphBox = {
      borderRight: '1px solid #ccc'
    }
    return (
      <div className='container'> 
        <div className='row' >
          <div className='col-xs-3'>
            <h4 data-tip data-for="composite">Composite Entrepreneurial Ecosystem Index</h4>
            <ReactTooltip 
              id="composite" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{right:170}}
              class={classes['tooltip']}
              delayShow={100}
              delayHide={300}
              event="click"
              eventOff="mouseout"
              >
              <span>{CategoryText.combined}</span>
            </ReactTooltip>
            <div>
              <div className='pull-left'>
                <h4>{combined.y.toLocaleString()}</h4>
                Rank {combined.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{combinedSelected ? combinedSelected.y.toLocaleString() : ""}</h4>
                {combinedSelected ? "Rank " + combinedSelected.rank : ""}   
                <div>{combinedSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
          </div>
          <div className='col-xs-6'>
            <div>
              <LineGraph hover={this.hover} data={combinedGraph} uniq='compGraph' options={{height: 100}} />
              <span className='pull-left'>{combinedGraph[0].values[0].key}</span>
              <span className='pull-right'>{combinedGraph[0].values[combinedGraph[0].values.length-1].key}</span>
            </div>
          </div>
        </div>
        <div className='row' style={rowStyle}>
          <h4>Density</h4>
          <div className='col-xs-4' style={graphBox}>
            <h4 data-tip data-for="density">Density Composite Index</h4>
            <ReactTooltip 
              id="density" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{right:170}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.density}</span>
            </ReactTooltip>
            <div>
              <div className='pull-left'>
                <h4>{densityComposite.y.toLocaleString()}</h4>
                Rank {densityComposite.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{densityCompositeSelected ? densityCompositeSelected.y.toLocaleString() : ""}</h4>
                {densityCompositeSelected ? "Rank " + densityCompositeSelected.rank : ""}   
                <div>{densityCompositeSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={densityCompositeGraph} uniq='densityCompGraph' options={{height: 50}} />
              <span className='pull-left'>{densityCompositeGraph[0].values[0].key}</span>
              <span className='pull-right'>{densityCompositeGraph[0].values[densityCompositeGraph[0].values.length-1].key}</span>
            </div>
          </div>
           <div className='col-xs-4' style={graphBox}>
            <h4> New Firms / 1k Pop</h4>
            <div>
              <div className='pull-left'>
                <h4>{densityNewFirms.y.toLocaleString()}</h4>
                Rank {densityNewFirms.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{densityNewFirmsSelected ? densityNewFirmsSelected.y.toLocaleString() : ""}</h4>
                {densityNewFirmsSelected ? "Rank " + densityNewFirmsSelected.rank : ""}   
                <div>{densityNewFirmsSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={densityNewFrirmsGraph} uniq='densityNewFirsmGraph' options={{height: 50}} />
              <span className='pull-left'>{densityNewFrirmsGraph[0].values[0].key}</span>
              <span className='pull-right'>{densityNewFrirmsGraph[0].values[densityNewFrirmsGraph[0].values.length-1].key}</span>
            </div>
          </div>
            <div className='col-xs-4'>
            <h4> Share of Employment in New Firms </h4>
            <div>
              <div className='pull-left'>
                <h4>{(100*densityShareEmp.y).toLocaleString()}%</h4>
                Rank {densityShareEmp.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{densityShareEmpSelected ? (100*densityShareEmpSelected.y).toLocaleString() + "%" : ""}</h4>
                {densityShareEmpSelected ? "Rank " + densityShareEmpSelected.rank : ""}   
                <div>{densityShareEmpSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={densityShareEmpGraph} uniq='densityShareEmpGraph' options={{height: 50}} />
              <span className='pull-left'>{densityShareEmpGraph[0].values[0].key}</span>
              <span className='pull-right'>{densityShareEmpGraph[0].values[densityShareEmpGraph[0].values.length-1].key}</span>
            </div>
          </div>
        </div>
        <div className='row' style={rowStyle}>
          <h4>Fluidity</h4>
          <div className='col-xs-4' style={graphBox}>
            <h4 data-tip data-for="fluidity">Fluidity Composite Index</h4>
            <ReactTooltip 
              id="fluidity" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{right:170}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.fluidity}</span>
            </ReactTooltip>
            <div>
              <div className='pull-left'>
                <h4>{fluidityComposite.y.toLocaleString()}</h4>
                Rank {fluidityComposite.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{fluidityCompositeSelected ? fluidityCompositeSelected.y.toLocaleString() : ""}</h4>
                {fluidityCompositeSelected ? "Rank " + fluidityCompositeSelected.rank : ""}   
                <div>{fluidityCompositeSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={fluidityCompositeGraph} uniq='fluidityCompositeGraph' options={{height: 50}} />
              <span className='pull-left'>{fluidityCompositeGraph[0].values[0].key}</span>
              <span className='pull-right'>{fluidityCompositeGraph[0].values[fluidityCompositeGraph[0].values.length-1].key}</span>
            </div>
          </div>
           <div className='col-xs-2' style={graphBox}>
            <h4> High Growth Firms / Total Firms </h4>
            <div>
              <div className='pull-left'>
                <h4>{fluidityHighGrowth.y.toLocaleString()}</h4>
                Rank {fluidityHighGrowth.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{fluidityHighGrowthSelected ? fluidityHighGrowthSelected.y.toLocaleString() : ""}</h4>
                {fluidityHighGrowthSelected ? "Rank " + fluidityHighGrowthSelected.rank : ""}   
                <div>{fluidityHighGrowthSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={fluidityHighGrowthGraph} uniq='fluidityHighGrowthGraph' options={{height: 50}} />
              <span className='pull-left'>{fluidityHighGrowthGraph[0].values[0].key}</span>
              <span className='pull-right'>{fluidityHighGrowthGraph[0].values[fluidityHighGrowthGraph[0].values.length-1].key}</span>
            </div>           
          </div>
          <div className='col-xs-2' style={graphBox}>
            <h4> High Growth Firms </h4>
            <div>
              <div className='pull-left'>
                <h4>{fluidityHighRaw.y.toLocaleString()}</h4>
                Rank {fluidityHighRaw.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{fluidityHighRawSelected ? fluidityHighRawSelected.y ? fluidityHighRawSelected.y.toLocaleString() : "" : ""}</h4>
                {fluidityHighRawSelected ? fluidityHighRawSelected.y ? "Rank " + fluidityHighRawSelected.rank : "" : ""}   
                <div>{fluidityHighRawSelected ? fluidityHighRawSelected.y ? this.state.displayYear : "" : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={fluidityHighRawGraph} uniq='fluidityHighRawGraph' options={{height: 50}} />
              <span className='pull-left'>{fluidityHighRawGraph[0].values[0].key}</span>
              <span className='pull-right'>{fluidityHighRawGraph[0].values[fluidityHighRawGraph[0].values.length-1].key}</span>
            </div>
          </div>
          <div className='col-xs-2' style={graphBox}>
            <h4> Net Mirgration</h4>
            <small> (inflow - outflow) </small>
            <div>
              <div className='pull-left'>
                <h4>{(100*fluidityNetMigration.y).toLocaleString()}%</h4>
                Rank {fluidityNetMigration.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{fluidityNetMigrationSelected ? (100*fluidityNetMigrationSelected.y).toLocaleString() + "%" : ""}</h4>
                {fluidityNetMigrationSelected ? "Rank " + fluidityNetMigrationSelected.rank : ""}   
                <div>{fluidityNetMigrationSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={fluidityNetMigrationGraph} uniq='fluidityNetMigrationGraph' options={{height: 50}} />
              <span className='pull-left'>{fluidityNetMigrationGraph[0].values[0].key}</span>
              <span className='pull-right'>{fluidityNetMigrationGraph[0].values[fluidityNetMigrationGraph[0].values.length-1].key}</span>
            </div>
          </div>
          <div className='col-xs-2'>
            <h4> Total Migration</h4>
            <small> (inflow + outflow) </small>
            <div>
              <div className='pull-left'>
                <h4>{(100*fluidityTotalMigration.y).toLocaleString()}%</h4>
                Rank {fluidityTotalMigration.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{fluidityTotalMigrationSelected ? (100*fluidityTotalMigrationSelected.y).toLocaleString() + "%" : ""}</h4>
                {fluidityTotalMigrationSelected ? "Rank " + fluidityTotalMigrationSelected.rank : ""}   
                <div>{fluidityTotalMigrationSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={fluidityTotalMigrationGraph} uniq='fluidityTotalMigrationGraph' options={{height: 50}} />
              <span className='pull-left'>{fluidityTotalMigrationGraph[0].values[0].key}</span>
              <span className='pull-right'>{fluidityTotalMigrationGraph[0].values[fluidityTotalMigrationGraph[0].values.length-1].key}</span>
            </div>
          </div>
        </div>
        <div className='row' style={rowStyle}>
          <h4>Diversity</h4>
          <div className='col-xs-4' style={graphBox}>
            <h4 data-tip data-for="diversity">Diversity Composite Index</h4>
            <ReactTooltip 
              id="diversity" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{right:170}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.diversity}</span>
            </ReactTooltip>
            <div>
              <div className='pull-left'>
                <h4>{diversityComposite.y.toLocaleString()}</h4>
                Rank {diversityComposite.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{diversityCompositeSelected ? diversityCompositeSelected.y.toLocaleString() : ""}</h4>
                {diversityCompositeSelected ? "Rank " + diversityCompositeSelected.rank : ""}   
                <div>{diversityCompositeSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={diversityCompositeGraph} uniq='diversityCompositeGraph' options={{height: 50}} />
              <span className='pull-left'>{diversityCompositeGraph[0].values[0] ? diversityCompositeGraph[0].values[0].key : ''}</span>
              <span className='pull-right'>{diversityCompositeGraph[0].values[0] ? diversityCompositeGraph[0].values[diversityCompositeGraph[0].values.length-1].key : ''}</span>
            </div>
          </div>
           <div className='col-xs-4' style={graphBox}>
            <h4> % Foreign Born </h4>
            <div>
              <div className='pull-left'>
                <h4>{(100*diversityForeignBorn.y).toLocaleString()}%</h4>
                Rank {diversityForeignBorn.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{diversityForeignBornSelected ? (100*diversityForeignBornSelected.y).toLocaleString() + "%" : ""}</h4>
                {diversityForeignBornSelected ? "Rank " + diversityForeignBornSelected.rank : ""}   
                <div>{diversityForeignBornSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={diversityForeignBornGraph} uniq='diversityForeignBornGraph' options={{height: 50}} />
              <span className='pull-left'>{diversityForeignBornGraph[0].values[0].key}</span>
              <span className='pull-right'>{diversityForeignBornGraph[0].values[diversityForeignBornGraph[0].values.length-1].key}</span>
            </div>
          </div>
          <div className='col-xs-2' style={graphBox}>
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