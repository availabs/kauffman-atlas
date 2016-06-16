"use strict"


import React from 'react'
import d3 from 'd3'
import _ from 'lodash'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { StickyContainer, Sticky } from 'react-sticky'

import { msaChange, loadMetroData, loadMetroDataYear, yearQuarterWheelChange } from 'redux/modules/metroQcewData'
import { loadNaicsKeys } from 'redux/modules/msaLookup'
import { setYear } from 'redux/modules/metroTime'
import RadarChart from 'components/vis/RadarChart/RadarChart'
import classes from 'styles/sitewide/index.scss'
import NaicsGraph from 'components/graphs/NaicsGraph'
import {typemap} from 'support/qcew/typemap'
import YearSelect from 'components/misc/yearselect'


let startingYear = '2001'

const stickyToolbarStyle = {
  color: '#f7f7f7', 
  backgroundColor: '#7D8FAF', 
  paddingTop: 2,
  paddingRight: 17,
  paddingBottom: 2,
  paddingLeft: 17,
  borderStyle: 'solid',
  borderTopWidth: 0,
  borderBottomWidth: 2,
  borderColor: '#f7f7f7',
  zIndex:100,
}

const buttonStyle = {
  color: '#f7f7f7', 
  backgroundColor: '#7D8FAF', 
  boxShadow: '0 1px 2px 0 rgba(247,247,247,0.2), 0 1px 2px 0 rgba(247,247,247,0.19)',
  border: '0px solid transparent',
  marginLeft: '1px',
  marginRight: '1px',
}



export class MetroQcew extends React.Component<void, Props, void> {
  constructor () {
    super()

    this.state = {
      depth  : 2,
      filter : null,
      sort   : 'type_quot'
    }

    this._fetchData          = this._fetchData.bind(this)
    this._processData        = this._processData.bind(this)
    this._setFilter          = this._setFilter.bind(this)
    this._quarterReduce      = this._quarterReduce.bind(this)
    this.renderNaicsOverview = this.renderNaicsOverview.bind(this)
    this.renderRadar         = this.renderRadar.bind(this)
  }


 
  _fetchData () {

    let qcew = this.props.qcewData
    let msa  = this.props.currentMetro
    let year = this.props.year

    if (!qcew || !qcew.length || !qcew[msa][year]) {
      this.props.loadQcewDataYear(this.props.currentMetro, this.props.year)
    }

    if (this.state.filter) {
      this.props.loadQcewDataYear(this.props.currentMetro,
                                  this.props.year,
                                  this.props.naicsTable.Query(this.state.filter, 1, true))
    }
    
    if (!this.props.naicsKeys) {
      return this.props.loadNaicsKeys()
    }
  }

  _processData (msa, year, quarter, depth, filter) {
    if (!this.props.qcewData || !this.props.qcewData[msa] || !this.props.qcewData[msa][year]) {
      return
    }

    let entries = this.props.qcewData[msa][year].filter((d) => ((quarter === null) || (d.qtr === quarter)))

    let currentData = d3.nest()
                        .key(x => x.industry_code)
                        .entries(entries)

    let naicsLib = this.props.naicsKeys

    if (!depth) { depth = 2 }

    let fields = typemap[this.props.type]

    let naicsKeys = currentData.filter(ind => 
        ind.values.reduce((a,b) => (a && fields.reduce((tf, field) => (tf && b[field]), true)), true)
    )

    if (filter) {
        let truekeys = this.props.naicsTable.Query(filter, 1, true)
        naicsKeys = naicsKeys.filter(obj => (truekeys.indexOf(obj.key) >= 0))
    }

    let totalType = 0
    var scope = this

    var data = naicsKeys.reduce((prev,current) => {
      var twoDigit = current.key.substr(0,depth)

      if (naicsLib[twoDigit].part_of_range) {
        twoDigit = naicsLib[twoDigit].part_of_range;
      }

      if (!prev[twoDigit]) {
        prev[twoDigit] = {
          type      : 0,
          typeShare : 0,
        }
      }

      let t1 = (fields.map(key => scope._quarterReduce(current.values, key))
                      .reduce((a,b) => a+b)) / fields.length
      
      totalType += t1

      let lqtypekeys = fields.map(x => 'lq_'+x)
    
      let lqt1 = 0
      
      lqt1 = (lqtypekeys.map(key => scope._quarterReduce(current.values, key))
                        .reduce((a,b) => a+b)) / lqtypekeys.length
      
      prev[twoDigit].type += t1
      
      prev[twoDigit].typeQuot = lqt1
      
      return prev
    },{})

    Object.keys(data).forEach((k) => {
      let x = data[k]
      x.typeShare = (x.type/totalType) || 0
    })

    return data
}

  _quarterReduce = (obj, field) => (obj.reduce((x,y) => (x + +y[field]), 0) / 4)


  _setFilter(filter, depth) {
    if (depth <= 6) {
      this.setState({ filter, depth })
    }
  }

  _setSort (sort) {
    this.setState({ sort })
  }

  summarizeData (naicsCodes, naicsLib) {

    let codeRunner = (field1, field2, d) => {
      naicsCodes[d][field1] = naicsCodes[d][field2]
      return d
    }

    let dataFormatter = (field, d) => ({
      axis  : naicsLib[d].title.substr(0,6),
      value : naicsCodes[d][field]
    })
    
    let typeQuot =  Object.keys(naicsCodes)
                          .map(codeRunner.bind(null, 'type_quot', 'typeQuot'))
                          .map(dataFormatter.bind(null, 'type_quot'))

    let typeShare = Object.keys(naicsCodes)
                          .map(dataFormatter.bind(null, 'typeShare'))

    return {
      typeShare,
      typeQuot,
    }
  }

  renderRadar (year, quarter, depth, filter, year2) {

    let msa        = this.props.currentMetro
    let naicsCodes = this._processData(msa, year, quarter, depth, filter)
    let naicsLib   = this.props.naicsKeys

    if(!naicsCodes || !Object.keys(naicsCodes).length) {
      return (<span></span>)
    }

    let curQuants  = this.summarizeData(naicsCodes, naicsLib)
    let typeShares = [
      curQuants.typeShare
    ]
    let typeQuots  = [
      curQuants.typeQuot
    ]

    let rOpts = {
      w           : 190,
      h           : 190,
      ExtraWidthX : 130,
      TranslateX  : 50,
      color       : d3.scale.ordinal().range(['#c58a30','#7D8FAF'])
    }


    return (
      <div className='row'>

        <div className='col-sm-5'
             style={{'textAlign': 'center',padding:0}}>

              <strong>{this.props.title} Share by Industry</strong>

              <RadarChart divID='typeShare' 
                          data={typeShares}
                          options={rOpts} />
        </div>

        <div className='col-sm-5'
             style={{'textAlign': 'center', padding: 0}}>

            <strong>{this.props.title} Quotient by Industry</strong>

            <RadarChart divID='typeQout' 
                        data={typeQuots}
                        options={rOpts} />
        </div>
      </div>
    )
  }

  renderNaicsOverview (year, depth, filter) {

    let sortVariable = 'type_quot'

    let msa = this.props.currentMetro

    if(!this.props.qcewData || !this.props.qcewData[msa] || !this.props.qcewData[msa][year]) {
      return null
    }

    let metro      = this.props.currentMetro
    let page       = this.props.title
    let naicsCodes = this._processData(msa, year, '1', depth, filter)
    let naicsLib   = this.props.naicsKeys

    let naicsRows = Object.keys(naicsCodes)
                          .map(d => { naicsCodes[d].type_quot = naicsCodes[d].typeQuot; return d })
                          .sort((a,b) => (naicsCodes[b][this.state.sort] - naicsCodes[a][this.state.sort]))
                          .map((d) => (
                                  <tr key={d}>

                                    <td>
                                      <Link to ={'/metro/'+metro+'/'+page+'/'+d}
                                            className={classes['bluelink']}
                                            onClick={this._setFilter.bind(this, d, this.state.depth + 1)}
                                            alt={naicsLib[d].description}>

                                          {d} | {naicsLib[d].title}
                                      </Link>
                                    </td>

                                    <td>
                                      {naicsCodes[d].type.toLocaleString()}
                                    </td>

                                    <td>
                                      {+(naicsCodes[d].typeShare*100).toLocaleString()}%
                                    </td>

                                    <td>
                                      {+(naicsCodes[d].type_quot).toLocaleString()}
                                    </td>

                                  </tr>))

    return (
      <table className='table'>

        <thead>
          <tr>
            <td>
              {this.props.title}
            </td>

            <td>
              <a className={classes['bluelink']}
                 onClick={this._setSort.bind(this,'type')}>

                  {this.props.title}
              </a>
            </td>

            <td>
              <a className={classes['bluelink']}
                 onClick={this._setSort.bind(this,'typeShare')}>

                  {this.props.title} Share
              </a>
            </td>

            <td>
              <a className={classes['bluelink']}
                 onClick={this._setSort.bind(this,'type_quot')}>

                  {this.props.title} Quotient
              </a>
            </td>
          </tr>
        </thead>

        <tbody>
          {naicsRows}
        </tbody>
      </table>
    )
  }

  componentDidMount() {
    this.props.msaChange(this.props.currentMetro)

    this._fetchData()
  }
  
  componentWillReceiveProps (nextProps) {
    this._fetchData()

    let naics_code = nextProps.params.naics_code

    if (this.props.msa !== nextProps.currentMetro) {
      this.props.msaChange(nextProps.currentMetro)
    }

    if (naics_code && (naics_code !== this.state.filter)) {
      this.setState({
        filter : naics_code,
        depth  : (naics_code.length + 1),
      })
    }

    if(!naics_code && (this.state.filter)){
      this.setState({
        filter:null,
        depth:2,
      })
    }
  }

  componentDidUpdate (p,prevState){
    if (this.state.filter !== prevState.filter) {
      this._fetchData()
    }
  }
  
  render () {

    if (!this.props.naicsKeys) { return <span/> }

    let props = this.props

    let naicsLib = props.naicsKeys
    let filter   = this.state.filter
    let fkeys    = (filter) ? props.naicsTable.Query(filter,1,true) : null

    let reset = (
        <Link to={`/metro/${props.currentMetro}/${props.title}`}
              onClick={this._setFilter.bind(this, null, 2)}>

          {' reset'}
        </Link>)

    let selectedYear = _.get(props, 'selectedQtr.year', props.year)
    let selectedQuarter = _.get(props, 'selectedQtr.quarter', null)

    return (
      <div className='container'>

        <StickyContainer>    
          <Sticky className="foo" 
                  style={stickyToolbarStyle} 
                  stickyStyle={stickyToolbarStyle}>

            <div className='row'>
              <div className='col-xs-12 text-center' style={{backgroundColor: '#5d5d5d'}}>
                {this.state.filter || '--'} | 
                {(naicsLib[this.state.filter]) ? naicsLib[this.state.filter].title : 'All Sectors'} 
                {this.state.depth > 2 ? reset : ''}
              </div>
            </div>

            <div className='row'>
              <div className='col-xs-offset-8 col-xs-4 button-group text-right' role="group">
                <strong style={_.merge({ paddingTop: '1px', 
                                         paddingBottom: '1px', 
                                         paddingLeft: '2px', 
                                         paddingRight: '4px', 
                                         marginTop: '5px'}, 
                                       buttonStyle)}
                        onWheel={(e) => { 
                                 props.yearQuarterWheelChange((e.deltaY) < 0 ? 1 : -1)
                                 e.preventDefault()}}>

                    {(props.selectedQtr) ? `Quarter:  Q${props.selectedQtr.quarter}-${props.selectedQtr.year}` : ''}
                </strong>
                <button id='qwi-quarter-decrement' 
                        type="button" 
                        className="btn btn-secondary btn-sm" 
                        style={buttonStyle}
                        onClick={(e) => { 
                                 props.yearQuarterWheelChange(-1)
                                 e.preventDefault()}}> -
                </button>
                <button id='qwi-quarter-increment' 
                        type="button" 
                        className="btn btn-secondary btn-sm" 
                        style={buttonStyle}
                        onClick={(e) => { 
                                 props.yearQuarterWheelChange(1)
                                 e.preventDefault()}}> +
                </button>
              </div>
            </div>
          </Sticky>

          <div className='row'>
            <div key='leftpad' 
                 style={{ textAlign: 'left', padding: 15 }}>

              {
                (naicsLib[this.state.filter] && naicsLib[this.state.filter].description) ? 
                  naicsLib[this.state.filter].description.filter((d,i) => (i < 4 && d !== "The Sector as a Whole"))
                                                         .map((d,i) => (<p key={'desc'+i}>{d}</p>)) : 
                  ''
              }
            </div>
          </div>

          <NaicsGraph filter={fkeys}
                      currentMetro={props.currentMetro}
                      type={props.type}
                      title={props.title} />

          <div>
            {this.renderRadar(selectedYear, selectedQuarter, this.state.depth, this.state.filter, props.syear)}
          </div>
          <div>
            {this.renderNaicsOverview(props.year, this.state.depth, this.state.filter, props.syear)}
          </div>
        </StickyContainer>    
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  mapLoaded   : state.geoData.loaded,
  metrosGeo   : state.geoData.metrosGeo,
  qcewData    : state.metroQcewData.yeardata,
  naicsKeys   : state.metros.naicsKeys,
  naicsTable  : state.metros.naicsLookup,
  loadState   : state.metroQcewData.year_requests,
  selectedQtr : state.metroQcewData.selectedQuarter,
})

const mapDispatchToProps = {
  msaChange,
  loadQcewData     : loadMetroData,
  loadQcewDataYear : loadMetroDataYear,
  loadYear         : setYear,
  loadNaicsKeys,
  yearQuarterWheelChange,
}

export default connect(mapStateToProps, mapDispatchToProps)(MetroQcew)

