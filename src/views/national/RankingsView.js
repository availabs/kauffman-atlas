//* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { browserHistory } from 'react-router'
import classes from 'styles/sitewide/index.scss'
import d3 from 'd3'
import { loadDensityComposite,loadNewValues,loadShare,loadShareEmpNoAccRet,loadShareEmpHighTech, } from 'redux/modules/densityData'   
import { loadFluidityComposite,loadInc5000Data, loadNetMigrationIrs, loadTotalMigration,loadAnnualChurn } from 'redux/modules/fluidityData'    
import { loadDiversityComposite,loadOpportunityData,loadForeignBornData,loadEmpVarianceData } from 'redux/modules/diversityData'    
import { loadCombinedComposite } from 'redux/modules/combinedData'
import RankingsTable from 'components/tables/RankingsTable'
import HoverBox from 'components/ranks/HoverBox'
import CategoryNames from 'components/misc/categoryNames'
import Select from 'react-select'
import {StickyContainer, Sticky} from 'react-sticky'
import 'react-select/dist/react-select.css';

let roundFormat = d3.format(".2f")

export class RankingsView extends React.Component<void, Props, void> {
   constructor () {
    super()

    this.state = {
      active:'combinedcomposite',
      category:'combined',
      year:2013,
      hoverMetro:null
    }

    this._onHover = this._onHover.bind(this);

  }
  componentWillMount () {    
    this._initGraph();    
  }   
  

  _onHover(feature){ 
    this.setState({hoverMetro:feature});
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


  render () {
    var scope = this;
    if(!this.props[this.state.active]){
      this.props['get'+this.state.active]()
      return <div>Loading...</div>
    }


    var data = Array.isArray(this.props[this.state.active]) ? this.props[this.state.active] : this.props[this.state.active]['relative'] ? this.props[this.state.active]['relative'] : this.props[this.state.active]['raw'] 


    var yearOptions = d3.range(
            [d3.min(data, function(c) { return d3.min(c.values, function(v) { return v.x }); })],
            [d3.max(data, function(c) { return d3.max(c.values, function(v) { return v.x }); })+1]
        ).map(year => {
      return {value:year,label:year}
    })

    if(this.state.active == "diversityincomebasedonchildhood"){
      yearOptions = [
        {value:"lowIncome",label:"Low"},
        {value:"highIncome",label:"High"},
        {value:"combined",label:"Combined"}
      ]
    }

    var metricOptions = [
        {value:{category:"combined",metric:"combinedcomposite"},label:"Combined Composite"},
        {value:{category:"density",metric:"densitycomposite"},label:"Density Composite"},
        {value:{category:"diversity",metric:"diversitycomposite"},label:"Diversity Composite"},
        {value:{category:"fluidity",metric:"fluiditycomposite"},label:"Fluidity Composite"},
        {value:{category:"density",metric:"densitynewfirms"},label:CategoryNames['densitynewfirms']},
        {value:{category:"density",metric:"densityshareofemploymentinnewfirms"},label:CategoryNames['densityshareofemploymentinnewfirms']},
        {value:{category:"density",metric:"densityshareEmpNoAccRet"},label:CategoryNames['densityshareEmpNoAccRet']},
        {value:{category:"density",metric:"densityshareEmpHighTech"},label:CategoryNames['densityshareEmpHighTech']},
        {value:{category:"fluidity",metric:"fluidityhighgrowthfirms"},label:CategoryNames['fluidityhighgrowthfirms']},
        {value:{category:"fluidity",metric:"fluiditynetmigration"},label:CategoryNames['fluiditynetmigration']},
        {value:{category:"fluidity",metric:"fluiditytotalmigration"},label:CategoryNames['fluiditytotalmigration']},
        {value:{category:"fluidity",metric:"fluidityannualchurn"},label:CategoryNames['fluidityannualchurn']},
        {value:{category:"diversity",metric:"diversityincomebasedonchildhood"},label:CategoryNames['diversityincomebasedonchildhood']},
        {value:{category:"diversity",metric:"diversitypercentageofforeignbornpopulation"},label:CategoryNames['diversitypercentageofforeignbornpopulation']},
        {value:{category:"diversity",metric:"diversityemploymentlocationquotientvariance"},label:CategoryNames['diversityemploymentlocationquotientvariance']}
    ]

    function metricSelectChange (value){

      if(value.value.metric == "diversityincomebasedonchildhood"){
        var newYear = "combined"
      }
      else if(scope.state.active == "diversityincomebasedonchildhood"){
        var newYear = 2013;        
      }
      else{
        var newYear = scope.state.year
      }
      scope.setState({active:value.value.metric,category:value.value.category,year:newYear})
    }



    function yearSelectChange (value){
      scope.setState({year:value.value})
    }


    return (
      <div> 
        <h3 style={{textAlign:"center"}}>
          {metricOptions.filter(d => d.value.metric == this.state.active)[0].label}
        </h3>
        <StickyContainer>
          <div className='container' style={{paddingTop:"20px"}}>
            <Sticky style={{paddingTop:"5px"}}>
              <div id="rankingsTableSelect" className="col-md-4">
                <div style={{float:"left",width:"33%",padding:"5px"}}>
                  <Select 
                  className={classes['Select']}
                  name="yearSelect"
                  value={yearOptions.filter(d => { return d.value == this.state.year })[0]}
                  options={yearOptions}
                  onChange={yearSelectChange} 
                  clearable={false}
                  />  
                </div>
                <div style={{float:"left",width:"67%",padding:"5px"}}> 
                  <Select 
                  className={classes['Select']}
                  name="metricSelect"
                  value={metricOptions.filter(d => { return d.value.metric == this.state.active })[0]}
                  options={metricOptions}
                  onChange={metricSelectChange} 
                  clearable={false}
                  />  
                </div>
                <div style={{marginTop:"250px"}}>
                  <HoverBox 
                    metroId={this.state.hoverMetro ? this.state.hoverMetro : data[0].key} 
                    year={this.state.year} 
                    activeComponent={this.state.category} 
                  />
                </div> 
              </div>
            </Sticky>
            <div className="col-md-8" style={{float:"right"}}>
              <RankingsTable 
                data={data}
                active={this.state.active} 
                year={this.state.year} 
                onHover={this._onHover}
              />
            </div>
          </div>
        </StickyContainer>
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
  combinedcomposite : state.combinedData.combinedcomposite,
  metros : state.metros,
  homeState : state.homeData
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
  getcombinedcomposite: () => loadCombinedComposite(),
  changeHomeState: (state) => changeHomeState(state)
})(RankingsView)
