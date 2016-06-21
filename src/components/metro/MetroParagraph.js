/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import classes from 'styles/sitewide/index.scss'
import { loadMetroScores } from 'redux/modules/metroScoresData'
import { loadCombinedComposite } from 'redux/modules/combinedData'
import { loadMetroData, loadMetroDataYear } from 'redux/modules/metroQcewData'
import { loadNaicsKeys } from 'redux/modules/msaLookup'

let roundFormat = d3.format(".3f")
import CategoryNames from 'components/misc/categoryNames'
import CategoryText from 'components/misc/categoryText'
import CategoryUnits from 'components/misc/categoryUnits'
import { kmgtFormatter } from '../misc/numberFormatters'

const integerFormatter = kmgtFormatter.bind(null, 0)


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
    if(!this.props.naicsKeys){
      return this.props.loadNaicsKeys()
    }
    if(!this.props.qcewData){
      return this.props.loadQcewDataYear(this.props.metroId,2012)
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
    function ordinal_suffix_of(i) {
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


    var metroId = this.props.metroId;

    if(!this.props.metros || !this.props.metroScores[metroId] || !this.props.combinedcomposite || !this.props.naicsKeys){
      return <span></span>
    }
    var data = this.props.metroScores[metroId];
    var name = this.props.metros[metroId].name;

    var compScore = data.combined.composite.values[data.combined.composite.values.length-1];
    var compPercentile = (1 - (compScore.rank/this.props.combinedcomposite.length)) * 100

    var topScore = this._highScore(data)
    var bottomScore = this._lowScore(data)

    var testingNaicsEmpShare = "483211"
    var topEmpShareTwoDigName = this.props.naicsKeys[testingNaicsEmpShare.substring(0,2)].part_of_range ? this.props.naicsKeys[this.props.naicsKeys[testingNaicsEmpShare.substring(0,2)].part_of_range].title : this.props.naicsKeys[testingNaicsEmpShare.substring(0,2)].title
    var topEmpShareTwoDigValue = .15
    var topEmpShareSixDigName = this.props.naicsKeys[testingNaicsEmpShare].part_of_range ? this.props.naicsKeys[this.props.naicsKeys[testingNaicsEmpShare].part_of_range].title : this.props.naicsKeys[testingNaicsEmpShare].title

    var testingNaicsEstabQuotOne = "621311"
    var topNumEstabTwoDigName = this.props.naicsKeys[testingNaicsEstabQuotOne.substring(0,2)].part_of_range ? this.props.naicsKeys[this.props.naicsKeys[testingNaicsEstabQuotOne.substring(0,2)].part_of_range].title : this.props.naicsKeys[testingNaicsEstabQuotOne.substring(0,2)].title
    var testingEstabNumber = 5200;
    var testingEstabShare = .11;

    var testingNaicsEstabQuotOne = "621311"
    var topEstabQuotTwoDigNameOne = this.props.naicsKeys[testingNaicsEstabQuotOne.substring(0,2)].part_of_range ? this.props.naicsKeys[this.props.naicsKeys[testingNaicsEstabQuotOne.substring(0,2)].part_of_range].title : this.props.naicsKeys[testingNaicsEstabQuotOne.substring(0,2)].title

    var testingNaicsEstabQuotTwo = "221311"
    var topEstabQuotTwoDigNameTwo = this.props.naicsKeys[testingNaicsEstabQuotTwo.substring(0,2)].part_of_range ? this.props.naicsKeys[this.props.naicsKeys[testingNaicsEstabQuotTwo.substring(0,2)].part_of_range].title : this.props.naicsKeys[testingNaicsEstabQuotTwo.substring(0,2)].title

    var testingNaicsEstabQuotThree = "231311"
    var topEstabQuotTwoDigNameThree = this.props.naicsKeys[testingNaicsEstabQuotThree.substring(0,2)].part_of_range ? this.props.naicsKeys[this.props.naicsKeys[testingNaicsEstabQuotThree.substring(0,2)].part_of_range].title : this.props.naicsKeys[testingNaicsEstabQuotThree.substring(0,2)].title

    var testingNaicsEstabQuotFour = "551311"
    var topEstabQuotTwoDigNameFour = this.props.naicsKeys[testingNaicsEstabQuotFour.substring(0,2)].part_of_range ? this.props.naicsKeys[this.props.naicsKeys[testingNaicsEstabQuotFour.substring(0,2)].part_of_range].title : this.props.naicsKeys[testingNaicsEstabQuotFour.substring(0,2)].title

    function _quarterReduce(obj,field) {
      let total = obj.reduce((x,y) => {
          return x + +y[field]
      },0)
      return total/4
    }

    var qcewData = this.props.qcewData[this.props.metroId][2014];

    var yearReducedQcewData = qcewData.reduce((prev,current) => {
      if(!prev[current.agglvl_code]){
        prev[current.agglvl_code] = {}
      }
      Object.keys(current).forEach(field => {

        if(typeof +current[field] == "number"){

        }


      })      


      return prev;
    },{})



    console.log(qcewData)
    return (
    <div>
      <div style={{backgroundColor: '#7d8faf', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
        <div className='container'>
          <div className='row'>
            <div className={'col-xs-12 ' + classes['text-div']}>
              <p>With a composite Entrepreneurial Ecosystem Index (EEI) score of {roundFormat(compScore.y)}. {name} is ranked {ordinal_suffix_of(compScore.rank)} out of {this.props.combinedcomposite.length} qualifying metropolitan statistical areas in the United States. That puts it in the {ordinal_suffix_of(Math.floor(compPercentile))} percentile.</p>
              <p>It scores highest in the {topScore.metric.metric} category with a score of {roundFormat(topScore.metric.value.y)} which ranks as the {ordinal_suffix_of(topScore.metric.value.rank)} highest score in that category. The {topScore.metric.metric} score in {name} is driven by {topScore.sub.metric}, which measures [hovertext for {topScore.sub.metric}], where it ranks {ordinal_suffix_of(topScore.sub.value.rank)} nationally at {roundFormat(topScore.sub.value.y)}{CategoryUnits[topScore.sub.metric]}.</p>
              <p>{name} scores lowest in the {bottomScore.metric.metric} category which measures [hovertext for {bottomScore.metric.metric}]. It ranks {ordinal_suffix_of(bottomScore.sub.value.rank)} in {bottomScore.sub.metric} and {ordinal_suffix_of(bottomScore.metric.value.rank)} in {bottomScore.metric.metric}.</p>
              <p>In terms of industry sectors, {name} has a high concentration of jobs in {topEmpShareTwoDigName} compared to the national average. {topEmpShareTwoDigName} accounts for {(topEmpShareTwoDigValue*100)}% of all jobs in the region. Within that sector, {topEmpShareSixDigName} has the greatest number of employees.</p>
              <p>The sector in {name} with the highest number of establishments is {topEstabQuotTwoDigNameOne} with {integerFormatter(testingEstabNumber)} establishments making up {(testingEstabShare * 100)}% of the total establishments. Relative to the rest of the nation, {name} has a high concentration of {topEstabQuotTwoDigNameTwo}, {topEstabQuotTwoDigNameThree}, and {topEstabQuotTwoDigNameFour}.</p> 
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
  qcewData  : state.metroQcewData.yeardata
})

export default connect((mapStateToProps), {  
  loadMetroScores: (currentMetro) => loadMetroScores (currentMetro),
  getcombinedcomposite: () => loadCombinedComposite(), 
  loadNaicsKeys: () => loadNaicsKeys(),
  loadQcewDataYear : (msaId, year, codes) => loadMetroDataYear(msaId, year, codes)
})(MetroParagraph)
