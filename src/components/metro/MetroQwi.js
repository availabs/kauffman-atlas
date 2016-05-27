"use strict"

import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'

import d3 from 'd3'

import { loadMetroData } from 'redux/modules/metroQwiData'

import { loadNaicsKeys } from 'redux/modules/msaLookup'

import RadarChart from 'components/vis/RadarChart/RadarChart'

//import NaicsGraph from 'components/graphs/NaicsGraph'

import classes from 'styles/sitewide/index.scss'



export class MetroQwi extends React.Component<void, Props, void> {
    
  constructor () {
    super()
    
    this.state = {
      depth: 2,
      filter: null,
      sort: 'type_quot'
    }

    this._fetchData          = this._fetchData.bind(this)
    this._processData        = this._processData.bind(this)
    this._setFilter          = this._setFilter.bind(this)
    this._quarterReduce      = this._quarterReduce.bind(this)
    //this.renderNaicsOverview = this.renderNaicsOverview.bind(this)
    //this.renderRadar         = this.renderRadar.bind(this)
  }
    

  _fetchData () {
    this.props.loadMetroData(this.props.currentMetro, this.props.type)
  }


  _processData (msa, year, depth, filter) {

    if(!this.props.qwiData || !this.props.qwiData[msa] || !this.props.qwiData[msa][year]) { return }

    let currentData = d3.nest()
                        .key( x=>x.industry_code )
                        .entries(this.props.qwiData[msa][year]);

    let naicsLib = this.props.naicsKeys

    depth = depth || 2

    let fields = typemap[this.props.type]

    let naicsKeys = currentData.filter(ind => 
      ind.values.reduce((a,b) => 
        (a && fields.reduce((tf,field) => tf && b[field],true))
      , true)
    )

    if(filter){
      let truekeys = this.props.naicsTable.Query(filter,1,true)
      naicsKeys = naicsKeys.filter(obj => truekeys.indexOf(obj.key) >= 0)
    }

    let totalType = 0

    var that = this

    var data = naicsKeys.reduce((prev,current) => {

      var twoDigit = current.key.substr(0,depth)

      if(naicsLib[twoDigit].part_of_range){
        twoDigit = naicsLib[twoDigit].part_of_range;
      }

      if(!prev[twoDigit]){
        prev[twoDigit] = {
          type      : 0,
          typeShare : 0
        }
      }

      let t1 = 0
    
      t1 = fields.map(key => that._quarterReduce(current.values, key))
                 .reduce((a,b) => a+b)/fields.length
      
      totalType += t1

      let lqtypekeys = fields.map(x => `lq_${x}`)
      
      let lqt1 = lqtypekeys.map(key => that._quarterReduce(current.values,key))
                           .reduce((a,b) => a+b)
      lqt1 /= lqtypekeys.length
      
      prev[twoDigit].typeQuot = lqt1
      
      prev[twoDigit].type += t1
      
      return prev
    },{})

    Object.keys(data).forEach( k  => (data[k].typeShare = data[k].type/totalType || 0))

    return data
  }


  _quarterReduce(obj,field) {
    let total = obj.reduce( (x,y) =>  (x + +y[field]), 0)
    return total/4
  }


  _setFilter(filter,depth) {
    if(depth <= 6){
      this.setState({
        filter,
        depth,
      })
    }
  }


  _setSort(sort) {
    this.setState({sort})
  }


  summarizeData (naicsCodes, naicsLib) {

    let codeRunner = (field1,field2,d) => {
      naicsCodes[d][field1] = naicsCodes[d][field2]
      return d
    }

    let dataFormatter = (field,d) => ({
      axis  : naicsLib[d].title.substr(0,6),
      value : naicsCodes[d][field]
    })
    
    let typeQuot =  Object.keys(naicsCodes)
                          .map(codeRunner.bind(null,'type_quot','typeQuot'))
                          .map(dataFormatter.bind(null,'type_quot'))

    let typeShare = Object.keys(naicsCodes)
                          .map(dataFormatter.bind(null,'typeShare'))

    return {
      typeShare,
      typeQuot,
    }
  }


  //renderRadar(year,depth, filter,year2){

    //let msa = this.props.currentMetro;
    //let naicsCodes = this._processData(msa,year,depth,filter)
    //let naicsCodesPast = this._processData(msa,year2 ||'2001',depth,filter)
    //let naicsLib = this.props.naicsKeys

    //if (!naicsCodes || !Object.keys(naicsCodes).length) {
      //return (<span></span>)
    //}

    //let curQuants  = this.summarizeData(naicsCodes, naicsLib)
    //let pastQuants = this.summarizeData(naicsCodesPast, naicsLib)
    //let typeShares = [pastQuants.typeShare,curQuants.typeShare]
    //let typeQuots  = [pastQuants.typeQuot, curQuants.typeQuot]

    //let rOpts = {
      //w           : 190,
      //h           : 190,
      //ExtraWidthX : 130,
      //TranslateX  : 50,
      //color       : d3.scale.ordinal().range(['#FFF200','#7D8FAF'])
    //}

    //return (
      //<div className='row'>
        //<div className='col-sm-6'
             //style={{'textAlign': 'center',padding:0}}>

              //<strong>{this.props.title} Share by Industry</strong>

              //<RadarChart divID='typeShare' 
                          //data={typeShares}
                          //options={rOpts} />
        //</div>

        //<div className='col-sm-6'
             //style={{'textAlign': 'center',padding:0}}>

              //<strong>{this.props.title} Quotient by Industry</strong>

              //<RadarChart divID='typeQout' 
                          //data={typeQuots}
                          //options={rOpts} />
        //</div>
      //</div>
    //)
  //}


  //renderNaicsOverview (year, depth, filter) {

    //let sortVariable = 'type_quot'

    //let msa = this.props.currentMetro
    
    //if (!this.props.qwiData || !this.props.qwiData[msa] || !this.props.qwiData[msa][year]) {
      //return null
    //}

    //let metro = this.props.currentMetro
    //let page = this.props.title

    //let naicsCodes = this._processData(msa, year, depth, filter)
    
    //let naicsLib = this.props.naicsKeys

    //let naicsRows = Object.keys(naicsCodes)
                          //.map(d => {
                            //naicsCodes[d].type_quot = naicsCodes[d].typeQuot
                            //return d
                          //})
                          //.sort((a,b) => naicsCodes[b][this.state.sort] - naicsCodes[a][this.state.sort])
                          //.map((d) => (
                            //<tr key={d}>
                              //<td>
                                //<Link to ={'/metro/'+metro+'/'+page+'/'+d}
                                      //className={classes['bluelink']}
                                      //onClick={this._setFilter.bind(this, d, this.state.depth+1)}
                                      //alt={naicsLib[d].description}>

                                          //{d} | {naicsLib[d].title}
                                //</Link>
                              //</td>

                              //<td>
                                //{naicsCodes[d].type.toLocaleString()}
                              //</td>

                              //<td>
                                //{+(naicsCodes[d].typeShare*100).toLocaleString()}%
                              //</td>

                              //<td>
                                //{+(naicsCodes[d].type_quot).toLocaleString()}i
                              //</td>

                            //</tr>
                          //)
                        //)

    //return (
      //<table className='table'>
        //<thead>
          //<tr>
            //<td>{this.props.title}</td>

            //<td>
              //<a className={classes['bluelink']}
                 //onClick={this._setSort.bind(this,'type')}>

                    //{this.props.title}
              //</a>
            //</td>

            //<td>
              //<a className={classes['bluelink']}
                 //onClick={this._setSort.bind(this,'typeShare')}>

                    //{this.props.title} Share
              //</a>
            //</td>

            //<td>
              //<a className={classes['bluelink']}
                 //onClick={this._setSort.bind(this,'type_quot')}>

                    //{this.props.title} Quotient
              //</a>
            //</td>

          //</tr>
        //</thead>

        //<tbody>
          //{naicsRows}
        //</tbody>

      //</table>
    //)
  //}

  componentDidMount() {
      console.info('fetching initial data')
      this._fetchData ()
  }
  
  componentWillReceiveProps (nextProps) {
    this._fetchData();

    let naics_code = nextProps.params.naics_code

    if (naics_code && (naics_code !== this.state.filter)) {
      this.setState({
        filter : naics_code,
        depth  : naics_code.length+1
      })
    }
  }

  componentDidUpdate (p,prevState) {
    if (this.state.filter !== prevState.filter) {
      this._fetchData()
    }
  }
  
  hasData () {
    return  this.props.naicsKeys
  }


  render () {
      
    if (!this.hasData()) { return <span/> }

    let naicsLib = this.props.naicsKeys
    let filter = this.state.filter
    let fkeys = (filter) ? this.props.naicsTable.Query(filter,1,true) : null

    let reset = (
      <Link to={'/metro/'+this.props.currentMetro+'/'+this.props.title}
            onClick={this._setFilter.bind(this,null,2)}>
              {' reset'}
      </Link>
    )

    return (
      <div className='container'>
        
        <div key='leftpad' 
             style={{textAlign: 'left', padding: 15}}>

              { (naicsLib[this.state.filter] && naicsLib[this.state.filter].description) ? 
                 naicsLib[this.state.filter].description
                                            .filter((d,i) => i < 4 && d !== "The Sector as a Whole")
                                            .map((d,i) => <p key={'desc'+i}>{d}</p>) 
                 : '' }
        </div>

        <NaicsGraph filter={fkeys}
                    currentMetro={this.props.currentMetro}
                    type={this.props.type}
                    title={this.props.title} />
      </div>
    )
  }
}

        //<div>
          //{this.renderRadar(this.props.year,this.state.depth, this.state.filter)}
        //</div>

        //<div>
          //{this.renderNaicsOverview(this.props.year,this.state.depth, this.state.filter)}
        //</div>




const mapStateToProps = (state) => {
  return ({
    mapLoaded  : state.geoData.loaded,
    metrosGeo  : state.geoData.metrosGeo,
    qwiData    : state.metroQwiData.data,
    naicsKeys  : state.metroQwiData.industryTitles,
  })
}


const mapActionCreators = {
  loadMetroData,
}


export default connect(mapStateToProps, mapActionCreators)(MetroQwi)

