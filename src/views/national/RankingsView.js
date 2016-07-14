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
import PopBuckets from 'components/ranks/PopBuckets'
import HoverBox from 'components/ranks/HoverBox'
import CategoryNames from 'components/misc/categoryNames'
import Select from 'react-select'
import {StickyContainer, Sticky} from 'react-sticky'
import 'react-select/dist/react-select.css';

let roundFormat = d3.format(".2f")

let categories = {
  combined: ['combinedcomposite', 'densitycomposite', 'fluiditycomposite', 'diversitycomposite'],
  density: ['densitycomposite','densitynewfirms', 'densityshareofemploymentinnewfirms','densityshareEmpNoAccRet','densityshareEmpHighTech'],
  diversity: ['diversitycomposite','diversityincomebasedonchildhood','diversitypercentageofforeignbornpopulation','diversityemploymentlocationquotientvariance'],
  fluidity: ['fluiditycomposite','fluidityhighgrowthfirms','fluiditynetmigration','fluiditytotalmigration','fluidityannualchurn'],
  qwiDensity: ['qwiDensityshareEmpAll','qwiDensityshareEmpInfo','qwiDensityshareEmpPro']      
}

export class RankingsView extends React.Component<void, Props, void> {
   constructor () {
    super()

    this.state = {
      active:'combinedcomposite',
      category:'combined',
      year:2013,
      clickMetro:null,
      hoverMetro:null,
      bucket:'all'
    }

    this._onClick = this._onClick.bind(this);
    this._onHover = this._onHover.bind(this);
    this._checkData = this._checkData.bind(this);
    this._formatData = this._formatData.bind(this)
    this._setActiveBucket = this._setActiveBucket.bind(this);
  }
  componentWillMount () {    
    this._initGraph();    
  }   
  

  _onClick(feature){ 
    this.setState({clickMetro:feature});
  }

  _onHover(feature){ 
    this.setState({hoverMetro:feature});
  }

  _setActiveBucket (bucket) {
    this.setState({'bucket':bucket});
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

  _formatData(){
    var category = this.state.category
    var orderedData = {};

    categories[category].forEach((cat) => {
      var data = Array.isArray(this.props[cat]) ? this.props[cat] : this.props[cat]['relative'] ? this.props[cat]['relative'] : this.props[cat]['raw'] 
      orderedData[cat] = data;
    })   


    return orderedData;
  }


  render () {
    var scope = this;
    if(!this._checkData(this.state.category)){
      return (<tr />)
    }


    var data2 = this._formatData();
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

    function _sortProp(){
      return (a,b) => {
        var aValue,
        bValue;

        aValue = a['data']["pop"];
        bValue = b['data']["pop"];

        if(aValue){
          aValue = aValue[2014];
        }

        if(bValue){
          bValue = bValue[2014];
        }

        if(aValue >= bValue){
          return -1;
        }
        if(bValue > aValue){
          return 1
        }


      }
    }

    var sortedMetros = [];

    var metroArray = Object.keys(this.props.metros).map(msaId => ({key:msaId, data:this.props.metros[msaId]}) );

    sortedMetros = metroArray.sort(_sortProp())

    var range = [400,250,150,50]
    var nextBucket = +this.props.homeState.bucket + 1;

    var metrosInBucket = sortedMetros.filter((d,i) => { 
      return (this.props.homeState.bucket === 'all') ||
      (
        (this.props.homeState.bucket) == 3 && i < (range[(this.props.homeState.bucket)])
      ) || 
      (
        i < (range[(this.props.homeState.bucket)]) && i >= (range[(nextBucket)])
      )
    }).map(metro => metro.key)



    return (
      <div> 
        <div>
          <h3 style={{textAlign:"center"}}>
            {metricOptions.filter(d => d.value.metric == this.state.active)[0].label}
          </h3>
        </div>
        <StickyContainer>
          <div className='container' style={{paddingTop:"5px"}}>
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
                <div style={{float:"left",width:"67%",padding:"5px",marginBottom:"200px"}}> 
                  <Select 
                  className={classes['Select']}
                  name="metricSelect"
                  value={metricOptions.filter(d => { return d.value.metric == this.state.active })[0]}
                  options={metricOptions}
                  onChange={metricSelectChange} 
                  clearable={false}
                  />  
                </div>
                <PopBuckets 
                  popScale={range} 
                  onBucketChange={this._setActiveBucket} 
                  bucket={this.state.bucket}
                />

                <div style={{marginTop:"325px"}}>
                  <HoverBox 
                    metroId={this.state.clickMetro ? this.state.clickMetro : data[0].key} 
                    year={typeof this.state.year != "number" ? 2013 : this.state.year} 
                    activeComponent={this.state.category} 
                  />
                </div> 
              </div>
            </Sticky>
            <div className="col-md-8" style={{float:"right"}}>
              <RankingsTable
                metrosInBucket={metrosInBucket}  
                data={data}
                data2={data2}
                active={this.state.active} 
                year={this.state.year} 
                onClick={this._onClick}
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
