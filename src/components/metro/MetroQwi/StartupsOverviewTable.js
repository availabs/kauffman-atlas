"use strict"

import React from 'react'

export const StartupsOverviewTable = (props) => null

export default StartupsOverviewTable


/**
 * NOTE: The code in this file is in an early draft stage.
 *       The intention is to get quotients for the startups.
 *       This will require a bit of work on the QWI API before 
 *           things can proceed in here.
 */

//export default (props) => (
      //return (
          //<table className='table'>
              //<thead>
                  //<tr>
                      //<td>{this.props.title}</td>
                      //<td><a className={classes['bluelink']}
                             //onClick={this._setSort.bind(this,'type')}>
                          //{this.props.title}</a></td>
                      //<td><a className={classes['bluelink']}
                             //onClick={this._setSort.bind(this,'typeShare')}>
                          //{this.props.title} Share</a></td>
                      //<td><a className={classes['bluelink']}
                             //onClick={this._setSort.bind(this,'type_quot')}>
                          //{this.props.title} Quotient</a></td>
                  //</tr>
              //</thead>
              //<tbody>
                  //{naicsRows}
              //</tbody>
          //</table>
      //)
  //}


//function buildTableRows (props) => {
  
  //let msa = props.msa

  //if(!props.qcewData || !this.props.qcewData[msa] ||
     //!this.props.qcewData[msa][year])
      //return null

  //let metro = this.props.msa
  //let page = this.props.title

  //let naicsCodes = this._processData(msa, year, depth, filter)
  //let naicsLib = this.props.naicsKeys


  //let naicsRows = Object.keys(naicsCodes)
      //.map(d => {
          //naicsCodes[d].type_quot = naicsCodes[d].typeQuot
          //return d
      //})
      //.sort((a,b) => {
          //return naicsCodes[b][this.state.sort] - naicsCodes[a][this.state.sort]
      //})
      //.map((d) =>{
          //return (
              //<tr key={d}>
                  //<td>
                      //<Link to ={'/metro/'+metro+'/'+page+'/'+d}
                            //className={classes['bluelink']}
                            //onClick={this._setFilter
                                         //.bind(this, d,
                                               //this.state.depth+1)}
                            //alt={naicsLib[d].description}>
                          //{d} | {naicsLib[d].title}
                      //</Link>
                  //</td>
                  //<td>{naicsCodes[d].type.toLocaleString()}</td>
                  //<td>{+(naicsCodes[d].typeShare*100).toLocaleString()}%</td>
                  //<td>{+(naicsCodes[d].type_quot).toLocaleString()}</td>
              //</tr>
          //)
      //})
//}
