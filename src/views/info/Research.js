/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import classes from 'styles/sitewide/index.scss'
// import { browserHistory } from 'react-router'
import { loadDensityComposite,loadNewValues,loadShare,loadShareEmpNoAccRet,loadShareEmpHighTech, } from 'redux/modules/densityData'   
import { loadFluidityComposite,loadInc5000Data, loadNetMigrationIrs, loadTotalMigration,loadAnnualChurn } from 'redux/modules/fluidityData'    
import { loadDiversityComposite,loadOpportunityData,loadForeignBornData,loadEmpVarianceData,loadEmpHHIData } from 'redux/modules/diversityData'    
import { loadCombinedComposite } from 'redux/modules/combinedData'
import { loadMetroScores } from 'redux/modules/metroScoresData'
//import ComponentButtons from 'components/ranks/ComponentButtons'
//import SubGraphButtons from 'components/ranks/SubGraphButtons'
import LineGraph from 'components/graphs/LineGraph.js'
//import BarChart from 'components/graphs/BarChart.js'
import MetroScores from 'components/metro/MetroScores'
import NationalMap from 'components/maps/NationalMap'
import MapGraphLegend from 'components/ranks/MapGraphLegend'

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
    this._renderGraph = this._renderGraph.bind(this)
    this._renderMap = this._renderMap.bind(this)
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

  _renderGraph(component, metric, color, container, plot, extent){
    if(!this.props[component + (metric).replace(/ /g,'')]){
      this.props["get" + component + (metric).replace(/ /g,'')]()
      return <span />
    }
    else{
      return (
        <div>
          <LineGraph  
            activeColor={color}
            container={container}
            hideTitle
            hideBrush
            extent={extent}
            onMouseover={this.onMouseover}
            data={this.props[component + (metric).replace(/ /g,'')]} 
            plot={plot} dataType="relative" title={component + (metric).replace(/ /g,'')} 
            graph={component + metric}
          />
        </div>  
      )          
    }
  }

  _renderMap(component, metric, color, container, plot, extent){
    var metroArray = Object.keys(this.props.metros).map(msaId => ({key:msaId, data:this.props.metros[msaId]})).map(metro => metro.key)

    if(!this.props[component + (metric).replace(/ /g,'')]){
      this.props["get" + component + (metric).replace(/ /g,'')]()
      return <span />
    }
    else{
      console.log(color,container)
      return (
        <div>
          <div className='col-xs-6'>
              <MapGraphLegend 
                mapGraph='map'
                activeColor='scores'
                activeComponent={component + "composite"}            
                legendHover={function(){}}
                legendHoverOut={function(){}}
              />
            </div>
          <NationalMap 
            metros={metroArray} 
            activeColor={'scores'}
            activeComponent={component + "composite"}
            onMouseover={function(){}}
            legendHover={function(){}}
          />
        </div> 
      )          
    }
  }

  render () {
   
    return (
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-sm-12' style={{textAlign: 'justify', textJustify: 'inter-word'}}>
            <h4> About the Entrepreneurial Ecosystem Atlas </h4>
            <p>Would you be surprised to learn that the metropolitan statistical area surrounding Miami, Florida, is the healthiest entrepreneurial ecosystem in the United States? Or that Washington D.C. is the second healthiest and has been in the top two for the last half decade? These are a few of the findings of the Entrepreneurial Ecosystem Atlas project. 
            </p>
            <p>
            The Entrepreneurial Ecosystem Atlas, created by the Albany Visualization and Informatics Lab (AVAIL) from the University at Albany, with funding from the Ewing Marion Kauffman Foundation, is a set of interactive tools designed to provide a visual understanding of the economic indicators of entrepreneurial ecosystems in the United States. 
            </p><p>
            The idea was to create an interactive web-atlas, based on publicly available longitudinal datasets, that can provide snapshots of entrepreneurial health of the nation as a whole, and of metropolitan regions separately and comparatively, but also provide focused tools for in-depth investigation. The Entrepreneurial Ecosystem Atlas provides researchers, consultants, journalists and policymakers with a view into economic data through a lens that is designed to bring the entrepreneurial ecosystem into focus. The tool should help answer questions about economic and demographic characteristics of an MSA, and allow for evaluation of the efficacy of regional policies designed to encourage entrepreneurism. 
              </p><p>
            At the center of the atlas is the Entrepreneurial Ecosystems Index (EEI), which combines a dozen different indicators to rank metropolitan statistical areas (MSAs) across the nation. The EEI represents the overall health of entrepreneurial ecosystems and is a composite index based on three indicator categories - Fluidity, Density and Diversity (1) - which are calculated using various U.S. Economic Census datasets. These indicators look at measurable results of the entrepreneurial landscape such as startup activity and growth, but they also evaluate the “soil health” of the Entrepreneurial Ecosystem – the population demographics, the industry specialization and diversification, the population and job churn, economic mobility, and economic equality. You might think of the EEI as a means for providing new ways to identify where new businesses could thrive – as tool for locating good places to plant a business. 
            </p>
            </div>
          </div>
        <div className='row'>
          <h4> Entrepreneurial Ecosystem Index Scores by Metro Area </h4>
          {this. _renderMap('combined', 'composite')}
        </div>
        <div className='row'>
          <div className='col-sm-12' style={{textAlign: 'justify', textJustify: 'inter-word'}}>
            <h4> National Trends in The Entrepreneurial Ecosystems Index</h4>
            <p>
              From 30,000 feet the larger metropolitan statistical areas tend to score higher, 6 of the Top 10 and 26 of the Top 50 have populations of greater than 1 million people. 
              However there is not a direct correlation between population and EEI score, Memphis, TN where 1.3 million people live scores only 29 out ot 100 on in the index putting it in 284th place out of 353 metros indexed. 
              Another prominent example of popluation size not matching EEI score is Boulder, CO which is home to only 330 thousand people but scores 67.93 in 2013, the second highest score in the index.
            </p>
          </div>
          <div className='row'>
            <div className='col-md-6' style={{textAlign: 'justify', textJustify: 'inter-word'}}>
              <h4> Rank of Metro Areas in Top 50 <small>for All Years of Study</small></h4>
              {this._renderGraph('combined', 'composite', 'ranks', 'ranksas', 'rank',[0,50])}
            </div>
            <div id="mapDiv" className={'col-md-6'}>
              <h4>Top Metro EEI Composite Scores <small>Out of 100</small></h4>
              {this._renderGraph('combined', 'composite', 'scores', 'scores', 'value',[50,85])}
            </div>
          </div>
        </div>

        <div className='row'>
          <div className={'col-xs-12 ' + classes['text-div']}>
            <p>
             The Entrepreneurial Ecosystem Index ranks Washington D.C., Boulder , Austin, New York and Miami as the top five metropolitan statistical areas in the latest year of data (2013).San Francisco, Los Angeles and San Jose-Sunnyvale-Santa Clara were alll within the top 10. While many of the top 7 cities are expected, it is somewhat surprising to find Boulder, CO ranking in second place.
            </p>
            <p>
             Boulder has ranked second every year since the begining of our data in 2009, ranking above average in density, diversity and fluidity combined metrics driven by higher than average rates of entrepreneurship and the rate of high growth firms from the area. This may come as less of a suprise though to people who follow the start up world as the top teir incubator TechStars was founded in Boulder in 2006.
            </p>
          </div>
        <div>
          <h4>National Trends in Density Composite</h4>
          <MetroScores metroId={"national"} research={"true"} sector={'density'} />  
        </div>
        <div className={'col-xs-12 ' + classes['text-div']}>
        <p>
         It has been well documented that business creation in the United States has been in decline since its peak in the 1990s. The 'great recession' of 2008 led to a precipitous decline in the creation of new businesses adjusted for population and the recovery has been slow since. While not all metropolitan areas have been equally effected by the downturn, we cannot find any examples of cities which have higher rates of business creation than they did before 2000.
        </p>
        <p>
          The overall share of employment in new firms has also been steadily in decline however it was not as sharply impacted by the economic downturn of 2008. While we did see a small national increase in this data from metropolitan areas in 2013, it did decrease again for 2014 and is overall down %5 from its 1990 peak.
        </p>
        <p>
          By looking at share of employment in new high tech firms (Firms in Information and Professional NAICS categories) we see a less exagerated decline and can find cities which have had record levels of employment in these measures. In the national average the dot com boom and 2000 bust can be seen much more clearly than in the overall entrepreneurial activity. However by 2014 we have yet to see a post 'great recession' increase in the percentage of people working in new technology firms.
        </p>
        </div>
        <div>
          <h4>National Trends in Diversity Composite</h4>
          <MetroScores metroId={"national"} research={"true"} sector={'diversity'} />  
        </div>
        <div className={'col-xs-12 ' + classes['text-div']}>
          <p>
            The diversity measures see some of the largest variation of measures across metro areas, with the lowest composite scores being in the 30's and 40's and the highest scores reaching into the 80s. The composite is measuring three different kinds of diversity, being cultural, economic and social and so its hard to draw broad conclusions from the composite in total. 
          </p>
          <p>
            Looking at the individual measures however provides valuable insights. Overall the percentage of foreign born population in metro areas has increased from 2009 to 2014. Both of our measures of economic diversity show fluctiation without meaningful change on the national level. These measures however do well however when looking at individual metros when looking for areas that are over specialized in certain industries.
          </p>
        </div>
    
          <h4>Conclusions</h4>
          <p>
          The Entrepreneurial Ecosystem Atlas advances the cause of Entrepreneurial Ecosystem studies by producing replicable metrics and data science tools such as Application Programming Interfaces (APIs) for various economic census datasets. Looking at each MSA with the same tool provides a level of discovery rarely available, as many of the resources in economic research projects are limited to “one-off” analytical studies that only look at a few places at a time. By using data science methods to calculate the entrepreneurial ecosystem metrics, researchers can look at every MSA in the U.S. and drill down equally into each one, ensuring like-kind output because of the method used to calculate the metrics. This will provide a strong foundation for future theory and policy analysis. 
          </p>

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