"use strict"
import React from 'react'
import d3 from 'd3'
import map from './renderGeography'
import bubble from './BubbleChart'
import { connect } from 'react-redux'
import { loadZipData, loadMetroGeo,loadMetroZipsGeo } from 'redux/modules/metroZbpData'
import { loadNaicsKeys } from 'redux/modules/msaLookup'
//import naicsLib from 'static/data/naicsKeys'
import RadarChart from 'components/vis/RadarChart/RadarChart'
import classes from 'styles/sitewide/index.scss'


export class MetroZbp extends React.Component {
  constructor (props) {
    super()
    this.state = {
      depth: 2,
      filter: null,
      mapWidth: 600,
      mapHeight: 600,
      sort: 'emp_quot',
      options: {
        mode: "cluster",
        naics: {
          depth: 0,
          code: null
        }
      }
    }
    this._fecthData = this._fecthData.bind(this)
    this._renderBubbles = this._renderBubbles.bind(this)
    this._setFilter = this._setFilter.bind(this)
    this.setMode = this.setMode.bind(this)
  }
  
  _fecthData () {
    if(!this.state.loadingData && (!this.props.zbpData.data[this.props.year] || !this.props.zbpData.data[this.props.year][this.props.currentMetro])){
      this.setState({loadingData:true})
      return this.props.loadZipData(this.props.currentMetro,this.props.year)
    }

    if(!this.props.zbpData.geo[this.props.currentMetro]){
      return this.props.loadZbpGeoData(this.props.currentMetro)
    }

    if(!this.state.loadingMap && !this.props.zbpData.zip[this.props.currentMetro] && this.props.zbpData.data[this.props.year] && this.props.zbpData.data[this.props.year][this.props.currentMetro]){
      this.setState({loadingMap: true})
      return this.props.loadZbpZipsGeo(this.props.currentMetro, Object.keys(this.props.zbpData.data[this.props.year][this.props.currentMetro]))
    }

    if(!this.props.naicsKeys){
      return this.props.loadNaicsKeys()
    }
  }

  componentDidMount() {
    this._fecthData()
  }
  
  componentWillReceiveProps (nextProps){
    this._fecthData ()
    console.log('draw map', !this.state.mapLoaded  , nextProps.zbpData.geo[this.props.currentMetro] , nextProps.zbpData.zip[this.props.currentMetro] ,  d3.select('#zip_group')[0][0])
    if(!this.state.mapLoaded  && nextProps.zbpData.geo[this.props.currentMetro] && nextProps.zbpData.zip[this.props.currentMetro] &&  d3.select('#zip_group')[0][0]){
      let fipsData = nextProps.zbpData.geo[this.props.currentMetro]
      let zipsData = nextProps.zbpData.zip[this.props.currentMetro]
      fipsData.features[0].properties.type='metro'
      zipsData.features = zipsData.features.concat(fipsData.features)
      map.renderGeography(zipsData, this.state.mapWidth, this.state.mapHeight)
      this.setState({mapLoaded: true})
    }
  }

  _renderBubbles () {
    if(this.state.mapLoaded && !this.state.bubbleLoaded && this.props.naicsKeys && this.props.zbpData.geo[this.props.currentMetro] && this.props.zbpData.zip[this.props.currentMetro] &&  d3.select('#zip_group')[0][0] && this.props.zbpData.data[this.props.year] && this.props.zbpData.data[this.props.year][this.props.currentMetro]){
      console.log('naicsKeys', this.props.naicsKeys)
      bubble.renderBubbleChart(
        this.props.zbpData.data[this.props.year][this.props.currentMetro],
        this.state.mapWidth,
        this.state.mapHeight,
        map.centroids,
        this.state.options,
        this.props.naicsKeys
      )
      this.setState({bubbleLoaded: true})
    }
  }

  _setFilter(filter,depth) {
    if(depth <= 6){
      this.setState({
        filter,
        depth
      })
    }
  }

  _setSort(sort) {
    this.setState({
      sort
    })
  }

  setMode(mode) {
    let newOptions = this.state.options
    newOptions.mode = mode
    this.setState({
      options: newOptions,
      bubbleLoaded: false
    })
  }

  hasData () {
    return this.props.zbpData[this.props.year] && 
      this.props.zbpData.data[this.props.year][this.props.currentMetro] &&
      this.props.zbpData.geo[this.props.currentMetro]
      this.props.zbpData.zip[this.props.currentMetro]
      this.props.naicsKeys
  }

  renderControls() {

        let zipcodeCount = "",
            currentData = bubble.getCircleArray(this.props.zbpData.data[this.props.year][this.props.currentMetro], this.props.naicsKeys)
            estCounts = {},
            estEmps = {},
            cluster =  this.state.options.mode === "cluster" ? " active" : "",
            zips =  this.state.options.mode === "zips" ? " active" : "";


        if(this.state.data.length > 0){
            zipcodeCount = this.state.geo.features.length - 1;
            estCounts[this.state.year] = currentData.length;
            estEmps[this.state.year] = currentData.reduce((a,b) => { return parseInt(a) + parseInt(b.radius) },0);
            //estCounts[this.state.year2] = this.state.data2.length;
            //estEmps[this.state.year2] = this.state.data2.reduce((a,b) => { return parseInt(a) + parseInt(b.radius) },0);
            /*estCount = this.state.data.length,
            estEmp = this.state.data.reduce((a,b) => { return parseInt(a) + parseInt(b.radius) },0)
            console.log("empEst", estEmp)*/
        }
        

        let style14 = {textAlign:"center",padding:6,fontSize:14 }
        return (
            <div className="col-md-12">
                <div className="row">
                    <div className="col-xs-4" style={style14}>
                        <strong># Zipcodes</strong>
                    </div>
                    <div className="col-xs-8" style={style14}>
                        {zipcodeCount}
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12" style={style14}>
                        <table className="table">
                            <caption><strong>Establishments</strong></caption>
                            <tr><th>{this.state.year2}</th><th>{this.state.year}</th><th>Change</th></tr>
                            <tr>
                                <td>{nf.format(estCounts[this.state.year2])}</td>
                                <td>{nf.format(estCounts[this.state.year])}</td>
                                <td>{nf.format(estCounts[this.state.year] - estCounts[this.state.year2])}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-4" style={{textAlign:"center",padding:6,fontSize:16}}>
                        <strong>Display:</strong>
                    </div>
                    <div className="col-xs-8">
                        <div className="btn-group" role="group" >
                          <button type="button" className={"btn btn-default " + cluster} onClick={this.setMode.bind(null,"cluster")}>Industry</button>
                          <button type="button" className={"btn btn-default " + zips} onClick={this.setMode.bind(null,"zips")}>Geography</button>
                        </div>
                    </div>
                </div>
            </div>
        )
  }

  render () {
    //if (!this.hasData()) return <span />
    let naicsLib = this.props.naicsKeys
    let reset = <a onClick={this._setFilter.bind(this,null,2)}>reset</a>
    this._renderBubbles()
    return (
      <div className='container'>
        <h4>Metro Map</h4>
        <div className='row'>
          <div className='col-sm-3'>
            {this.renderControls()}
          </div>
          <div className='col-sm-9'>
            <svg id="circles" style={{width:600, height:600}} >
              <g id="circle_group" />
              <g id="zip_group" />
            </svg>
            <div id="nytg-tooltip">
              <div id="nytg-tooltipContainer">
                <div className="nytg-department"></div>
                <div className="nytg-rule"></div>
                <div className="nytg-name"></div>
                <div className="nytg-discretion"></div>
                <div className="nytg-valuesContainer">
                    <span className="nytg-value"></span>
                    <span className="nytg-change"></span>
                </div>
                <div className="nytg-chart"></div>
                <div className="nytg-tail"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
}

const mapStateToProps = (state) => {
  return ({
    mapLoaded : state.geoData.loaded,
    metrosGeo : state.geoData.metrosGeo,
    zbpData : state.metroZbpData,
    naicsKeys : state.metros.naicsKeys
  })
}

export default connect((mapStateToProps), {
  loadZbpGeoData: (currentMetro) => loadMetroGeo(currentMetro),
  loadZbpZipsGeo: (currentMetro, zips) => loadMetroZipsGeo(currentMetro,zips),
  loadZipData: (currentMetro,year) => loadZipData(currentMetro,year),
  loadNaicsKeys: () => loadNaicsKeys()
})(MetroZbp)

