import React from 'react'
import { connect } from 'react-redux'
import { loadMetroGdp, loadMetroGdpPerCapita } from 'redux/modules/metroGdpData'
import { loadMetroScores } from 'redux/modules/metroScoresData'
import classes from 'styles/sitewide/index.scss'
import LineGraph from 'components/graphs/SimpleLineGraph'
import ReactTooltip from 'react-tooltip'
import CategoryText from 'components/misc/categoryText'


export class MetroScoresOverview extends React.Component<void, Props, void> {
  constructor () {
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
  
  componentWillReceiveProps (){
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
        .filter(d => {
          return d.y != null
        })
        .map((d) => {
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
    console.log('got data', this.props.metroScores[this.props.metroId])

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
    let densityHighTech = scores.density.shareEmpQWI_HighTech.raw.values.filter(d => { return d.x === year })[0] || {}
    let densityHighTechSelected = scores.density.shareEmpQWI_HighTech.raw.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let densityHighTechGraph = this.formatData(scores.density.shareEmpQWI_HighTech.raw.values)
    let densityExceptAccom = scores.density.shareEmpQWI_ExceptAccomAndRetail.raw.values.filter(d => { return d.x === year })[0] || {}
    let densityExceptAccomSelected = scores.density.shareEmpQWI_ExceptAccomAndRetail.raw.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let densityExceptAccomGraph = this.formatData(scores.density.shareEmpQWI_ExceptAccomAndRetail.raw.values)




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
    
    let diversityEmpVariance = scores.diversity.empLQVariance.raw.values.filter(d => { return d.x === year })[0] || {}
    let diversityEmpVarianceSelected = scores.diversity.empLQVariance.raw.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let diversityEmpVarianceGraph = this.formatData(scores.diversity.empLQVariance.raw.values)
    




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
          <div className='col-xs-4'>
            <h4><span data-tip data-for="composite" className={"pull-right " + classes['info']}>?</span>Composite Entrepreneurial Ecosystem Index</h4>
            <ReactTooltip 
              id="composite" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{right:0}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.combined}</span>
            </ReactTooltip>
            <div>
              <div className='pull-left'>
                <h4>{((combined && combined.y) || '').toLocaleString()}</h4>
                Rank {combined.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{((combinedSelected && combinedSelected.y) || '').toLocaleString()}</h4>
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
            <h4><span data-tip data-for="density" className={"pull-right " + classes['info']}>?</span>Density Composite Index</h4>
            <ReactTooltip 
              id="density" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{right:0}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.density}</span>
            </ReactTooltip>
            <div>
              <div className='pull-left'>
                <h4>{((densityComposite && densityComposite.y) || '').toLocaleString()}</h4>
                Rank {densityComposite.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{((densityCompositeSelected && densityCompositeSelected.y) || '').toLocaleString()}</h4>
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
           <div className='col-xs-2' style={graphBox}>
            <h4><span data-tip data-for="newFirms" className={"pull-right " + classes['info']}>?</span>New Firms / 1k pop</h4>
            <ReactTooltip 
              id="newFirms" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{right:0}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.newfirms}</span>
            </ReactTooltip>
            <div>
              <div className='pull-left'>
                <h4>{((densityNewFirms && densityNewFirms.y) || '').toLocaleString()}</h4>
                Rank {densityNewFirms.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{((densityNewFirmsSelected && densityNewFirmsSelected.y) || '').toLocaleString()}</h4>
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
          <div className='col-xs-2' style={graphBox}>
            <h4><span data-tip data-for="shareEmp" className={"pull-right " + classes['info']}>?</span>Share of Employment in New Firms</h4>
            <ReactTooltip 
              id="shareEmp" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.shareofemploymentinnewfirms}</span>
            </ReactTooltip>
            <div>
              <div className='pull-left'>
                <h4>{(densityShareEmp && densityShareEmp.y) ? 
                      `${densityShareEmp.y.toLocaleString()}%` : ''}
                </h4>
                Rank {densityShareEmp.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(densityShareEmpSelected && densityShareEmpSelected.y) ? 
                      `${densityShareEmpSelected.y.toLocaleString()}%` : ''}
                </h4>
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
          <div className='col-xs-2' style={graphBox}>
            <h4><span data-tip data-for="highTech" className={"pull-right " + classes['info']}>?</span>Share of Employment in High Tech Firms</h4>
            <ReactTooltip 
              id="highTech" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{left:100}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.shareEmpHighTech}</span>
            </ReactTooltip>
            <div>
              <div className='pull-left'>
                <h4>{(densityHighTech && densityHighTech.y) ? 
                      `${densityHighTech.y.toLocaleString()}%` : ''}
                </h4>
                Rank {densityHighTech.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(densityHighTechSelected && densityHighTechSelected.y) ? 
                      `${densityHighTechSelected.y.toLocaleString()}%` : ''}
                </h4>
                {densityHighTechSelected ? "Rank " + densityHighTechSelected.rank : ""}   
                <div>{densityHighTechSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={densityHighTechGraph} uniq='densityHighTechGraph' options={{height: 50}} />
              <span className='pull-left'>{densityHighTechGraph[0].values[0].key}</span>
              <span className='pull-right'>{densityHighTechGraph[0].values[densityHighTechGraph[0].values.length-1].key}</span>
            </div>
          </div>
          <div className='col-xs-2'>
            <h4><span data-tip data-for="exceptAccom" className={"pull-right " + classes['info']}>?</span>Share of Employment in New Traded</h4>
            <ReactTooltip 
              id="exceptAccom" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{left:300}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.shareEmpNoAccRet}</span>
            </ReactTooltip>
            <div>
              <div className='pull-left'>
                <h4>{((densityExceptAccom && densityExceptAccom.y) || '').toLocaleString()}%</h4>
                Rank {densityExceptAccom.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(densityExceptAccomSelected && densityExceptAccomSelected.y) ? 
                        `${densityExceptAccomSelected.y.toLocaleString()}%` : ''}
                </h4>
                {densityExceptAccomSelected ? "Rank " + densityExceptAccomSelected.rank : ""}   
                <div>{densityExceptAccomSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={densityExceptAccomGraph} uniq='densityExceptAccomGraph' options={{height: 50}} />
              <span className='pull-left'>{densityExceptAccomGraph[0].values[0].key}</span>
              <span className='pull-right'>{densityExceptAccomGraph[0].values[densityExceptAccomGraph[0].values.length-1].key}</span>
            </div>
          </div>        
        </div>
        <div className='row' style={rowStyle}>
          <h4>Fluidity</h4>
          <div className='col-xs-4' style={graphBox}>
            <h4><span data-tip data-for="fluidity" className={"pull-right " + classes['info']}>?</span>Fluidity Composite Index</h4>
            <ReactTooltip 
              id="fluidity" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{right:0}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.fluidity}</span>
            </ReactTooltip>
            <div>
              <div className='pull-left'>
                <h4>{((fluidityComposite && fluidityComposite.y) || '').toLocaleString()}</h4>
                Rank {fluidityComposite.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{((fluidityCompositeSelected && fluidityCompositeSelected.y) || '').toLocaleString()}</h4>
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
                <h4>{((fluidityHighGrowth && fluidityHighGrowth.y) || '').toLocaleString()}</h4>
                Rank {fluidityHighGrowth.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{((fluidityHighGrowthSelected && fluidityHighGrowthSelected.y) || '').toLocaleString()}</h4>
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
            <h4><span data-tip data-for="highgrowthfirms" className={"pull-right " + classes['info']}>?</span>High Growth Firms</h4>
            <ReactTooltip 
              id="highgrowthfirms" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{left:0}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.highgrowthfirms}</span>
            </ReactTooltip>
            <div>
              <div className='pull-left'>
                <h4>{((fluidityHighRaw && fluidityHighRaw.y) || '').toLocaleString()}</h4>
                Rank {fluidityHighRaw.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{((fluidityHighRawSelected && fluidityHighRawSelected.y) || '').toLocaleString()}</h4>
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
            <h4><span data-tip data-for="netmigration" className={"pull-right " + classes['info']}>?</span>Net Migration</h4>
            <ReactTooltip 
              id="netmigration" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{left:100}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.netmigration}</span>
            </ReactTooltip>
            <small> (inflow - outflow) </small>
            <div>
              <div className='pull-left'>
               <h4>{(fluidityNetMigration && fluidityNetMigration.y) ? 
                        `${fluidityNetMigration.y.toLocaleString()}%` : ''}
               </h4>
                Rank {fluidityNetMigration.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
               <h4>{(fluidityNetMigrationSelected && fluidityNetMigrationSelected.y) ? 
                        `${fluidityNetMigrationSelected.y.toLocaleString()}%` : ''}
               </h4>
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
            <h4><span data-tip data-for="totalmigration" className={"pull-right " + classes['info']}>?</span>Total Migration</h4>
            <ReactTooltip 
              id="totalmigration" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{left:300}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.totalmigration}</span>
            </ReactTooltip>
            <small> (inflow + outflow) </small>
            <div>
              <div className='pull-left'>
               <h4>{(fluidityTotalMigration && fluidityTotalMigration.y) ? 
                        `${fluidityTotalMigration.y.toLocaleString()}%` : ''}
               </h4>
                Rank {fluidityTotalMigration.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(fluidityTotalMigrationSelected && fluidityTotalMigrationSelected.y) ? 
                        `${fluidityTotalMigrationSelected.y.toLocaleString()}%` : ''}
                </h4>
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
            <h4><span data-tip data-for="diversity" className={"pull-right " + classes['info']}>?</span>Diversity Composite Index</h4>
            <ReactTooltip 
              id="diversity" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{right:0}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.diversity}</span>
            </ReactTooltip>
            <div>
              <div className='pull-left'>
                <h4>{((diversityComposite && diversityComposite.y) || '').toLocaleString()}</h4>
                Rank {diversityComposite.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{((diversityCompositeSelected && diversityCompositeSelected.y) || '').toLocaleString()}</h4>
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
          <div className='col-xs-2' style={graphBox}>
            <h4><span data-tip data-for="foreignborn" className={"pull-right " + classes['info']}>?</span>% Foreign Born</h4>
            <ReactTooltip 
              id="foreignborn" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{left:0}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.foreignborn}</span>
            </ReactTooltip>
            <div>
              <div className='pull-left'>
                <h4>{(diversityForeignBorn && diversityForeignBorn.y) ? 
                      `${diversityForeignBorn.y.toLocaleString()}%` : ''}
                </h4>
                Rank {diversityForeignBorn.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(diversityForeignBornSelected && diversityForeignBornSelected.y) ? 
                      `${diversityForeignBornSelected.y.toLocaleString()}%` : ""}
                </h4>
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
            <h4><span data-tip data-for="empVariance" className={"pull-right " + classes['info']}>?</span>Economic Diversity</h4>
            <ReactTooltip 
              id="empVariance" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{left:0}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.emplqvariance}</span>
            </ReactTooltip>
            <div>
              <div className='pull-left'>
                <h4>{(diversityEmpVariance && diversityEmpVariance.y) ? 
                      `${diversityEmpVariance.y.toLocaleString()}%` : ''}
                </h4>
                Rank {diversityEmpVariance.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(diversityEmpVarianceSelected && diversityEmpVarianceSelected.y) ? 
                        `${diversityEmpVarianceSelected.y.toLocaleString()}%` : ""}
                </h4>
                {diversityEmpVarianceSelected ? "Rank " + diversityEmpVarianceSelected.rank : ""}   
                <div>{diversityEmpVarianceSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={diversityEmpVarianceGraph} uniq='diversityEmpVarianceGraph' options={{height: 50}} />
              <span className='pull-left'>{diversityEmpVarianceGraph[0].values[0].key}</span>
              <span className='pull-right'>{diversityEmpVarianceGraph[0].values[diversityEmpVarianceGraph[0].values.length-1].key}</span>
            </div>
          </div>          
          <div className='col-xs-2' style={graphBox}>
            <h4> Opportunity for Low Income Children </h4>
            <h4>{((diversityOppLow  && diversityOppLow.y) || '').toLocaleString()}</h4> 
            Rank {diversityOppLow.rank}
          </div>
          <div className='col-xs-2'>
            <h4><span data-tip data-for="opportunity" className={"pull-right " + classes['info']}>?</span>Opportunity for High Income Children</h4>
            <ReactTooltip 
              id="opportunity" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{left:300}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.opportunity}</span>
            </ReactTooltip>
            <h4>{((diversityOppHigh && diversityOppHigh.y) || '').toLocaleString()}</h4> 
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
