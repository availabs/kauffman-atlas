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
    if(!this.props.metroScores["national"]){
      return this.props.loadMetroScores("national")
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
    return this.props.metroScores[this.props.metroId]      
  }

  formatData (data, color) {
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

    if(output[0].values[0] && !color){
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
    let natScores = this.props.metroScores["national"];

    let combined = scores.combined.composite ?  scores.combined.composite.values.filter(d => { return d.x === year })[0] || {} : {}
    let combinedSelected = scores.combined.composite ?  scores.combined.composite.values.filter(d => { return d.x === this.state.displayYear })[0] || null : null
    let combinedGraph = this.formatData(scores.combined.composite ? scores.combined.composite.values : [],scores.combined.composite.scoreColor)
    let combinedNatGraph = this.formatData(natScores.combined.composite ? natScores.combined.composite.values : [],natScores.combined.composite.color)
    let combinedGraphYScale = d3.scale.linear();
    var domainLow = d3.min([d3.min(natScores.combined.composite.values, function(v) { return v.y }),d3.min(scores.combined.composite.values, function(v) { return v.y })])
    var domainHigh = d3.max([d3.max(natScores.combined.composite.values, function(v) { return v.y }),d3.max(scores.combined.composite.values, function(v) { return v.y })])
    combinedGraphYScale.domain([(domainLow - domainLow * 0.05),(domainHigh + domainHigh * 0.05)])
    //console.log(combinedGraphYScale.domain());

    let densityComposite = scores.density.composite.values.filter(d => { return d.x === year })[0] || {}
    let densityCompositeSelected = scores.density.composite.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let densityCompositeGraph = this.formatData(scores.density.composite.values,scores.density.composite.scoreColor)
    let densityNatCompositeGraph = this.formatData(natScores.density.composite.values,natScores.density.composite.color)


    let densityNewFirms = scores.density.newFirms.relative.values.filter(d => { return d.x === year })[0] || {}
    let densityNewFirmsSelected = scores.density.newFirms.relative.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let densityNewFirmsGraph = this.formatData(scores.density.newFirms.relative.values,scores.density.newFirms.relative.scoreColor)
    let densityNatNewFirmsGraph = this.formatData(natScores.density.newFirms.relative.values,natScores.density.newFirms.relative.color)    

    let densityShareEmp = scores.density.shareEmp.relative.values.filter(d => { return d.x === year })[0] || {}
    let densityShareEmpSelected = scores.density.shareEmp.relative.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let densityShareEmpGraph = this.formatData(scores.density.shareEmp.relative.values,scores.density.shareEmp.relative.scoreColor)
    let densityNatShareEmpGraph = this.formatData(natScores.density.shareEmp.relative.values,natScores.density.shareEmp.relative.color)

    let densityHighTech = scores.density.shareEmpQWI_HighTech.raw.values.filter(d => { return d.x === year })[0] || {}
    let densityHighTechSelected = scores.density.shareEmpQWI_HighTech.raw.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let densityHighTechGraph = this.formatData(scores.density.shareEmpQWI_HighTech.raw.values,scores.density.shareEmpQWI_HighTech.raw.scoreColor)
    let densityNatHighTechGraph = this.formatData(natScores.density.shareEmpQWI_HighTech.raw.values,natScores.density.shareEmpQWI_HighTech.raw.color)

    let densityExceptAccom = scores.density.shareEmpQWI_ExceptAccomAndRetail.raw.values.filter(d => { return d.x === year })[0] || {}
    let densityExceptAccomSelected = scores.density.shareEmpQWI_ExceptAccomAndRetail.raw.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let densityExceptAccomGraph = this.formatData(scores.density.shareEmpQWI_ExceptAccomAndRetail.raw.values,scores.density.shareEmpQWI_ExceptAccomAndRetail.raw.scoreColor)
    let densityNatExceptAccomGraph = this.formatData(natScores.density.shareEmpQWI_ExceptAccomAndRetail.raw.values,natScores.density.shareEmpQWI_ExceptAccomAndRetail.raw.color)


    let fluidityComposite = scores.fluidity.composite ? scores.fluidity.composite.values.filter(d => { return d.x === year })[0] || {} : {}
    let fluidityCompositeSelected = scores.fluidity.composite ? scores.fluidity.composite.values.filter(d => { return d.x === this.state.displayYear })[0] || null : null
    let fluidityCompositeGraph = this.formatData(scores.fluidity.composite ? scores.fluidity.composite.values : [],scores.fluidity.composite.scoreColor)
    let fluidityNatCompositeGraph = this.formatData(natScores.fluidity.composite ? natScores.fluidity.composite.values : [],natScores.fluidity.composite.color)

    let fluidityHighRaw = scores.fluidity.highGrowth ? scores.fluidity.highGrowth.raw.values.filter(d => { return d.x === year })[0] || {} : {}
    let fluidityHighRawSelected = scores.fluidity.highGrowth ? scores.fluidity.highGrowth.raw.values.filter(d => { return d.x === this.state.displayYear })[0] || null : null
    let fluidityHighRawGraph =  this.formatData(scores.fluidity.highGrowth ? scores.fluidity.highGrowth.raw.values.filter(d => { return d.x >= 2007 }) : [],scores.fluidity.highGrowth.raw.scoreColor)
    let fluidityNatHighRawGraph =  this.formatData(natScores.fluidity.highGrowth ? natScores.fluidity.highGrowth.raw.values.filter(d => { return d.x >= 2007 }) : [],natScores.fluidity.highGrowth.raw.color)    

    let fluidityHighGrowth = scores.fluidity.highGrowth ? scores.fluidity.highGrowth.relative.values.filter(d => { return d.x === year })[0] || {} : {}
    let fluidityHighGrowthSelected = scores.fluidity.highGrowth ? scores.fluidity.highGrowth.relative.values.filter(d => { return d.x === this.state.displayYear })[0] || null : null
    let fluidityHighGrowthGraph =  this.formatData(scores.fluidity.highGrowth ? scores.fluidity.highGrowth.relative.values.filter(d => { return d.x >= 2007 }) : [],scores.fluidity.highGrowth.relative.scoreColor)
    let fluidityNatHighGrowthGraph =  this.formatData(natScores.fluidity.highGrowth ? natScores.fluidity.highGrowth.relative.values.filter(d => { return d.x >= 2007 }) : [],natScores.fluidity.highGrowth.relative.color)    

    let fluidityNetMigration = scores.fluidity.netMigration.relative.values.filter(d => { return d.x === year })[0] || {}
    let fluidityNetMigrationSelected = scores.fluidity.netMigration.relative.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let fluidityNetMigrationGraph = this.formatData(scores.fluidity.netMigration.relative.values,scores.fluidity.netMigration.relative.scoreColor)
    let fluidityNatNetMigrationGraph = this.formatData(natScores.fluidity.netMigration.relative.values,natScores.fluidity.netMigration.relative.color)
    
    let fluidityTotalMigration = scores.fluidity.totalMigration.relative.values.filter(d => { return d.x === year })[0] || {}
    let fluidityTotalMigrationSelected = scores.fluidity.totalMigration.relative.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let fluidityTotalMigrationGraph = this.formatData(scores.fluidity.totalMigration.relative.values,scores.fluidity.totalMigration.relative.scoreColor)
    let fluidityNatTotalMigrationGraph = this.formatData(natScores.fluidity.totalMigration.relative.values,natScores.fluidity.totalMigration.relative.color)
    

    let diversityComposite = scores.diversity.composite ? scores.diversity.composite.values.filter(d => { return d.x === year })[0] || {} : {}
    let diversityCompositeSelected = scores.diversity.composite ? scores.diversity.composite.values.filter(d => { return d.x=== this.state.displayYear })[0] || null : null
    let diversityCompositeGraph = this.formatData(scores.diversity.composite ? scores.diversity.composite.values : [],scores.diversity.composite.scoreColor)
    let diversityNatCompositeGraph = this.formatData(natScores.diversity.composite ? natScores.diversity.composite.values : [],natScores.diversity.composite.color)

    let diversityForeignBorn =  scores.diversity.foreignborn.relative.values.filter(d => { return d.x === year })[0] || {}
    let diversityForeignBornSelected =  scores.diversity.foreignborn.relative.values.filter(d => { return d.x=== this.state.displayYear })[0] || null
    let diversityForeignBornGraph = this.formatData(scores.diversity.foreignborn ? scores.diversity.foreignborn.relative.values : [],scores.diversity.foreignborn.relative.scoreColor)
    let diversityNatForeignBornGraph = this.formatData(natScores.diversity.foreignborn ? natScores.diversity.foreignborn.relative.values : [],natScores.diversity.foreignborn.relative.color)
    
    let diversityEmpVariance = scores.diversity.empLQVariance.raw.values.filter(d => { return d.x === year })[0] || {}
    let diversityEmpVarianceSelected = scores.diversity.empLQVariance.raw.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let diversityEmpVarianceGraph = this.formatData(scores.diversity.empLQVariance.raw.values,scores.diversity.empLQVariance.raw.scoreColor)
    let diversityNatEmpVarianceGraph = this.formatData(natScores.diversity.empLQVariance.raw.values,natScores.diversity.empLQVariance.raw.color)    

    let diversityEmpHHI = scores.diversity.empHHI.raw.values.filter(d => { return d.x === year })[0] || {}
    let diversityEmpHHISelected = scores.diversity.empHHI.raw.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let diversityEmpHHIGraph = this.formatData(scores.diversity.empHHI.raw.values,scores.diversity.empHHI.raw.scoreColor)
    let diversityNatEmpHHIGraph = this.formatData(natScores.diversity.empHHI.raw.values,natScores.diversity.empHHI.raw.color)    

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
              <LineGraph hover={this.hover} yScale={combinedGraphYScale} data={combinedGraph} data2={combinedNatGraph} uniq='compGraph' options={{height: 100}} />
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
              <LineGraph hover={this.hover} data={densityCompositeGraph} data2={densityNatCompositeGraph} uniq='densityCompGraph' options={{height: 50}} />
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
              <LineGraph hover={this.hover} data={densityNewFirmsGraph} data2={densityNatNewFirmsGraph} uniq='densityNewFirsmGraph' options={{height: 50}} />
              <span className='pull-left'>{densityNewFirmsGraph[0].values[0].key}</span>
              <span className='pull-right'>{densityNewFirmsGraph[0].values[densityNewFirmsGraph[0].values.length-1].key}</span>
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
              <LineGraph hover={this.hover} data={densityShareEmpGraph} data2={densityNatShareEmpGraph} uniq='densityShareEmpGraph' options={{height: 50}} />
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
                      `${densityHighTech.y.toLocaleString()}%` : 'N/A'}
                </h4>
                {(densityHighTech && densityHighTech.y) ? "Rank " + densityHighTech.rank : "Rank N/A"}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(densityHighTechSelected && densityHighTechSelected.y) ? 
                      `${densityHighTechSelected.y.toLocaleString()}%` : ''}
                </h4>
                {densityHighTechSelected && densityHighTechSelected.y ? "Rank " + densityHighTechSelected.rank : ""}   
                <div>{densityHighTechSelected && densityHighTechSelected.y ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={densityHighTechGraph} data2={densityNatHighTechGraph} uniq='densityHighTechGraph' options={{height: 50}} />
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
                {densityExceptAccomSelected  && densityExceptAccomSelected.y ? "Rank " + densityExceptAccomSelected.rank : ""}   
                <div>{densityExceptAccomSelected  && densityExceptAccomSelected.y ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={densityExceptAccomGraph} data2={densityNatExceptAccomGraph} uniq='densityExceptAccomGraph' options={{height: 50}} />
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
              <LineGraph hover={this.hover} data={fluidityCompositeGraph} data2={fluidityNatCompositeGraph} uniq='fluidityCompositeGraph' options={{height: 50}} />
              <span className='pull-left'>{fluidityCompositeGraph[0].values[0].key}</span>
              <span className='pull-right'>{fluidityCompositeGraph[0].values[fluidityCompositeGraph[0].values.length-1].key}</span>
            </div>
          </div>
           <div className='col-xs-2' style={graphBox}>
            <h4> High Growth Firms / Total Firms </h4>
            <div>
              <div className='pull-left'>
                <h4>{(fluidityHighGrowth ? ((fluidityHighGrowth.y || fluidityHighGrowth.y === 0) ? fluidityHighGrowth.y : '') : '').toLocaleString()}</h4>
                Rank {fluidityHighGrowth.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(fluidityHighGrowthSelected ? ((fluidityHighGrowthSelected.y || fluidityHighGrowthSelected.y === 0) ? fluidityHighGrowthSelected.y : '') : '').toLocaleString()}</h4>
                {fluidityHighGrowthSelected ? "Rank " + fluidityHighGrowthSelected.rank : ""}   
                <div>{fluidityHighGrowthSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={fluidityHighGrowthGraph} data2={fluidityNatHighGrowthGraph} uniq='fluidityHighGrowthGraph' options={{height: 50}} />
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
                <h4>{(fluidityHighRaw ? ((fluidityHighRaw.y || fluidityHighRaw.y === 0) ? fluidityHighRaw.y : '') : '').toLocaleString()}</h4>
                Rank {fluidityHighRaw.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(fluidityHighRawSelected ? ((fluidityHighRawSelected.y || fluidityHighRawSelected.y === 0) ? fluidityHighRawSelected.y : '') : '').toLocaleString()}</h4>
                {(fluidityHighRawSelected ? ((fluidityHighRawSelected.y || fluidityHighRawSelected.y === 0) ? "Rank " + fluidityHighRawSelected.rank : '') : '')}   
                <div>{(fluidityHighRawSelected ? ((fluidityHighRawSelected.y || fluidityHighRawSelected.y === 0) ? this.state.displayYear : '') : '')}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={fluidityHighRawGraph} data2={fluidityNatHighRawGraph} uniq='fluidityHighRawGraph' options={{height: 50}} />
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
              <LineGraph hover={this.hover} data={fluidityNetMigrationGraph} data2={fluidityNatNetMigrationGraph} uniq='fluidityNetMigrationGraph' options={{height: 50}} />
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
              <LineGraph hover={this.hover} data={fluidityTotalMigrationGraph} data2={fluidityNatTotalMigrationGraph} uniq='fluidityTotalMigrationGraph' options={{height: 50}} />
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
              <LineGraph hover={this.hover} data={diversityCompositeGraph} data2={diversityNatCompositeGraph} uniq='diversityCompositeGraph' options={{height: 50}} />
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
              <LineGraph hover={this.hover} data={diversityForeignBornGraph} data2={diversityNatForeignBornGraph} uniq='diversityForeignBornGraph' options={{height: 50}} />
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
              <LineGraph hover={this.hover} data={diversityEmpVarianceGraph} data2={diversityNatEmpVarianceGraph} uniq='diversityEmpVarianceGraph' options={{height: 50}} />
              <span className='pull-left'>{diversityEmpVarianceGraph[0].values[0].key}</span>
              <span className='pull-right'>{diversityEmpVarianceGraph[0].values[diversityEmpVarianceGraph[0].values.length-1].key}</span>
            </div>
          </div>          
          <div className='col-xs-2' style={graphBox}>
            <h4><span data-tip data-for="empHHI" className={"pull-right " + classes['info']}>?</span>Hirschman-Herfindahl Index</h4>
            <ReactTooltip 
              id="empHHI" 
              place="top" 
              type="dark" 
              effect="solid"
              offset={{left:0}}
              class={classes['tooltip']}
              delayShow={350}
              delayHide={200}
              >
              <span>{CategoryText.emphhi}</span>
            </ReactTooltip>
            <div>
              <div className='pull-left'>
                <h4>{(diversityEmpHHI && diversityEmpHHI.y && diversityEmpHHI.y.toFixed(2)) || 'No data'}</h4>
                Rank {diversityEmpHHI.rank}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(diversityEmpHHISelected && diversityEmpHHISelected.y && diversityEmpHHISelected.y.toFixed(2)) || 'No data'}</h4>
                {diversityEmpHHISelected ? "Rank " + diversityEmpHHISelected.rank : ""}   
                <div>{diversityEmpHHISelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} data={diversityEmpHHIGraph} data2={diversityNatEmpHHIGraph} uniq='diversityEmpHHIGraph' options={{height: 50}} />
              <span className='pull-left'>{diversityEmpHHIGraph[0].values[0].key}</span>
              <span className='pull-right'>{diversityEmpHHIGraph[0].values[diversityEmpHHIGraph[0].values.length-1].key}</span>
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
