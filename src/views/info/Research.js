/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import classes from 'styles/sitewide/index.scss'
import { browserHistory } from 'react-router'
import { loadDensityComposite,loadNewValues,loadShare,loadShareEmpNoAccRet,loadShareEmpHighTech, } from 'redux/modules/densityData'   
import { loadFluidityComposite,loadInc5000Data, loadNetMigrationIrs, loadTotalMigration,loadAnnualChurn } from 'redux/modules/fluidityData'    
import { loadDiversityComposite,loadOpportunityData,loadForeignBornData,loadEmpVarianceData,loadEmpHHIData } from 'redux/modules/diversityData'    
import { loadCombinedComposite } from 'redux/modules/combinedData'
import { loadMetroScores } from 'redux/modules/metroScoresData'
import ComponentButtons from 'components/ranks/ComponentButtons'
import SubGraphButtons from 'components/ranks/SubGraphButtons'
import LineGraph from 'components/graphs/LineGraph.js'
import MetroScores from 'components/metro/MetroScores'


export default class Research extends React.Component {

  constructor () {
    super()
    this.state = {
      activeComponent:'combined',
      bucket:'all',
      metric:'composite'
    }

    this._setActiveComponent = this._setActiveComponent.bind(this)
    this._setMetric = this._setMetric.bind(this)
    this.onMouseover = this.onMouseover.bind(this)
   }

  // _renderNationalScores()   {
  //   if(!this.props.metroScores["national"]){
  //     this.props.loadMetroScores("national")
  //     return <span />
  //   }
  //   else{
      
  //   }
  // }

  _setActiveComponent (type) {
    if(type == "qwiDensity"){
      this.setState({activeComponent:type,metric:"shareEmpAll"})      
    }else{
      this.setState({activeComponent:type,metric:"composite"})      
    }
  }

  _setMetric (type) {
    this.setState({metric:type})
  }

  onMouseover(feature){
    let curFeature = feature.city ? feature.city.key : feature.id  
  }

  _renderMapGraph(){
    if(!this.props[this.state.activeComponent + (this.state.metric).replace(/ /g,'')]){
      this.props["get" + this.state.activeComponent + (this.state.metric).replace(/ /g,'')]()
      return <span />
    }
    else{
      return (
        <LineGraph  
          activeColor="ranks"  
          onMouseover={this.onMouseover}
          data={this.props[this.state.activeComponent + (this.state.metric).replace(/ /g,'')]} 
          plot="rank" dataType="relative" title={this.state.activeComponent + (this.state.metric).replace(/ /g,'')} 
          graph={this.state.activeComponent + "composite"}
        />
      )      
    }
  }

  render () {
    return (
      <div className='container-fluid'>
        <div className="row">
          <div className={'col-xs-12'} style={{padding:"10px"}}>
            <div style={{width:"35%",float:"left"}}>
              <ComponentButtons
                onComponentChange={this._setActiveComponent} 
                activeComponent={this.state.activeComponent}
              />
            </div>
            <div style={{width:"65%",float:"right"}}>
              <SubGraphButtons
                pull="right"
                metric={this.state.metric}
                onComponentChange={this._setMetric} 
                activeComponent={this.state.activeComponent}
              />
            </div>
          </div>   
        </div>
        <div className='row'>
            <div id="mapDiv" className={'col-xs-12 '}>
              {this._renderMapGraph()}
            </div>
        </div>
        <div>
          <MetroScores metroId={"national"} research={"true"}/>  
        </div>
        <div className='row'>
          <div className={'col-xs-12 ' + classes['text-div']}>
            <h4>About This Project</h4>
            <p>Would you be surprised to learn that the metropolitan statistical area surrounding Miami, Florida, is the healthiest entrepreneurial ecosystem in the United States? Or that Washington D.C. is the second healthiest and has been in the top two for the last half decade? These are a few of the findings of the Entrepreneurial Ecosystem Atlas project. 
The Entrepreneurial Ecosystem Atlas, created by the Albany Visualization and Informatics Lab (AVAIL) from the University at Albany, with funding from the Ewing Marion Kauffman Foundation, is a set of interactive tools designed to provide a visual understanding of the economic indicators of entrepreneurial ecosystems in the United States. 
The idea was to create an interactive web-atlas, based on publicly available longitudinal datasets, that can provide snapshots of entrepreneurial health of the nation as a whole, and of metropolitan regions separately and comparatively, but also provide focused tools for in-depth investigation. The Entrepreneurial Ecosystem Atlas provides researchers, consultants, journalists and policymakers with a view into economic data through a lens that is designed to bring the entrepreneurial ecosystem into focus. The tool should help answer questions about economic and demographic characteristics of an MSA, and allow for evaluation of the efficacy of regional policies designed to encourage entrepreneurism. 
At the center of the atlas is the Entrepreneurial Ecosystems Index (EEI), which combines a dozen different indicators to rank metropolitan statistical areas (MSAs) across the nation. The EEI represents the overall health of entrepreneurial ecosystems and is a composite index based on three indicator categories - Fluidity, Density and Diversity (1) - which are calculated using various U.S. Economic Census datasets. These indicators look at measurable results of the entrepreneurial landscape such as startup activity and growth, but they also evaluate the “soil health” of the Entrepreneurial Ecosystem – the population demographics, the industry specialization and diversification, the population and job churn, economic mobility, and economic equality. You might think of the EEI as a means for providing new ways to identify where new businesses could thrive – as tool for locating good places to plant a business. 
From 30,000 feet it appears as though the rust belt and the southeast are not thriving entrepreneurial ecosystems.
</p><p>

The Entrepreneurial Ecosystem Index ranks Miami, Washington D.C., Boulder, San Francisco, and Los Angeles as the top five metropolitan statistical areas in the latest year of data (2013). New York City was ranked 6th and Austin, Texas, 7th. While many of the top 7 cities are expected, it is somewhat surprising to find Miami at the top of the list. For instance, the Kauffman Index for Growth Entrepreneurship, an index that ranks MSAs based on the density of high growth startups, ranks Miami as the 39th MSA in the nation. So how does an MSA like Miami, 39th in the Growth Entrepreneurship Rankings, measure as the number one healthiest Entrepreneurial Ecosystem?
Firstly, it ranks high in terms of foreign born population. A full 38% of the population of Miami is foreign born, a demographic with historically high rates of entrepreneurism. Theory suggests that a high concentration of foreign born population should provide a fertile environment for innovation. Secondly, Miami has a high rate of new firms per 1K population and a high share of employment in High Tech Firms. 
</p><p>
Upon digging deeper into the Entrepreneurial Ecosystem Atlas we find that Miami has a healthy and diverse portfolio of industry clusters, with its lone standout specialization being Water Transportation, which likely points toward the Cruise Industry.
The presence of so many healthy industry clusters indicates that Miami is economically diverse in addition to its diverse population, its high percentage of New Firms per 1K, and high Share of Employment in High Tech Firms.  
</p><p>
Additionally, Miami appears to have a relatively recent increase in young firms in the sectors of manufacturing and finance/insurance. These industries traditionally provide a solid bedrock for any entrepreneurial ecosystem. 
</p><p>
Washington D.C., the second highest ranked city in the Entrepreneurial Ecosystem Atlas, is a less surprising entry on the list. Washington D.C. has had a consistently strong collection of high growth startups in recent years. Kauffman Growth Index ranks them highly….. The Entrepreneurial Ecosystem Index takes this into account in ranking Washington 1st in the Fluidity Category.  
Washington D.C. also scores well in percent of foreign born population and in the Equality of Opportunity data which shows that traditionally, individuals who grow up in Washington D.C. have a good chance of taking home a higher income than their parents. 
Washington D.C.’s share of Employment in High Tech New Firms score is likely bolstered by its high establishment quotient in the Professional, Scientific and Technical Services industry sector. Employment in the sub-industry sectors of Computer Systems Design, Scientific Research and Development, and Management, Scientific, and Technical Services, are all higher than three times the national average. 
</p><p>
The Entrepreneurial Ecosystem Atlas also visualizes trends such as the great recession of 2008, the effects of Hurricane Katrina, and more importantly the recovery of establishments and employment that follow such events.
First let’s take a look at the effects of the great recession. There’s a clear dip in the number of new and young firms per 1,000 people over 2008 and 2009, likely a result of the credit crunch, which made it difficult to start a business. There’s a corresponding dip in employment turnover rate as a percentage of total employment which visualizes the dearth of economic mobility associated with recessions. ***
 </p><p>
Hurricane Katrina also shows up clearly in some graphs, appearing to be a complete outlier in the Net Migration graph. 
</p><p>
The industries in New Orleans most severely impacted by Katrina were the Accommodation / Food Services and Retail Trade. Whereas Manufacturing, Health Care / Social Assistance, and Professional, Scientific, and Technical Services show a slight drop in the 4th quarter of 2005 before rebounding to pre-Katrina levels in the 1st quarter of 2006. These industries were clearly more resilient than the Accommodation / Food Services and Retail Trade industries, a finding that is clearly illustrated by the Quarterly Employment visualization tools. New Orleans is now a decade into the Katrina recovery and Accommodation / Food Services and Retail Trade appear to have finally rebounded to pre-Katrina levels.
</p><p>
The Albany Visualization and Informatics Lab explored our hometown MSA of Albany – Schenectady – Troy, NY, to see if we could find evidence of the recent investment in its Startup New York program and its investment in nanotechnology research and development. The State of New York and regional economic leaders have branded the Albany – Schenectady – Troy area “Tech Valley.” As part of developing the Tech Valley idea, state funding has been directed to the University at Albany’s College of Nano-scale Engineering (now SUNY Polytech) where a huge investment was made in nanotechnology manufacturing and research facilities. Funding and tax breaks were levied to develop a Startup New York program for encouraging entrepreneurship in the region and to attract startups from other regions to relocate to the new facilities. Additionally, the semiconductor manufacturing company Global Foundries opened a manufacturing plant in neighboring Malta, NY, beginning mass-production in 2012.
</p><p>
Looking at the Entrepreneurial Ecosystem Atlas, evidence of the effects of these policies appears mixed. Clearly there is a spike in 0-1 year-old manufacturing firms in the 4th quarter of 2011 as indicated by the red line in the graph below. 
</p><p>
We can follow that through 2012 and 2013 by looking at 2-3 year-old manufacturing firms.  
</p><p>
We can continue to follow this trend into 2014 by looking at 4-5 year-old manufacturing firms.
</p><p>
The Startup New York program, however, seems to be more difficult to track in terms of overall success.  Clearly it is possible to link the growth in manufacturing to the Startup New York program, but there is little evidence of success in other sectors commonly associated with startup culture such as Information and Professional Services. Moreover, aside from the jump in manufacturing noted earlier, there doesn’t appear to be much happening in the Albany – Schenectady – Troy region in the way of 0-1 year-old firms. We would have to look back to a jump in new firms in 2009 in the Information sector which notably does not appear to follow into the 2-3 year-old firm-age, likely indicating firm death.
</p><p>
The Entrepreneurial Ecosystem Atlas advances the cause of Entrepreneurial Ecosystem studies by producing replicable metrics and data science tools such as Application Programming Interfaces (APIs) for various economic census datasets. Looking at each MSA with the same tool provides a level of discovery rarely available, as many of the resources in economic research projects are limited to “one-off” analytical studies that only look at a few places at a time. By using data science methods to calculate the entrepreneurial ecosystem metrics, researchers can look at every MSA in the U.S. and drill down equally into each one, ensuring like-kind output because of the method used to calculate the metrics. This will provide a strong foundation for future theory and policy analysis. 
</p>

          </div>
        </div>
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
  metroScores : state.metroScoresData,
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
  loadMetroScores: (currentMetro) => loadMetroScores (currentMetro)  
})(Research)