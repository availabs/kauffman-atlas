import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { loadMetroGdp, loadMetroGdpPerCapita } from 'redux/modules/metroGdpData'
import { loadMetroScores } from 'redux/modules/metroScoresData'
import MetroMap from 'components/maps/MetroMap'
import LineGraph from 'components/graphs/SimpleLineGraph'
import Select from 'react-select'
import classes from 'styles/sitewide/index.scss'
import d3 from 'd3'



export class MetroHeader extends React.Component<void, Props, void> {
  _fetchData (props) {
    if(!props.gdpData[props.metroId] || !props.gdpData[props.metroId].gdp){
      return props.loadGdpData(props.metroId)
    }
    if(!props.gdpData[props.metroId] || !props.gdpData[props.metroId].gdp_per_capita){
      return props.loadGdpPerCapita(props.metroId)
    }
    if(!props.metroScores[props.metroId]){
      return props.loadMetroScores(props.metroId)
    }
  }

  componentDidMount() {
    this._fetchData (this.props)
  }
  
  componentWillReceiveProps (nextProps){
    this._fetchData (nextProps)
  }

  hasData () {
    return this.props.gdpData[this.props.metroId] &&
      this.props.gdpData[this.props.metroId].gdp &&
      this.props.gdpData[this.props.metroId].gdp_per_capita &&
      this.props.metroScores[this.props.metroId]      
  }

  render () {
    var scope = this;
    if (!this.hasData()) return <span />
    let popData = [{
      key:'Population',
      strokeWidth: 2,
      color:'#efefef',
      values: Object.keys(this.props.metroData.pop)
        .filter(d => {return +d > 2000})
        .map((d,i) => {
        return {
          key: d,
          values:{
            x: +d,
            y: this.props.metroData.pop[d]  //i === 0 ? 0 : (this.props.metroData.pop[d] - this.props.metroData.pop[d - 1]) / this.props.metroData.pop[d - 1] * 100 ,
          }
        }
      })
    }]

    let gdpData = [{
      key:'Population',
      strokeWidth: 2,
      color:'#efefef',
      values: this.props.gdpData[this.props.metroId].gdp
        .map((d,i) => {
        return {
          key: d.key,
          values:{
            x: +d.key,
            y: d.value  //i === 0 ? 0 : (this.props.metroData.pop[d] - this.props.metroData.pop[d - 1]) / this.props.metroData.pop[d - 1] * 100 ,
          }
        }
      })
    }]

    let gdpDataPerCapita = [{
      key:'Population',
      strokeWidth: 2,
      color:'#efefef',
      values: this.props.gdpData[this.props.metroId].gdp
        .map((d,i) => {
        return {
          key: d.key,
          values:{
            x: +d.key,
            y: +Math.round((d.value / popData[0].values[i].values.y)* 1000000)//i === 0 ? 0 : (this.props.metroData.pop[d] - this.props.metroData.pop[d - 1]) / this.props.metroData.pop[d - 1] * 100 ,
          }
        }
      })
    }]
    let growth = (this.props.metroData.pop[2014] - this.props.metroData.pop[2001]) / this.props.metroData.pop[2001] * 100
    let last_gdp = this.props.gdpData[this.props.metroId].gdp.filter(d => { return +d.key === 2014 })[0].value
    let first_gdp = this.props.gdpData[this.props.metroId].gdp.filter(d => { return +d.key === 2001 })[0].value
    let gdpGrowth = (last_gdp - first_gdp) / first_gdp * 100
    let last_per_capita = gdpDataPerCapita[0].values.filter(d => { return +d.key === 2014 })[0].values.y
    let first_per_capita = gdpDataPerCapita[0].values.filter(d => { return +d.key === 2001 })[0].values.y
    let perCapitaGrowth = (last_per_capita - first_per_capita) / first_per_capita * 100

    var selectOptions = Object.keys(this.props.metros).filter(metro => {
      return this.props.metros[metro].pop
    }).map(metroId => {
      return {value:metroId,label:this.props.metros[metroId].name}
    })

    function selectChange (value){
      console.log("Select Change",value);

      if(value && scope.props.metros[value.value] && scope.props.metros[value.value].pop){
        scope.props.selectChange(value.value) 
      }
    }

    return (
      <div className='container'>
      <div id="metroSearch">
        <Select 
        className={classes['Select']}
        name="metroSelect"

        options={selectOptions}
        onChange={selectChange}
        placeholder={this.props.metros[this.props.metroId].name}   
        resetValue="Travel to a different Metro Area"
        />   
      </div>   
        <div className='row'>
          <div className='col-xs-3'>
              <MetroMap currentMetro={this.props.metroId} />
              
          </div>
          <div className='col-xs-3'>
              <div>
                <span style={{fontSize:36, fontWeight:0,paddingRight: 10}}> 
                  {this.props.metroData.pop['2014'].toLocaleString()}
                </span> 
                <div style={{display:'inline-block'}}><strong>Population</strong><br />
                  {growth.toLocaleString()}% 
                </div>
              </div>
              <LineGraph data={popData} uniq='popGraph' options={{height: 50}} />
              <span className='pull-left'>{popData[0].values[0].key}</span>
              <span className='pull-right'>{popData[0].values[popData[0].values.length-1].key}</span>
          </div>
          <div className='col-xs-3'>
            <div>
              <span style={{fontSize:36, fontWeight:0,paddingRight: 10}}> 
                {this.props.gdpData[this.props.metroId].gdp.filter(d => { return +d.key === 2014 })[0].value.toLocaleString()}
              </span> 
              <div style={{display:'inline-block'}}><strong>GDP</strong> (in millions)<br />
                {gdpGrowth.toLocaleString()}% 
              </div>
            </div>
            <LineGraph data={gdpData} uniq='gdpGraph' options={{height: 50}} />
            <span className='pull-left'>{popData[0].values[0].key}</span>
            <span className='pull-right'>{popData[0].values[popData[0].values.length-1].key}</span>
          </div>
           <div className='col-xs-3'>
            <div>
              <span style={{fontSize:36, fontWeight:0,paddingRight: 10}}> 
                {last_per_capita.toLocaleString()}
              </span> 
              <div style={{display:'inline-block'}}><strong>GDP Per Capita</strong><br />
                {perCapitaGrowth.toLocaleString()}% 
              </div>
            </div>
            <LineGraph data={gdpDataPerCapita} uniq='perCapitaGraph' options={{height: 50}} />
            <span className='pull-left'>{popData[0].values[0].key}</span>
            <span className='pull-right'>{popData[0].values[popData[0].values.length-1].key}</span>
          </div>
        </div>
      </div>
    )      
  }
}

const mapStateToProps = (state) => {
  return ({
    metroScores : state.metroScoresData,
    gdpData : state.metroGdpData,
    metros : state.metros
  })
}

export default connect((mapStateToProps), {
  loadGdpPerCapita: (currentMetro) => loadMetroGdpPerCapita (currentMetro),
  loadGdpData: (currentMetro) => loadMetroGdp (currentMetro),
  loadMetroScores: (currentMetro) => loadMetroScores (currentMetro)  
})(MetroHeader)