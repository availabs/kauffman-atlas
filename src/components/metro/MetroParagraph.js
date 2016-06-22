/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import classes from 'styles/sitewide/index.scss'
import { loadMetroScores } from 'redux/modules/metroScoresData'
import { loadCombinedComposite } from 'redux/modules/combinedData'
import { loadMetroData, loadMetroDataYear } from 'redux/modules/metroQcewData'
import { loadNaicsKeys } from 'redux/modules/msaLookup'
import {typemap} from 'support/qcew/typemap'

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
    this._processData = this._processData.bind(this)
    this._topNaics = this._topNaics.bind(this)
    this._renderEei = this._renderEei.bind(this)
    this._renderNaics = this._renderNaics.bind(this)
  }

  _fetchData () {
    if(!this.props.qcewData || !this.props.qcewData[this.props.metroId]){
      return this.props.loadQcewDataYear(this.props.metroId,2013)
    }
    if(!this.props.metroScores[this.props.metroId]){
      return this.props.loadMetroScores(this.props.metroId)
    }
    if(!this.props.combinedcomposite){
      return this.props.getcombinedcomposite();
    }
    if(!this.props.naicsKeys){
      return this.props.loadNaicsKeys()
    }
  }

  componentDidMount() {
    this._fetchData ()
  }
  
  componentWillReceiveProps (nextProps){
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

  _processData (msa,year,depth,filter,typeData) {
    if(!this.props.qcewData || !this.props.qcewData[msa] ||
       !this.props.qcewData[msa][year]){
     return      
    }


    let currentData = d3.nest()
      .key( x=>x.industry_code )
      .entries(this.props.qcewData[msa][year]);

    let naicsLib = this.props.naicsKeys
    if(!depth) depth = 2
    let fields = typemap[typeData]
    let naicsKeys = currentData.filter((ind)=>{
        return ind.values.reduce((a,b) => { 
      return a && fields.reduce((tf,field) => tf && b[field],true)
        },true)
    })

    if(filter){
      let truekeys = this.props.naicsTable.Query(filter,1,true)
      naicsKeys = naicsKeys.filter(obj => truekeys.indexOf(obj.key) >= 0)
    }
    
    let totalType = 0
    var scope = this
    var data = naicsKeys.reduce((prev,current) => {
      var twoDigit = current.key.substr(0,depth)
      if(naicsLib[twoDigit].part_of_range){
          twoDigit = naicsLib[twoDigit].part_of_range;
      }
      if(!prev[twoDigit]){
        prev[twoDigit] = {
          type:0,  typeShare:0 
        }
      }

      let t1 = 0
      t1 = fields.map(key => {
        return scope._quarterReduce(current.values,key)
      }).reduce((a,b) => a+b)/fields.length
    
      totalType += t1

      let lqtypekeys = fields.map(x => 'lq_'+x)
  
      let lqt1 = 0
    
      lqt1 = lqtypekeys.map(key =>{
        return scope._quarterReduce(current.values,key)
      }).reduce((a,b) => a+b)/lqtypekeys.length
    
      prev[twoDigit].typeQuot = lqt1
    
      prev[twoDigit].type += t1
    
      return prev
    },{})

    Object.keys(data).map((k) => {
      let x = data[k]
      x.typeShare = x.type/totalType || 0
      return x
    })
    return data
  }

  _quarterReduce(obj,field) {
    let total = obj.reduce((x,y) => {
      return x + +y[field]
    },0)
    return total/4
  }

  _topNaics(year,depth,filter,metric,type,length){
    // (msa,year,depth,filter,type)
    var aggNaics = this._processData(this.props.metroId,year,depth,filter,metric);
    if(filter != null){
      console.log(aggNaics)
    }

    var sortedNaics = Object.keys(aggNaics).map(d => {
      aggNaics[d].type = aggNaics[d].type
      return d
    })
    .sort((a,b) => {
      return aggNaics[b][type] - aggNaics[a][type]
    })


    return sortedNaics    
    .filter((d,i) => { return i < length  })
    .map((naicsCode,i) => {
      
      return (
        {key:naicsCode,value:aggNaics[naicsCode]}
      )
    })
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
          The {topScore.metric.metric} score in {name} is driven by {topScore.sub.metric}, which measures [hovertext for {topScore.sub.metric}], where it ranks {this.ordinal_suffix_of(topScore.sub.value.rank)} nationally at {roundFormat(topScore.sub.value.y)}{CategoryUnits[topScore.sub.metric]}.
        </p>
        <p>
          {name} scores lowest in the {bottomScore.metric.metric} category which measures [hovertext for {bottomScore.metric.metric}]. 
          It ranks {this.ordinal_suffix_of(bottomScore.sub.value.rank)} in {bottomScore.sub.metric} and {this.ordinal_suffix_of(bottomScore.metric.value.rank)} in {bottomScore.metric.metric}.
        </p>
      </div>
          )



  }

  _renderNaics(){
    var metroId = this.props.metroId;

//(year,depth,filter,metric,type,length)
    let topTwoDigitEmpShare = this._topNaics(2013,2,null,'employment','typeShare',1)[0]
    var topEmpShareTwoDigName = this.props.naicsKeys[topTwoDigitEmpShare.key].title
    var topEmpShareTwoDigValue = topTwoDigitEmpShare.value['typeShare']
    var topSixDigitEmployed = this._topNaics(2013,4,(topTwoDigitEmpShare.key),'employment','type',1)[0]  
    var topSixDigitEmployedName = 'this.props.naicsKeys[topSixDigitEmployed.key].title'

    let topTwoDigitNumEstab = this._topNaics(2013,2,null,'establishment','type',1)[0]   
    var topTwoDigitNumEstabName = this.props.naicsKeys[topTwoDigitNumEstab.key].title
    var topTwoDigitNumEstabValue = topTwoDigitNumEstab.value['type']
    var topTwoDigitNumEstabShareValue = topTwoDigitNumEstab.value['typeShare']


    var topThreeTwoDigitEstabQuot = this._topNaics(2013,2,null,'establishment','typeQuot',3)

    var topTwoDigitEstabQuotZero = topThreeTwoDigitEstabQuot[0]
    var topTwoDigitEstabQuotZeroName = this.props.naicsKeys[topTwoDigitEstabQuotZero.key].title

    var topTwoDigitEstabQuotOne = topThreeTwoDigitEstabQuot[1]
    var topTwoDigitEstabQuotOneName = this.props.naicsKeys[topTwoDigitEstabQuotOne.key].title

    var topTwoDigitEstabQuotTwo = topThreeTwoDigitEstabQuot[2]
    var topTwoDigitEstabQuotTwoName = this.props.naicsKeys[topTwoDigitEstabQuotTwo.key].title

    return (
          <div>
            <p>
              In terms of industry sectors, {name} has a high concentration of jobs in {topEmpShareTwoDigName} compared to the national average. 
              {" " + topEmpShareTwoDigName} accounts for {(roundFormat(topEmpShareTwoDigValue)*100)}% of all jobs in the region. 
              Within that sector, {topSixDigitEmployedName} has the greatest number of employees.
            </p>
            <p>
              The sector in {name} with the highest number of establishments is {topTwoDigitNumEstabName} with {integerFormatter(topTwoDigitNumEstabValue)} establishments making up {(roundFormat(topTwoDigitNumEstabShareValue) * 100)}% of the total establishments. 
              Relative to the rest of the nation, {name} has a high concentration of {topTwoDigitEstabQuotZeroName}, {topTwoDigitEstabQuotOneName}, and {topTwoDigitEstabQuotTwoName} establishments.
            </p> 
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


    if(!this.props.metros || 
      !this.props.metroScores[metroId] || 
      !this.props.combinedcomposite || 
      !this.props.naicsKeys || 
      !this.props.qcewData || 
      !Object.keys(this.props.qcewData[this.props.metroId]).length){
      console.log("not")
         var naics = (<span>Loading Naics</span>) 
    }
    else{
      var naics = this._renderNaics()
    }


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
  qcewData  : state.metroQcewData.yeardata
})

export default connect((mapStateToProps), {  
  loadMetroScores: (currentMetro) => loadMetroScores (currentMetro),
  getcombinedcomposite: () => loadCombinedComposite(), 
  loadNaicsKeys: () => loadNaicsKeys(),
  loadQcewDataYear : (msaId, year, codes) => loadMetroDataYear(msaId, year, codes)
})(MetroParagraph)
