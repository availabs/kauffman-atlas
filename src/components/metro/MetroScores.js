import React from 'react'
import { connect } from 'react-redux'
import { loadMetroGdp, loadMetroGdpPerCapita } from 'redux/modules/metroGdpData'
import { loadMetroScores } from 'redux/modules/metroScoresData'
import classes from 'styles/sitewide/index.scss'
import LineGraph from 'components/graphs/SimpleLineGraph'
import ReactTooltip from 'react-tooltip'
import CategoryText from 'components/misc/categoryText'
import d3 from 'd3'

let roundFormat = function(input){
  var outFormat = d3.format(".2f");
  var output = outFormat(input);

  if(output == "-0.00"){
    output = "0.00";
  }

  return output;
}

export class MetroScoresOverview extends React.Component<void, Props, void> {
  constructor () {
    super()
    this.state = {
      displayYear:0
    }
    this.hover = this.hover.bind(this)
    this.alignYears = this.alignYears.bind(this)
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

  _trimYears(years,city){
    var newValues = []

    city.values.forEach(yearValue => {
      if(yearValue.x >= years[0] && yearValue.x <= years[1]){
        newValues.push(yearValue);
      }
    })
    var newCity = {
      color:city.color,
      scoreColor:city.scoreColor,
      key:city.key,
      name:city.name,
      values:newValues
    }
    return newCity;
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

    // if(output[0].values[0] && !color){
    //   let first = output[0].values[0].values.y
    //   let last = output[0].values[output[0].values.length-1].values.y
    //   let graphcolor = first > last ? '#db9a36' : '#7d8faf'
    //   output[0].color = graphcolor
    // }
    
    return output;
  }

  alignYears(returnType){
    var metroScores = this.props.metroScores[this.props.metroId],
        natScores = this.props.metroScores["national"];

    var alignedMetro = {},
        alignedNat = {}

    Object.keys(metroScores).forEach(metric => {
      if(typeof metroScores[metric] == "object"){
        if(!alignedMetro[metric]){
          alignedMetro[metric] = {}
        }
        if(!alignedNat[metric]){
          alignedNat[metric] = {}
        }

        Object.keys(metroScores[metric]).forEach(subMetric =>{
          if(typeof metroScores[metric][subMetric] == "object"){
            if(!alignedMetro[metric][subMetric]){
              alignedMetro[metric][subMetric] = {}
            }
            if(!alignedNat[metric][subMetric]){
              alignedNat[metric][subMetric] = {}
            }

            if(Object.keys(metroScores[metric][subMetric]).length <= 2){
              Object.keys(metroScores[metric][subMetric]).forEach(dataset => {
                if(!alignedMetro[metric][subMetric][dataset]){
                  alignedMetro[metric][subMetric][dataset] = {}
                }
                if(!alignedNat[metric][subMetric][dataset]){
                  alignedNat[metric][subMetric][dataset] = {}
                }

                var metroYearRange = ([d3.min(metroScores[metric][subMetric][dataset]['values'],function(c) {return c.x}),
                                    d3.max(metroScores[metric][subMetric][dataset]['values'],function(c) {return c.x})])
                var natYearRange = ([d3.min(natScores[metric][subMetric][dataset]['values'],function(c) {return c.x}),
                                    d3.max(natScores[metric][subMetric][dataset]['values'],function(c) {return c.x})])

                var minYear = d3.max([metroYearRange[0],natYearRange[0]])
                var maxYear = d3.min([metroYearRange[1],natYearRange[1]])

                alignedMetro[metric][subMetric][dataset] = this._trimYears(([minYear,maxYear]),metroScores[metric][subMetric][dataset]);
                alignedNat[metric][subMetric][dataset] = this._trimYears(([minYear,maxYear]),natScores[metric][subMetric][dataset]);
              })             
            }
            else{
              var metroYearRange = ([d3.min(metroScores[metric][subMetric]['values'],function(c) {return c.x}),
                                  d3.max(metroScores[metric][subMetric]['values'],function(c) {return c.x})])
              var natYearRange = ([d3.min(natScores[metric][subMetric]['values'],function(c) {return c.x}),
                                  d3.max(natScores[metric][subMetric]['values'],function(c) {return c.x})])

              var minYear = d3.max([metroYearRange[0],natYearRange[0]])
              var maxYear = d3.min([metroYearRange[1],natYearRange[1]])

              alignedMetro[metric][subMetric] = this._trimYears(([minYear,maxYear]),metroScores[metric][subMetric]);
              alignedNat[metric][subMetric] = this._trimYears(([minYear,maxYear]),natScores[metric][subMetric]);
            }        
          }
        })
      }
    })


    if(returnType == "metro"){
      return alignedMetro;
    }
    else{
      return alignedNat;
    }
  }

  hover(d){
    this.setState({displayYear:d.point.x});
  }

  render () {
    if (!this.hasData()) return <span />
    //console.log('got data', this.props.metroScores[this.props.metroId])
    //console.log(scores.density.shareEmpQWI_ExceptAccomAndRetail.raw)
    let year = 2013
    let scores = this.alignYears("metro");
    let natScores = this.alignYears("national");

    let combined = scores.combined.composite ?  scores.combined.composite.values.filter(d => { return d.x === year })[0] || {} : {}
    let combinedSelected = scores.combined.composite ?  scores.combined.composite.values.filter(d => { return d.x === this.state.displayYear })[0] || null : null
    let combinedGraph = this.formatData(scores.combined.composite ? scores.combined.composite.values : [],scores.combined.composite.scoreColor)
    let combinedNatGraph = this.formatData(natScores.combined.composite ? natScores.combined.composite.values : [],natScores.combined.composite.color)
    let combinedGraphYScale = d3.scale.linear();
    var domainLow = d3.min([d3.min(natScores.combined.composite.values, function(v) { return v.y }),d3.min(scores.combined.composite.values, function(v) { return v.y })])
    var domainHigh = d3.max([d3.max(natScores.combined.composite.values, function(v) { return v.y }),d3.max(scores.combined.composite.values, function(v) { return v.y })])
    combinedGraphYScale.domain([(domainLow - domainLow * 0.05),(domainHigh + domainHigh * 0.05)])


    let densityComposite = scores.density.composite.values.filter(d => { return d.x === year })[0] || {}
    let densityCompositeSelected = scores.density.composite.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let densityCompositeGraph = this.formatData(scores.density.composite.values,scores.density.composite.scoreColor)
    let densityNatCompositeGraph = this.formatData(natScores.density.composite.values,natScores.density.composite.color)
    let densityCompositeGraphYScale = d3.scale.linear();
    var domainLow = d3.min([d3.min(natScores.density.composite.values, function(v) { return v.y }),d3.min(scores.density.composite.values, function(v) { return v.y })])
    var domainHigh = d3.max([d3.max(natScores.density.composite.values, function(v) { return v.y }),d3.max(scores.density.composite.values, function(v) { return v.y })])
    densityCompositeGraphYScale.domain([(domainLow - domainLow * 0.05),(domainHigh + domainHigh * 0.05)])

    let densityNewFirms = scores.density.newFirms.relative.values.filter(d => { return d.x === year })[0] || {}
    let densityNewFirmsSelected = scores.density.newFirms.relative.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let densityNewFirmsGraph = this.formatData(scores.density.newFirms.relative.values,scores.density.newFirms.relative.scoreColor)
    let densityNatNewFirmsGraph = this.formatData(natScores.density.newFirms.relative.values,natScores.density.newFirms.relative.color)    
    let densityNewFirmsGraphYScale = d3.scale.linear();
    var domainLow = d3.min([d3.min(natScores.density.newFirms.relative.values, function(v) { return v.y }),d3.min(scores.density.newFirms.relative.values, function(v) { return v.y })])
    var domainHigh = d3.max([d3.max(natScores.density.newFirms.relative.values, function(v) { return v.y }),d3.max(scores.density.newFirms.relative.values, function(v) { return v.y })])
    densityNewFirmsGraphYScale.domain([(domainLow - domainLow * 0.05),(domainHigh + domainHigh * 0.05)])

    let densityShareEmp = scores.density.shareEmp.relative.values.filter(d => { return d.x === year })[0] || {}
    let densityShareEmpSelected = scores.density.shareEmp.relative.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let densityShareEmpGraph = this.formatData(scores.density.shareEmp.relative.values,scores.density.shareEmp.relative.scoreColor)
    let densityNatShareEmpGraph = this.formatData(natScores.density.shareEmp.relative.values,natScores.density.shareEmp.relative.color)
    let densityShareEmpGraphYScale = d3.scale.linear();
    var domainLow = d3.min([d3.min(natScores.density.shareEmp.relative.values, function(v) { return v.y }),d3.min(scores.density.shareEmp.relative.values, function(v) { return v.y })])
    var domainHigh = d3.max([d3.max(natScores.density.shareEmp.relative.values, function(v) { return v.y }),d3.max(scores.density.shareEmp.relative.values, function(v) { return v.y })])
    densityShareEmpGraphYScale.domain([(domainLow - domainLow * 0.05),(domainHigh + domainHigh * 0.05)])

    let densityHighTech = scores.density.shareEmpQWI_HighTech.raw.values.filter(d => { return d.x === year })[0] || {}
    let densityHighTechSelected = scores.density.shareEmpQWI_HighTech.raw.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let densityHighTechGraph = this.formatData(scores.density.shareEmpQWI_HighTech.raw.values,scores.density.shareEmpQWI_HighTech.raw.scoreColor)
    let densityNatHighTechGraph = this.formatData(natScores.density.shareEmpQWI_HighTech.raw.values,natScores.density.shareEmpQWI_HighTech.raw.color)
    let densityHighTechGraphYScale = d3.scale.linear();
    var domainLow = d3.min([d3.min(natScores.density.shareEmpQWI_HighTech.raw.values, function(v) { return v.y }),d3.min(scores.density.shareEmpQWI_HighTech.raw.values, function(v) { return v.y })])
    var domainHigh = d3.max([d3.max(natScores.density.shareEmpQWI_HighTech.raw.values, function(v) { return v.y }),d3.max(scores.density.shareEmpQWI_HighTech.raw.values, function(v) { return v.y })])
    densityHighTechGraphYScale.domain([(domainLow - domainLow * 0.05),(domainHigh + domainHigh * 0.05)])

    let densityExceptAccom = scores.density.shareEmpQWI_ExceptAccomAndRetail.raw.values.filter(d => { return d.x === year })[0] || {}
    let densityExceptAccomSelected = scores.density.shareEmpQWI_ExceptAccomAndRetail.raw.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let densityExceptAccomGraph = this.formatData(scores.density.shareEmpQWI_ExceptAccomAndRetail.raw.values,scores.density.shareEmpQWI_ExceptAccomAndRetail.raw.scoreColor)
    let densityNatExceptAccomGraph = this.formatData(natScores.density.shareEmpQWI_ExceptAccomAndRetail.raw.values,natScores.density.shareEmpQWI_ExceptAccomAndRetail.raw.color)
    let densityExceptAccomGraphYScale = d3.scale.linear();
    var domainLow = d3.min([d3.min(natScores.density.shareEmpQWI_ExceptAccomAndRetail.raw.values, function(v) { return v.y }),d3.min(scores.density.shareEmpQWI_ExceptAccomAndRetail.raw.values, function(v) { return v.y })])
    var domainHigh = d3.max([d3.max(natScores.density.shareEmpQWI_ExceptAccomAndRetail.raw.values, function(v) { return v.y }),d3.max(scores.density.shareEmpQWI_ExceptAccomAndRetail.raw.values, function(v) { return v.y })])
    densityExceptAccomGraphYScale.domain([(domainLow - domainLow * 0.05),(domainHigh + domainHigh * 0.05)])


    let fluidityComposite = scores.fluidity.composite ? scores.fluidity.composite.values.filter(d => { return d.x === year })[0] || {} : {}
    let fluidityCompositeSelected = scores.fluidity.composite ? scores.fluidity.composite.values.filter(d => { return d.x === this.state.displayYear })[0] || null : null
    let fluidityCompositeGraph = this.formatData(scores.fluidity.composite ? scores.fluidity.composite.values : [],scores.fluidity.composite.scoreColor)
    let fluidityNatCompositeGraph = this.formatData(natScores.fluidity.composite ? natScores.fluidity.composite.values : [],natScores.fluidity.composite.color)
    let fluidityCompositeGraphYScale = d3.scale.linear();
    var domainLow = d3.min([d3.min(natScores.fluidity.composite.values, function(v) { return v.y }),d3.min(scores.fluidity.composite.values, function(v) { return v.y })])
    var domainHigh = d3.max([d3.max(natScores.fluidity.composite.values, function(v) { return v.y }),d3.max(scores.fluidity.composite.values, function(v) { return v.y })])
    fluidityCompositeGraphYScale.domain([(domainLow - domainLow * 0.05),(domainHigh + domainHigh * 0.05)])

    let fluidityHighRaw = scores.fluidity.highGrowth ? scores.fluidity.highGrowth.raw.values.filter(d => { return d.x === year })[0] || {} : {}
    let fluidityHighRawSelected = scores.fluidity.highGrowth ? scores.fluidity.highGrowth.raw.values.filter(d => { return d.x === this.state.displayYear })[0] || null : null
    let fluidityHighRawGraph =  this.formatData(scores.fluidity.highGrowth ? scores.fluidity.highGrowth.raw.values.filter(d => { return d.x >= 2007 }) : [],scores.fluidity.highGrowth.raw.scoreColor)
    let fluidityNatHighRawGraph =  this.formatData(natScores.fluidity.highGrowth ? natScores.fluidity.highGrowth.raw.values.filter(d => { return d.x >= 2007 }) : [],natScores.fluidity.highGrowth.raw.color)    
    let fluidityHighRawGraphYScale = d3.scale.linear();
    var domainLow = d3.min([d3.min(natScores.fluidity.highGrowth.raw.values, function(v) { return v.y }),d3.min(scores.fluidity.highGrowth.raw.values, function(v) { return v.y })])
    var domainHigh = d3.max([d3.max(natScores.fluidity.highGrowth.raw.values, function(v) { return v.y }),d3.max(scores.fluidity.highGrowth.raw.values, function(v) { return v.y })])
    fluidityHighRawGraphYScale.domain([(domainLow - domainLow * 0.05),(domainHigh + domainHigh * 0.05)])

    let fluidityHighGrowth = scores.fluidity.highGrowth ? scores.fluidity.highGrowth.relative.values.filter(d => { return d.x === year })[0] || {} : {}
    let fluidityHighGrowthSelected = scores.fluidity.highGrowth ? scores.fluidity.highGrowth.relative.values.filter(d => { return d.x === this.state.displayYear })[0] || null : null
    let fluidityHighGrowthGraph =  this.formatData(scores.fluidity.highGrowth ? scores.fluidity.highGrowth.relative.values.filter(d => { return d.x >= 2007 }) : [],scores.fluidity.highGrowth.relative.scoreColor)
    let fluidityNatHighGrowthGraph =  this.formatData(natScores.fluidity.highGrowth ? natScores.fluidity.highGrowth.relative.values.filter(d => { return d.x >= 2007 }) : [],natScores.fluidity.highGrowth.relative.color)    
    let fluidityHighGrowthGraphYScale = d3.scale.linear();
    var domainLow = d3.min([d3.min(natScores.fluidity.highGrowth.relative.values, function(v) { return v.y }),d3.min(scores.fluidity.highGrowth.relative.values, function(v) { return v.y })])
    var domainHigh = d3.max([d3.max(natScores.fluidity.highGrowth.relative.values, function(v) { return v.y }),d3.max(scores.fluidity.highGrowth.relative.values, function(v) { return v.y })])
    fluidityHighGrowthGraphYScale.domain([(domainLow - domainLow * 0.05),(domainHigh + domainHigh * 0.05)])

    let fluidityNetMigration = scores.fluidity.netMigration.relative.values.filter(d => { return d.x === year })[0] || {}
    let fluidityNetMigrationSelected = scores.fluidity.netMigration.relative.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let fluidityNetMigrationGraph = this.formatData(scores.fluidity.netMigration.relative.values,scores.fluidity.netMigration.relative.scoreColor)
    let fluidityNatNetMigrationGraph = this.formatData(natScores.fluidity.netMigration.relative.values,natScores.fluidity.netMigration.relative.color)
    let fluidityNetMigrationGraphYScale = d3.scale.linear();
    var domainLow = d3.min([d3.min(natScores.fluidity.netMigration.relative.values, function(v) { return v.y }),d3.min(scores.fluidity.netMigration.relative.values, function(v) { return v.y })])
    var domainHigh = d3.max([d3.max(natScores.fluidity.netMigration.relative.values, function(v) { return v.y }),d3.max(scores.fluidity.netMigration.relative.values, function(v) { return v.y })])
    fluidityNetMigrationGraphYScale.domain([(domainLow - domainLow * 0.05),(domainHigh + domainHigh * 0.05)])

    let fluidityTotalMigration = scores.fluidity.totalMigration.relative.values.filter(d => { return d.x === year })[0] || {}
    let fluidityTotalMigrationSelected = scores.fluidity.totalMigration.relative.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let fluidityTotalMigrationGraph = this.formatData(scores.fluidity.totalMigration.relative.values,scores.fluidity.totalMigration.relative.scoreColor)
    let fluidityNatTotalMigrationGraph = this.formatData(natScores.fluidity.totalMigration.relative.values,natScores.fluidity.totalMigration.relative.color)
    let fluidityTotalMigrationGraphYScale = d3.scale.linear();
    var domainLow = d3.min([d3.min(natScores.fluidity.totalMigration.relative.values, function(v) { return v.y }),d3.min(scores.fluidity.totalMigration.relative.values, function(v) { return v.y })])
    var domainHigh = d3.max([d3.max(natScores.fluidity.totalMigration.relative.values, function(v) { return v.y }),d3.max(scores.fluidity.totalMigration.relative.values, function(v) { return v.y })])
    fluidityTotalMigrationGraphYScale.domain([(domainLow - domainLow * 0.05),(domainHigh + domainHigh * 0.05)])
    


    let diversityComposite = scores.diversity.composite ? scores.diversity.composite.values.filter(d => { return d.x === year })[0] || {} : {}
    let diversityCompositeSelected = scores.diversity.composite ? scores.diversity.composite.values.filter(d => { return d.x=== this.state.displayYear })[0] || null : null
    let diversityCompositeGraph = this.formatData(scores.diversity.composite ? scores.diversity.composite.values : [],scores.diversity.composite.scoreColor)
    let diversityNatCompositeGraph = this.formatData(natScores.diversity.composite ? natScores.diversity.composite.values : [],natScores.diversity.composite.color)
    let diversityCompositeGraphYScale = d3.scale.linear();
    var domainLow = d3.min([d3.min(natScores.diversity.composite.values, function(v) { return v.y }),d3.min(scores.diversity.composite.values, function(v) { return v.y })])
    var domainHigh = d3.max([d3.max(natScores.diversity.composite.values, function(v) { return v.y }),d3.max(scores.diversity.composite.values, function(v) { return v.y })])
    diversityCompositeGraphYScale.domain([(domainLow - domainLow * 0.05),(domainHigh + domainHigh * 0.05)])

    let diversityForeignBorn =  scores.diversity.foreignborn.relative.values.filter(d => { return d.x === year })[0] || {}
    let diversityForeignBornSelected =  scores.diversity.foreignborn.relative.values.filter(d => { return d.x=== this.state.displayYear })[0] || null
    let diversityForeignBornGraph = this.formatData(scores.diversity.foreignborn ? scores.diversity.foreignborn.relative.values : [],scores.diversity.foreignborn.relative.scoreColor)
    let diversityNatForeignBornGraph = this.formatData(natScores.diversity.foreignborn ? natScores.diversity.foreignborn.relative.values : [],natScores.diversity.foreignborn.relative.color)
    let diversityForeignBornGraphYScale = d3.scale.linear();
    var domainLow = d3.min([d3.min(natScores.diversity.foreignborn.relative.values, function(v) { return v.y }),d3.min(scores.diversity.foreignborn.relative.values, function(v) { return v.y })])
    var domainHigh = d3.max([d3.max(natScores.diversity.foreignborn.relative.values, function(v) { return v.y }),d3.max(scores.diversity.foreignborn.relative.values, function(v) { return v.y })])
    diversityForeignBornGraphYScale.domain([(domainLow - domainLow * 0.05),(domainHigh + domainHigh * 0.05)])

    let diversityEmpVariance = scores.diversity.empLQVariance.raw.values.filter(d => { return d.x === year })[0] || {}
    let diversityEmpVarianceSelected = scores.diversity.empLQVariance.raw.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let diversityEmpVarianceGraph = this.formatData(scores.diversity.empLQVariance.raw.values,scores.diversity.empLQVariance.raw.scoreColor)
    let diversityNatEmpVarianceGraph = this.formatData(natScores.diversity.empLQVariance.raw.values,natScores.diversity.empLQVariance.raw.color)    
    let diversityEmpVarianceGraphYScale = d3.scale.linear();
    var domainLow = d3.min([d3.min(natScores.diversity.empLQVariance.raw.values, function(v) { return v.y }),d3.min(scores.diversity.empLQVariance.raw.values, function(v) { return v.y })])
    var domainHigh = d3.max([d3.max(natScores.diversity.empLQVariance.raw.values, function(v) { return v.y }),d3.max(scores.diversity.empLQVariance.raw.values, function(v) { return v.y })])
    diversityEmpVarianceGraphYScale.domain([(domainLow - domainLow * 0.05),(domainHigh + domainHigh * 0.05)])

    let diversityEmpHHI = scores.diversity.empHHI.raw.values.filter(d => { return d.x === year })[0] || {}
    let diversityEmpHHISelected = scores.diversity.empHHI.raw.values.filter(d => { return d.x === this.state.displayYear })[0] || null
    let diversityEmpHHIGraph = this.formatData(scores.diversity.empHHI.raw.values,scores.diversity.empHHI.raw.scoreColor)
    let diversityNatEmpHHIGraph = this.formatData(natScores.diversity.empHHI.raw.values,natScores.diversity.empHHI.raw.color) 
    let diversityEmpHHIGraphYScale = d3.scale.linear();
    var domainLow = d3.min([d3.min(natScores.diversity.empHHI.raw.values, function(v) { return v.y }),d3.min(scores.diversity.empHHI.raw.values, function(v) { return v.y })])
    var domainHigh = d3.max([d3.max(natScores.diversity.empHHI.raw.values, function(v) { return v.y }),d3.max(scores.diversity.empHHI.raw.values, function(v) { return v.y })])
    diversityEmpHHIGraphYScale.domain([(domainLow - domainLow * 0.05),(domainHigh + domainHigh * 0.05)])


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

    if(this.props.research){
      var style = {width:"100%"}
    }
    else{
      var style = {}
    }

    return (
      <div className='container' style={style}> 
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
                <h4>{((combined && roundFormat(combined.y)) || '').toLocaleString()}</h4>
                {combined && combined.rank ? "Rank " + combined.rank : ''}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{((combinedSelected && roundFormat(combinedSelected.y)) || '').toLocaleString()}</h4>
                {combinedSelected && combinedSelected.rank ? "Rank " + combinedSelected.rank : ''}   
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
          <div className='col-xs-2' style={{textAlign:"right",marginTop:"10px"}}>
            <div className="row" style={{marginBottom:"15px"}}><small>Colored lines represents current metro over time</small></div>
            <div className="row"><small>Black lines represents national average over time</small></div>
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
              <div className='pull-left' style={{marginBottom:"15px"}}>
                <h4>{((densityComposite && roundFormat(densityComposite.y)) || '').toLocaleString()}</h4>
                {densityComposite && densityComposite.rank ? "Rank " + densityComposite.rank : ''}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{((densityCompositeSelected && roundFormat(densityCompositeSelected.y)) || '').toLocaleString()}</h4>
                {densityCompositeSelected && densityCompositeSelected.rank ? "Rank " + densityCompositeSelected.rank : ''}   
                <div>{densityCompositeSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} yScale={densityCompositeGraphYScale}  data={densityCompositeGraph} data2={densityNatCompositeGraph} uniq='densityCompGraph' options={{height: 50}} />
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
              <div className='pull-left'  style={{marginBottom:"15px"}}>
                <h4>{((densityNewFirms && roundFormat(densityNewFirms.y)) || '').toLocaleString()}</h4>
                {densityNewFirms && densityNewFirms.rank ? "Rank " + densityNewFirms.rank : ''}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{((densityNewFirmsSelected && roundFormat(densityNewFirmsSelected.y)) || '').toLocaleString()}</h4>
                {densityNewFirmsSelected && densityNewFirmsSelected.rank ? "Rank " + densityNewFirmsSelected.rank : ''}   
                <div>{densityNewFirmsSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} yScale={densityNewFirmsGraphYScale} data={densityNewFirmsGraph} data2={densityNatNewFirmsGraph} uniq='densityNewFirsmGraph' options={{height: 50}} />
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
              <div className='pull-left'  style={{marginBottom:"15px"}}>
                <h4>{(densityShareEmp && densityShareEmp.y) ? 
                      `${roundFormat(densityShareEmp.y)}%` : ''}
                </h4>
                {densityShareEmp && densityShareEmp.rank ? "Rank " + densityShareEmp.rank :''}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(densityShareEmpSelected && densityShareEmpSelected.y) ? 
                      `${roundFormat(densityShareEmpSelected.y)}%` : ''}
                </h4>
                {densityShareEmpSelected && densityShareEmpSelected.rank ? "Rank " + densityShareEmpSelected.rank : ''}   
                <div>{densityShareEmpSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} yScale={densityShareEmpGraphYScale} data={densityShareEmpGraph} data2={densityNatShareEmpGraph} uniq='densityShareEmpGraph' options={{height: 50}} />
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
              <div className='pull-left'  style={{marginBottom:"15px"}}>
                <h4>{(densityHighTech && densityHighTech.y) ? 
                      `${roundFormat(densityHighTech.y)}%` : ''}
                </h4>
                {(densityHighTech && densityHighTech.rank) ? "Rank " + densityHighTech.rank : ''}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(densityHighTechSelected && densityHighTechSelected.y) ? 
                      `${roundFormat(densityHighTechSelected.y)}%` : ''}
                </h4>
                {densityHighTechSelected && densityHighTechSelected.rank ? "Rank " + densityHighTechSelected.rank : ''}   
                <div>{densityHighTechSelected && densityHighTechSelected.y ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} yScale={densityHighTechGraphYScale} data={densityHighTechGraph} data2={densityNatHighTechGraph} uniq='densityHighTechGraph' options={{height: 50}} />
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
              <div className='pull-left'  style={{marginBottom:"15px"}}>
                <h4>{((densityExceptAccom && roundFormat(densityExceptAccom.y)) || '').toLocaleString()}%</h4>
                {densityExceptAccom && densityExceptAccom.rank ? "Rank " + densityExceptAccom.rank : ''}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(densityExceptAccomSelected && densityExceptAccomSelected.y) ? 
                        `${roundFormat(densityExceptAccomSelected.y)}%` : ''}
                </h4>
                {densityExceptAccomSelected  && densityExceptAccomSelected.rank ? "Rank " + densityExceptAccomSelected.rank : ''}   
                <div>{densityExceptAccomSelected  && densityExceptAccomSelected.y ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} yScale={densityExceptAccomGraphYScale} data={densityExceptAccomGraph} data2={densityNatExceptAccomGraph} uniq='densityExceptAccomGraph' options={{height: 50}} />
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
              <div className='pull-left'  style={{marginBottom:"15px"}}>
                <h4>{((fluidityComposite && roundFormat(fluidityComposite.y)) || '').toLocaleString()}</h4>
                {fluidityComposite && fluidityComposite.rank ? "Rank " + fluidityComposite.rank : ''}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{((fluidityCompositeSelected && roundFormat(fluidityCompositeSelected.y)) || '').toLocaleString()}</h4>
                {fluidityCompositeSelected && fluidityCompositeSelected.rank ? "Rank " + fluidityCompositeSelected.rank : ''}   
                <div>{fluidityCompositeSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} yScale={fluidityCompositeGraphYScale} data={fluidityCompositeGraph} data2={fluidityNatCompositeGraph} uniq='fluidityCompositeGraph' options={{height: 50}} />
              <span className='pull-left'>{fluidityCompositeGraph[0].values[0].key}</span>
              <span className='pull-right'>{fluidityCompositeGraph[0].values[fluidityCompositeGraph[0].values.length-1].key}</span>
            </div>
          </div>
           <div className='col-xs-2' style={graphBox}>
            <h4> High Growth Firms / Total Firms </h4>
            <div>
              <div className='pull-left'  style={{marginBottom:"15px"}}>
                <h4>{(fluidityHighGrowth ? ((fluidityHighGrowth.y || fluidityHighGrowth.y === 0) ? roundFormat(fluidityHighGrowth.y) : '') : '').toLocaleString()}</h4>
                {fluidityHighGrowth && fluidityHighGrowth.rank ? "Rank " + fluidityHighGrowth.rank : ''}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(fluidityHighGrowthSelected ? ((fluidityHighGrowthSelected.y || fluidityHighGrowthSelected.y === 0) ? roundFormat(fluidityHighGrowthSelected.y) : '') : '').toLocaleString()}</h4>
                {fluidityHighGrowthSelected && fluidityHighGrowthSelected.rank ? "Rank " + fluidityHighGrowthSelected.rank : ''}   
                <div>{fluidityHighGrowthSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover}  yScale={fluidityHighGrowthGraphYScale} data={fluidityHighGrowthGraph} data2={fluidityNatHighGrowthGraph} uniq='fluidityHighGrowthGraph' options={{height: 50}} />
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
              <div className='pull-left'  style={{marginBottom:"15px"}}>
                <h4>{(fluidityHighRaw ? ((fluidityHighRaw.y || fluidityHighRaw.y === 0) ? roundFormat(fluidityHighRaw.y) : '') : '').toLocaleString()}</h4>
                {fluidityHighRaw && fluidityHighRaw.rank ? "Rank " + fluidityHighRaw.rank : ''}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(fluidityHighRawSelected ? ((fluidityHighRawSelected.y || fluidityHighRawSelected.y === 0) ? roundFormat(fluidityHighRawSelected.y) : '') : '').toLocaleString()}</h4>
                {(fluidityHighRawSelected && fluidityHighRawSelected.y && fluidityHighRawSelected.rank ? "Rank " + fluidityHighRawSelected.rank : '')}   
                <div>{(fluidityHighRawSelected ? ((fluidityHighRawSelected.y || fluidityHighRawSelected.y === 0) ? this.state.displayYear : '') : '')}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} yScale={fluidityHighRawGraphYScale} data={fluidityHighRawGraph} data2={fluidityNatHighRawGraph} uniq='fluidityHighRawGraph' options={{height: 50}} />
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
              <div className='pull-left' style={{marginBottom:"15px"}}>
               <h4>{(fluidityNetMigration && fluidityNetMigration.y) ? 
                        `${roundFormat(fluidityNetMigration.y)}%` : ''}
               </h4>
                {fluidityNetMigration && fluidityNetMigration.rank ? "Rank " + fluidityNetMigration.rank : ''}
                <div>2013</div>
              </div>
              <div className='pull-right'>
               <h4>{(fluidityNetMigrationSelected && fluidityNetMigrationSelected.y) ? 
                        `${roundFormat(fluidityNetMigrationSelected.y)}%` : ''}
               </h4>
                {fluidityNetMigrationSelected && fluidityNetMigrationSelected.rank ? "Rank " + fluidityNetMigrationSelected.rank : ""}   
                <div>{fluidityNetMigrationSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} yScale={fluidityNetMigrationGraphYScale} data={fluidityNetMigrationGraph} data2={fluidityNatNetMigrationGraph} uniq='fluidityNetMigrationGraph' options={{height: 50}} />
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
                        `${roundFormat(fluidityTotalMigration.y)}%` : ''}
               </h4>
                {fluidityTotalMigration && fluidityTotalMigration.rank ? "Rank " + fluidityTotalMigration.rank : ''}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(fluidityTotalMigrationSelected && fluidityTotalMigrationSelected.y) ? 
                        `${roundFormat(fluidityTotalMigrationSelected.y)}%` : ''}
                </h4>
                {fluidityTotalMigrationSelected && fluidityTotalMigrationSelected.rank ? "Rank " + fluidityTotalMigrationSelected.rank : ""}   
                <div>{fluidityTotalMigrationSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} yScale={fluidityTotalMigrationGraphYScale} data={fluidityTotalMigrationGraph} data2={fluidityNatTotalMigrationGraph} uniq='fluidityTotalMigrationGraph' options={{height: 50}} />
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
              <div className='pull-left'  style={{marginBottom:"15px"}}>
                <h4>{((diversityComposite && roundFormat(diversityComposite.y)) || '').toLocaleString()}</h4>
                {diversityComposite && diversityComposite.rank ? "Rank " + diversityComposite.rank : ''}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{((diversityCompositeSelected && roundFormat(diversityCompositeSelected.y)) || '').toLocaleString()}</h4>
                {diversityCompositeSelected && diversityCompositeSelected.rank ? "Rank " + diversityCompositeSelected.rank : ""}   
                <div>{diversityCompositeSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} yScale={diversityCompositeGraphYScale} data={diversityCompositeGraph} data2={diversityNatCompositeGraph} uniq='diversityCompositeGraph' options={{height: 50}} />
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
              <div className='pull-left'  style={{marginBottom:"15px"}}>
                <h4>{(diversityForeignBorn && diversityForeignBorn.y) ? 
                      `${roundFormat(diversityForeignBorn.y)}%` : ''}
                </h4>
                {diversityForeignBorn && diversityForeignBorn.rank ? "Rank " + diversityForeignBorn.rank : ''}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(diversityForeignBornSelected && diversityForeignBornSelected.y) ? 
                      `${roundFormat(diversityForeignBornSelected.y)}%` : ""}
                </h4>
                {diversityForeignBornSelected && diversityForeignBornSelected.rank ? "Rank " + diversityForeignBornSelected.rank : ""}   
                <div>{diversityForeignBornSelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} yScale={diversityForeignBornGraphYScale} data={diversityForeignBornGraph} data2={diversityNatForeignBornGraph} uniq='diversityForeignBornGraph' options={{height: 50}} />
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
              <div className='pull-left'  style={{marginBottom:"15px"}}>
                <h4>{(diversityEmpVariance && diversityEmpVariance.y) ? 
                      `${roundFormat(diversityEmpVariance.y)}%` : ''}
                </h4>
                {diversityEmpVariance && diversityEmpVariance.rank ? "Rank " + diversityEmpVariance.rank : ''}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(diversityEmpVarianceSelected && diversityEmpVarianceSelected.y) ? 
                        `${roundFormat(diversityEmpVarianceSelected.y)}%` : ""}
                </h4>
                {diversityEmpVarianceSelected && diversityEmpVarianceSelected.rank ? "Rank " + diversityEmpVarianceSelected.rank : ""}   
                <div>{diversityEmpVarianceSelected? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} yScale={diversityEmpVarianceGraphYScale} data={diversityEmpVarianceGraph} data2={diversityNatEmpVarianceGraph} uniq='diversityEmpVarianceGraph' options={{height: 50}} />
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
              <div className='pull-left'  style={{marginBottom:"15px"}}>
                <h4>{(diversityEmpHHI && diversityEmpHHI.y && roundFormat(diversityEmpHHI.y)) || ''}</h4>
                {diversityEmpHHI && diversityEmpHHI.rank ? "Rank " + diversityEmpHHI.rank : ''}
                <div>2013</div>
              </div>
              <div className='pull-right'>
                <h4>{(diversityEmpHHISelected && diversityEmpHHISelected.y && roundFormat(diversityEmpHHISelected.y)) || ''}</h4>
                {diversityEmpHHISelected && diversityEmpHHISelected.rank ? "Rank " + diversityEmpHHISelected.rank : ""}   
                <div>{diversityEmpHHISelected ? this.state.displayYear : ""}</div>
              </div>         
            </div>
            <div>
              <LineGraph hover={this.hover} yScale={diversityEmpHHIGraphYScale} data={diversityEmpHHIGraph} data2={diversityNatEmpHHIGraph} uniq='diversityEmpHHIGraph' options={{height: 50}} />
              <span className='pull-left'>{diversityEmpHHIGraph[0].values[0].key}</span>
              <span className='pull-right'>{diversityEmpHHIGraph[0].values[diversityEmpHHIGraph[0].values.length-1].key}</span>
            </div>
          </div>          
          <div className='col-xs-2' style={graphBox}>
            <h4> Opportunity for Low Income Children </h4>
            <h4>{((diversityOppLow  && roundFormat(diversityOppLow.y)) || '').toLocaleString()}</h4> 
            {diversityOppLow && diversityOppLow.rank ? "Rank " + diversityOppLow.rank : ''}
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
            <h4>{((diversityOppHigh && roundFormat(diversityOppHigh.y)) || '').toLocaleString()}</h4> 
            {diversityOppHigh && diversityOppHigh.rank ? "Rank " + diversityOppHigh.rank : ''}
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
