"use strict"


import React from 'react'
import d3 from 'd3'
import _ from 'lodash'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { StickyContainer, Sticky } from 'react-sticky'

import { msaChange, loadMetroData, yearQuarterWheelChange } from 'redux/modules/metroQcewData'
import { loadNaicsKeys } from 'redux/modules/msaLookup'
import { setYear } from 'redux/modules/metroTime'
import RadarChart from 'components/vis/RadarChart/RadarChart'
import classes from 'styles/sitewide/index.scss'
import NaicsGraph from 'components/graphs/NaicsGraph'
import {typemap} from 'support/qcew/typemap'



const stickyToolbarStyle = {
  color             : '#f7f7f7',
  backgroundColor   : '#7D8FAF',
  paddingTop        : 2,
  paddingRight      : 17,
  paddingBottom     : 2,
  paddingLeft       : 17,
  borderStyle       : 'solid',
  borderTopWidth    : 0,
  borderBottomWidth : 2,
  borderColor       : '#f7f7f7',
  zIndex            : 100,
}

const buttonStyle = {
  color           : '#f7f7f7',
  backgroundColor : '#7D8FAF',
  boxShadow       : '0 1px 2px 0 rgba(247,247,247,0.2), 0 1px 2px 0 rgba(247,247,247,0.19)',
  border          : '0px solid transparent',
  marginLeft      : '1px',
  marginRight     : '1px',
}

const radarChartOptions = {
  w           : 190,
  h           : 190,
  ExtraWidthX : 130,
  TranslateX  : 50,
  color       : d3.scale.ordinal().range(['#c58a30','#7D8FAF']),
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
    this.renderNaicsOverview = this.renderNaicsOverview.bind(this)
    this.renderRadar         = this.renderRadar.bind(this)
  }

 
  _fetchData () {

    let props = this.props

    let qcew = props.qcewData
    let msa  = props.currentMetro
    let year = props.year

    if (!qcew || !qcew.length || !qcew[msa][year]) {
      props.loadQcewData(props.currentMetro)
    }

    if (this.state.filter) {
      props.loadQcewData(props.currentMetro, props.naicsLookup.Query(this.state.filter, 1, true))
    }
    
    if (!props.naicsKeys) {
      return props.loadNaicsKeys()
    }
  }

  // This function processes the data for the RadarGraphs and the NaicsTable
  // It extracts the data for the selectedQuarter and filters on the selected Naics.
  _processData (msa, year, quarter, depth, filter) {

    let props = this.props


    if (!props.qcewData || !props.qcewData[msa] || !props.qcewData[msa][year]) {
      return
    }

    let entries = props.qcewData[msa][year].filter((d) => (d.qtr === quarter))

    // [ { key: <industry_code>, values: [<Data>] } ]
    let dataNestedByIndustry = d3.nest()
                                     .key(x => x.industry_code)
                                     .entries(entries)

    let naicsLib = props.naicsKeys

    if (!depth) { depth = 2 }

    let requiredFields = typemap[props.type]

    // Filters out the industry_codes that do not have all the requiredFields.
    // We actually need to backfill first. 
    let filteredDataNestedByIndustry = dataNestedByIndustry.filter(indData => 
        //indData.values.reduce((a,b) => (a && requiredFields.reduce((tf, field) => (tf && b[field]), true)), true)
        _.every(indData.values, (val) => _.every(requiredFields, (reqField) => val[reqField]))
    )

    if (filter) {
      let requestedNaics = props.naicsLookup.Query(filter, 1, true)
      filteredDataNestedByIndustry = filteredDataNestedByIndustry.filter(obj => (requestedNaics.indexOf(obj.key) >= 0))
    }

    let totalType = 0

    var data = filteredDataNestedByIndustry.reduce( (acc, naicsCode) => {

      var twoDigitNaics = naicsCode.key.substr(0, depth)

      if (naicsLib[twoDigitNaics].part_of_range) {
        twoDigitNaics = naicsLib[twoDigitNaics].part_of_range;
      }

      if (!acc[twoDigitNaics]) {
        acc[twoDigitNaics] = {
          type       : 0,
          type_share : 0,
        }
      }

      let t1 = _(requiredFields).map(k => _.sum(naicsCode.values.map(v => +v[k]).filter(_.isFinite))).mean()

      totalType += t1

      let lqtypekeys = requiredFields.map(x => 'lq_'+x)
    
      let lqt1 = _(lqtypekeys).map(k => _.sum(naicsCode.values.map(v => +v[k]).filter(_.isFinite))).mean()

      acc[twoDigitNaics].type += t1
      
      acc[twoDigitNaics].type_quot = lqt1
      
      return acc
    },{})

    Object.keys(data).forEach((k) => {
      let x = data[k]
      x.type_share = (x.type/totalType) || 0
    })

    return data
}


  _setFilter(filter, depth) {
    if (depth <= 6) {
      this.setState({ filter, depth })
    }
  }

  _setSort (sort) {
    this.setState({ sort })
  }

  summarizeData (processedData, naicsLib) {

    let dataFormatter = (field, d) => ({
      axis  : naicsLib[d].title.substr(0,6),
      value : processedData[d][field]
    })
    
    let type_quot =  Object.keys(processedData)
                          .map(dataFormatter.bind(null, 'type_quot'))

    let type_share = Object.keys(processedData)
                          .map(dataFormatter.bind(null, 'type_share'))

    return {
      type_share,
      type_quot,
    }
  }

  renderRadar (depth, filter) {

    //let year    = this.props.selectedQuarter.year
    //let quarter = this.props.selectedQuarter.quarter

    let year = this.props.selectedQuarter ? this.props.selectedQuarter.year : '2010'
    let quarter = this.props.selectedQuarter ? this.props.selectedQuarter.quarter : '1'

    let msa      = this.props.msa
    let naicsLib = this.props.naicsKeys

    let processedData = this._processData(msa, year, quarter, depth, filter)

    if(!processedData || !Object.keys(processedData).length) {
      return (<span></span>)
    }

    let curQuants  = this.summarizeData(processedData, naicsLib)

    let typeShares = [ curQuants.type_share ]

    let typeQuots  = [ curQuants.type_quot ]

    return (
      <div className='row'>

        <div className='col-sm-5'
             style={{'textAlign': 'center',padding:0}}>

              <strong>{this.props.title} Share by Industry</strong>

              <RadarChart divID='type_share' 
                          data={typeShares}
                          options={radarChartOptions} />
        </div>

        <div className='col-sm-5'
             style={ {textAlign: 'center', padding: 0} }>

            <strong>{ `${this.props.title} Quotient by Industry` }</strong>

            <RadarChart divID='typeQout' 
                        data={typeQuots}
                        options={radarChartOptions} />
        </div>
      </div>
    )
  }

  renderNaicsOverview (depth, filter) {

    let props = this.props

    let sortVariable = 'type_quot'

    let msa = props.currentMetro

    //let year = props.selectedQuarter.year
    //let quarter = props.selectedQuarter.quarter

    // Temp fix until the Store initializes the selectedQuarter properly.
    let year    = props.selectedQuarter ? props.selectedQuarter.year    : '2010'
    let quarter = props.selectedQuarter ? props.selectedQuarter.quarter : '1'

    if ( !(props.qcewData && props.qcewData[msa] && props.qcewData[msa][year]) ) {
      return null
    }

    let page     = props.title
    let naicsLib = props.naicsKeys

    let processedData = this._processData(msa, year, quarter, depth, filter)

    let naicsRows = Object.keys(processedData)
                          .sort((a,b) => (processedData[b][this.state.sort] - processedData[a][this.state.sort]))
                          .map((naicsCode) => (
                                  <tr key={naicsCode}>

                                    <td>
                                      <Link to ={`/metro/${msa}/${page}/${naicsCode}`}
                                            className={classes['bluelink']}
                                            onClick={this._setFilter.bind(this, naicsCode, this.state.depth + 1)}
                                            alt={naicsLib[naicsCode].description}>

                                          {naicsCode} | {naicsLib[naicsCode].title}
                                      </Link>
                                    </td>

                                    <td>
                                      {processedData[naicsCode].type.toLocaleString()}
                                    </td>

                                    <td>
                                      {+(processedData[naicsCode].type_share*100).toLocaleString()}%
                                    </td>

                                    <td>
                                      {+(processedData[naicsCode].type_quot).toLocaleString()}
                                    </td>

                                  </tr>))

    return (
      <table className='table'>

        <thead>
          <tr>
            <td>
              {props.title}
            </td>

            <td>
              <a className={classes['bluelink']}
                 onClick={this._setSort.bind(this,'type')}>

                  {props.title}
              </a>
            </td>

            <td>
              <a className={classes['bluelink']}
                 onClick={this._setSort.bind(this,'type_share')}>

                  {props.title} Share
              </a>
            </td>

            <td>
              <a className={classes['bluelink']}
                 onClick={this._setSort.bind(this,'type_quot')}>

                  {props.title} Quotient
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
        filter : null,
        depth  : 2,
      })
    }
  }

  componentDidUpdate (p,prevState) {
    if (this.state.filter !== prevState.filter) {
      this._fetchData()
    }
  }

  render () {
  //(this.props.qcewData) ? renderVisualizations.call(this) : (<div className='container'>Loading...</div>)
    if (!this.props.naicsKeys) { return <span/> }

    let state = this.state
    let props = this.props

    let naicsLib = props.naicsKeys
    let filter   = state.filter
    let fkeys    = (filter) ? props.naicsLookup.Query(filter,1,true) : null

    let reset = (
        <Link to={`/metro/${props.currentMetro}/${props.title}`}
              onClick={this._setFilter.bind(this, null, 2)}>

          {' reset'}
        </Link>)

    let selectedYear = _.get(props, 'selectedQuarter.year', props.year)
    let selectedQuarter = _.get(props, 'selectedQuarter.quarter', null)

    return (
      <div className='container'>

        <StickyContainer>    
          <Sticky className="foo" 
                  style={stickyToolbarStyle} 
                  stickyStyle={stickyToolbarStyle}>

            <div className='row'>
              <div className='col-xs-12 text-center' style={{backgroundColor: '#5d5d5d'}}>
                {state.filter || '--'} | 
                {(naicsLib[state.filter]) ? naicsLib[state.filter].title : 'All Sectors'} 
                {state.depth > 2 ? reset : ''}
              </div>
            </div>

            <div className='row'>
              <div className='col-xs-offset-8 col-xs-4 button-group text-right' role="group">
                <strong style={_.merge({ paddingTop    : '1px',
                                         paddingBottom : '1px',
                                         paddingLeft   : '2px',
                                         paddingRight  : '4px',
                                         marginTop     : '5px', },
                                       buttonStyle)}
                        onWheel={(e) => { 
                                    props.yearQuarterWheelChange((e.deltaY) < 0 ? 1 : -1)
                                    e.preventDefault() }}>

                    {(props.selectedQuarter) ? 
                        `Quarter: Q${props.selectedQuarter.quarter}-${props.selectedQuarter.year}` : ''}

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
                (naicsLib[state.filter] && naicsLib[state.filter].description) ? 
                  naicsLib[state.filter].description.filter((d,i) => (i < 4 && d !== "The Sector as a Whole"))
                                                         .map((d,i) => (<p key={'desc'+i}>{d}</p>)) : ''
              }
            </div>
          </div>

          <NaicsGraph filter={fkeys}
                      currentMetro={props.currentMetro}
                      type={props.type}
                      title={props.title} />

          <div>
            {this.renderRadar(state.depth, state.filter)}
          </div>
          <div>
            {this.renderNaicsOverview(state.depth, state.filter)}
          </div>
        </StickyContainer>    
      </div>
    )
  }
}



const mapStateToProps = (state) => ({
  msa             : state.metroQcewData.msa,
  qcewData        : state.metroQcewData.yeardata,
  naicsKeys       : state.metros.naicsKeys,
  naicsLookup     : state.metros.naicsLookup,
  selectedQuarter : state.metroQcewData.selectedQuarter,
})

const mapDispatchToProps = {
  msaChange,
  loadQcewData : loadMetroData,
  loadNaicsKeys,
  yearQuarterWheelChange,
}

export default connect(mapStateToProps, mapDispatchToProps)(MetroQcew)

