import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import MetroMap from 'components/maps/MetroMap'
import LineGraph from 'components/graphs/SimpleLineGraph'

export class MetroHeader extends React.Component<void, Props, void> {
  render () {
    let popData = [{
      key:'Population',
      strokeWidth: 2,
      values: Object.keys(this.props.metroData.pop).map((d,i) => {
        return {
          key: d,
          values:{
            x: +d,
            y: this.props.metroData.pop[d]//i === 0 ? 0 : (this.props.metroData.pop[d] - this.props.metroData.pop[d - 1]) / this.props.metroData.pop[d - 1] * 100 ,
          }
        }
      })
    }]
    let growth = (this.props.metroData.pop[2014] - this.props.metroData.pop[1990]) / this.props.metroData.pop[1990] * 100
    return (
      <div className='container'>
        <h4>{this.props.metroData.name}</h4>
        <div className='row'>
          <div className='col-xs-3'>
              <MetroMap currentMetro={this.props.metroId} />
              
          </div>
          <div className='col-xs-2'>
              <div>
                <span style={{fontSize:36, fontWeight:0,paddingRight: 10}}> 
                  {this.props.metroData.pop['2014'].toLocaleString()}
                </span> 
                <div style={{display:'inline-block'}}><strong>Population</strong><br />
                  {growth.toLocaleString()}% 
                </div>
              </div>
              <LineGraph data={popData} uniq='popGraph' options={{height: 50}} />
              <span className='pull-left'>{Object.keys(this.props.metroData.pop)[0]}</span>
              <span className='pull-right'>{Object.keys(this.props.metroData.pop)[Object.keys(this.props.metroData.pop).length-1]}</span>
          </div>
        </div>
      </div>
    )      
  }
}

export default MetroHeader