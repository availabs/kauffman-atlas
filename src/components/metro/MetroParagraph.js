/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import classes from 'styles/sitewide/index.scss'
import { loadMetroScores } from 'redux/modules/metroScoresData'
import { loadCombinedComposite } from 'redux/modules/combinedData'
let roundFormat = d3.format(".3f")
import CategoryNames from 'components/misc/categoryNames'
type Props = {
};

export class MetroParagraph extends React.Component<void, Props, void> {
  constructor () {
    super()
    this.state = {
      display: 'combined'
    }
  }

  _fetchData () {
    if(!this.props.metroScores[this.props.metroId]){
      return this.props.loadMetroScores(this.props.metroId)
    }
    if(!this.props.combinedcomposite){
      return this.props.getcombinedcomposite();
    }
  }

  componentDidMount() {
    this._fetchData ()
  }
  
  componentWillReceiveProps (nextProps){
    this._fetchData ()
  }

  _highScore(data){
    let compScores = [];

    compScores.push({value:data.density.composite.values[data.density.composite.values.length-1], metric:'density'})
    compScores.push({value:data.fluidity.composite.values[data.fluidity.composite.values.length-1], metric:'fluidity'})
    compScores.push({value:data.diversity.composite.values[data.diversity.composite.values.length-1], metric:'diversity'})

    var topMetric = compScores.reduce((highest,current) => {
      return highest.value.rank < current.value.rank ? highest : current
    },{value:{rank:400}})

    let topSub = Object.keys(data[topMetric.metric]).reduce((metricScores,current) => {
      if(current != 'composite'){
        metricScores.push(current)
      }
      return metricScores;
    },[]).map(metricName => {
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


  render () {
    var metroId = this.props.metroId;

    if(!this.props.metros || !this.props.metroScores[metroId]){
      return <span></span>
    }
    console.log(this.props.metroScores)
    var data = this.props.metroScores[metroId];
    var name = this.props.metros[metroId].name;

    var compScore = data.combined.composite.values[data.combined.composite.values.length-1];
    var compPercentile = (1 - (compScore.rank/this.props.combinedcomposite.length)) * 100

    var topScore = this._highScore(data)
    var bottomScore = this._lowScore(data)
    //console.log(data)
    return (
    <div>
      <div style={{backgroundColor: '#7d8faf', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
        <div className='container'>
          <div className='row'>
            <div className={'col-xs-12 ' + classes['text-div']}>
              <p>{name} is in the {Math.floor(compPercentile)} percentile for composite with a score of {roundFormat(compScore.y)} and a rank of {compScore.rank}</p>
              <p>It scores best in {topScore.metric.metric} with a rank of {topScore.metric.value.rank} and a score of {roundFormat(topScore.metric.value.y)}, driven by a rank of {topScore.sub.value.rank} and score of {roundFormat(topScore.sub.value.y)} in {topScore.sub.metric}</p>
              <p>It scores worst in {bottomScore.metric.metric} with a rank of {bottomScore.metric.value.rank} and a score of {roundFormat(bottomScore.metric.value.y)}, driven by a rank of {bottomScore.sub.value.rank} and score of {roundFormat(bottomScore.sub.value.y)} in {bottomScore.sub.metric}</p>
              <p>Two digit sector with highest emp is BLANK Driven by two SIX DIGIT WITHIN 2 DIGIT by num employed </p>
              <p>Two digit nacsi with highest LQ driven by two six digiti wthin 2 digit with highest LQ</p>
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
  combinedcomposite : state.combinedData.combinedcomposite
})

export default connect((mapStateToProps), {  
  loadMetroScores: (currentMetro) => loadMetroScores (currentMetro),
  getcombinedcomposite: () => loadCombinedComposite()  
})(MetroParagraph)
