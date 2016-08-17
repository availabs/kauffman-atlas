/* @flow */
import React from 'react'
import { connect } from 'react-redux'
import classes from 'styles/sitewide/index.scss'
import { loadMetroScores } from 'redux/modules/metroScoresData'
import { loadCombinedComposite } from 'redux/modules/combinedData'
import { loadData } from '../../redux/modules/metroQcewData/actions'
//import { loadMetroData, loadMetroDataYear } from 'redux/modules/metroQcewData'
import { loadNaicsKeys } from 'redux/modules/msaLookup'
import _ from 'lodash'

let roundFormat = d3.format(".2f")
import CategoryNames from 'components/misc/categoryNames'
import CategoryUnits from 'components/misc/categoryUnits'
import CategoryHoverParagraph from 'components/misc/categoryHoverParagraph'
import { kmgtFormatter } from '../misc/numberFormatters'

const integerFormatter = kmgtFormatter.bind(null, 0)


type Props = {
};

export class MetroParagraph extends React.Component<void, Props, void> {
  constructor () {
    super()
    this.state = {
      display: 'combined',
    }

    this._renderEei = this._renderEei.bind(this)
    this._renderNaics = this._renderNaics.bind(this)
  }

  _fetchData () {
    if(!(this.props.qcewData && this.props.qcewData[this.props.metroId])) {
      this.props.loadData(this.props.metroId)
    }
    if(!this.props.metroScores[this.props.metroId]){
      this.props.loadMetroScores(this.props.metroId)
    }
    if(!this.props.combinedcomposite){
      this.props.getcombinedcomposite();
    }
    if(!this.props.naicsKeys){
      this.props.loadNaicsKeys()
    }
  }

  componentDidMount() {
    this._fetchData ()
  }

  componentWillMount(){
    this._fetchData () 
  }
  
  componentWillReceiveProps (){
    this._fetchData ()
  }

  ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return (<span>{i}<sup>st</sup></span>);
    }
    if (j == 2 && k != 12) {
        return (<span>{i}<sup>nd</sup></span>);
    }
    if (j == 3 && k != 13) {
        return (<span>{i}<sup>rd</sup></span>);
    }
    return (<span>{i}<sup>th</sup></span>);
  }


  _highScore(data){
    let compScores = [];

    compScores.push({value:data.density.composite.values[data.density.composite.values.length-1], metric:'density'})
    compScores.push({value:data.fluidity.composite.values[data.fluidity.composite.values.length-1], metric:'fluidity'})
    compScores.push({value:data.diversity.composite.values[data.diversity.composite.values.length-1], metric:'diversity'})

    var topMetric = compScores.reduce((highest,current) => {
      console.log(current)
      return highest.value.rank < current.value.rank ? highest : current
    },{value:{rank:400}})

    let topSub = Object.keys(data[topMetric.metric]).reduce((metricScores,current) => {
      if(current != 'composite'){
        metricScores.push(current)
      }
      return metricScores;
    },[]).map(metricName => {

            console.log( metricName.toLowerCase())
      return (
        data[topMetric.metric][metricName]['relative'] ? { value:data[topMetric.metric][metricName]['relative'].values[(data[topMetric.metric][metricName]['relative'].values.length-1)],metric:CategoryNames[(topMetric.metric + metricName.toLowerCase())] } :
        data[topMetric.metric][metricName]['raw'] ? { value:data[topMetric.metric][metricName]['raw'].values[(data[topMetric.metric][metricName]['raw'].values.length-1)],metric:CategoryNames[(topMetric.metric + metricName.toLowerCase())] } :               
        { value:data[topMetric.metric][metricName].values[(data[topMetric.metric][metricName].values.length-1)],metric:CategoryNames[(topMetric.metric + metricName.toLowerCase())] }                          
        )
    }).reduce((highest, current) => {
      return highest.value.rank < current.value.rank ? highest : current
    },{value:{rank:400}})

    var topScore = {metric:topMetric,sub:topSub}
    return topScore
  }

  _lowScore(data){
    let compScores = [];

    compScores.push({value:data.density.composite.values[data.density.composite.values.length-1], metric:'density'})
    compScores.push({value:data.fluidity.composite.values[data.fluidity.composite.values.length-1], metric:'fluidity'})
    compScores.push({value:data.diversity.composite.values[data.diversity.composite.values.length-1], metric:'diversity'})

    var bottomMetric = compScores.reduce((lowest,current) => {
      return lowest.value.rank > current.value.rank ? lowest : current
    },{value:{rank:0}})

    let botSub = Object.keys(data[bottomMetric.metric]).reduce((metricScores,current) => {
      if(current != 'composite'){
        metricScores.push(current)
      }
      return metricScores;
    },[]).map(metricName => {
      return (
        data[bottomMetric.metric][metricName]['relative'] ? { value:data[bottomMetric.metric][metricName]['relative'].values[(data[bottomMetric.metric][metricName]['relative'].values.length-1)],metric:CategoryNames[(bottomMetric.metric + metricName.toLowerCase())] } :
        data[bottomMetric.metric][metricName]['raw'] ? { value:data[bottomMetric.metric][metricName]['raw'].values[(data[bottomMetric.metric][metricName]['raw'].values.length-1)],metric:CategoryNames[(bottomMetric.metric + metricName.toLowerCase())] } :               
        { value:data[bottomMetric.metric][metricName].values[(data[bottomMetric.metric][metricName].values.length-1)],metric:CategoryNames[(bottomMetric.metric + metricName.toLowerCase())] }                          
        )
    }).reduce((lowest, current) => {
      if(current.value.y == -1){
        return lowest
      }else{
        return lowest.value.rank > current.value.rank ? lowest : current        
      }

    },{value:{rank:0}})

    var bottomScore = {metric:bottomMetric,sub:botSub}
    return bottomScore
  }

  _renderEei(){
    var metroId = this.props.metroId;
    var data = this.props.metroScores[metroId];
    var name = this.props.metros[metroId].name;

    var compScore = data.combined.composite.values[data.combined.composite.values.length-1];
    var compPercentile = (1 - (compScore.rank/this.props.combinedcomposite.length)) * 100

    var topScore = this._highScore(data)
    var bottomScore = this._lowScore(data)


    return(   
      <div>           
        <p>
          With a composite Entrepreneurial Ecosystem Index (EEI) score of {roundFormat(compScore.y)}.  
          {" " + name} is ranked {this.ordinal_suffix_of(compScore.rank)} out of {this.props.combinedcomposite.length} qualifying metropolitan statistical areas in the United States. 
          That puts it in the {this.ordinal_suffix_of(Math.floor(compPercentile))} percentile.
        </p>
        <p>
          It scores highest in the {topScore.metric.metric} category with a score of {roundFormat(topScore.metric.value.y)} which ranks as the {this.ordinal_suffix_of(topScore.metric.value.rank)} highest score in that category. 
          The {topScore.metric.metric} score in {name} is driven by {topScore.sub.metric}, which measures {CategoryHoverParagraph[topScore.sub.metric]}, where it ranks {this.ordinal_suffix_of(topScore.sub.value.rank)} nationally at {roundFormat(topScore.sub.value.y)}{CategoryUnits[topScore.sub.metric]}.
        </p>
        <p>
          {name} scores lowest in the {bottomScore.metric.metric} category which {CategoryHoverParagraph[bottomScore.metric.metric]} 
          It ranks {this.ordinal_suffix_of(bottomScore.sub.value.rank)} in {bottomScore.sub.metric} and {this.ordinal_suffix_of(bottomScore.metric.value.rank)} in {bottomScore.metric.metric}.
        </p>
      </div>
          )
  }

  _renderNaics(){
    var metroId = this.props.metroId;
    var name = this.props.metros[metroId].name;


    let d = _.get(this.props.qcewData, [metroId, 2013])

    if (!d) {
      return (<span>Loading Naics...</span>)
    }

    return (
      <div>
        <p>
          In terms of industry sectors, {name} has a high concentration of jobs in 
          {d.topEmpName} compared to the national average. 
          {" " + d.topEmpShareName} accounts for 
          {" " + (roundFormat(d.topEmpShareValue)*100) + " "}% of all jobs in the region. 
        </p>
        <p>
          The sector in {name} with the highest number of establishments is {d.topEstName + " "} 
          with {integerFormatter(d.topEstValue)} establishments making up  
          {" " + roundFormat(d.topEstShareValue * 100).toLocaleString() }% of the total establishments. 
        </p> 
        <p>
          Relative to the rest of the nation, {name} has a high concentration of establishments in:
        </p>
        <ul>
          <li>{d.topLQEst_0_Name}</li>
          <li>{d.topLQEst_1_Name}</li>
          <li>{d.topLQEst_2_Name}</li>
        </ul>
      </div>
    )      
  }

  render () {
    var metroId = this.props.metroId;

    if(!this.props.metros || 
      !this.props.metroScores[metroId] || 
      !this.props.combinedcomposite){
      var eei = (<span>Loading EEI</span>)
    }
    else{
      var eei = this._renderEei()
    }

    if(!this.props.qcewData || !this.props.qcewData[this.props.metroId]){
      var naics = (<span>Loading Naics</span>) 
    }
    else{
      var naics = this._renderNaics()
    }

    let d = _.get(this.props.qcewData, [metroId, 2013])



    return (
    <div>
      <div style={{backgroundColor: '#7d8faf', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
        <div className='container'>
          <div className='row'>
            <div className={'col-xs-12 ' + classes['text-div']}>
              {eei}
              {naics}
            </div>
          </div>
        </div>
      </div> 
    </div>
    )
  }
}


const mapStateToProps = (state) => ({
  metroScores : state.metroScoresData,
  metros : state.metros,
  combinedcomposite : state.combinedData.combinedcomposite,
  naicsKeys : state.metros.naicsKeys,
  naicsTable: state.metros.naicsLookup,
  qcewData  : state.metroQcewData.metroParagraphData
})

export default connect((mapStateToProps), {  
  loadMetroScores: (currentMetro) => loadMetroScores (currentMetro),
  getcombinedcomposite: () => loadCombinedComposite(), 
  loadNaicsKeys: () => loadNaicsKeys(),
  loadData: (currentMetro) => loadData(currentMetro)
})(MetroParagraph)
