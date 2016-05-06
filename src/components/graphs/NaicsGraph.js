"use strict"
import React from 'react'
import { connect } from 'react-redux'
import { loadMetroData } from 'redux/modules/metroQcewData.js'
import d3 from 'd3'
import LineGraph from 'components/graphs/SimpleLineGraph/index'
type Props = {
};

export class NaicsGraph extends React.Component<void, Props, void> {
		constructor () {
				super()
				this.state={
						data: null,
				}
		}

		_init () {
					if(!this.props.data)
							this.props.loadData(this.props.currentMetro, this.props.currentYear)
		}

		componentWillMount () {
				this._init()
		}		
		componentWillReceiveProps (nextProps){
				this._init()
		}

		render () {
				let yearConst = 1990
				console.log('naics state', this.props)
				if(!this.props.data || !this.props.data.length)
						return <span></span>

				var data = this.props.data[0]
				var colors = d3.scale.category20()
				var xmap = (year, qtr) => {
						var val = 
						4*(parseInt(year)-yearConst) + parseInt(qtr)
						if(!isNaN(val) || val >= 0)
								return val
						else{
								console.log('NaN', year, qtr)
								return 0;
						}
				}
				var revMap = (d) => {
						let chk = d % 4
						let qtr = (chk) ? 4 : (chk);
						let year = Math.floor(d / 4) - ((chk) ? 0 : 1)
						return year + yearConst + ''
				}
				var datamap = (field) => {
					return	data.values.map((industry, ix) => {
								var obj = {}
								obj.key = industry.key
								obj.color = colors(ix)
								obj.values = industry.values.map(rec => {
										return {
												key: (rec.year + 'q' + rec.qtr),
												values:{x: xmap(rec.year, rec.qtr), y: parseFloat(rec[field])}
										}
								})
							obj.values.sort((a,b) => a.values.x-b.values.x)
								return obj
						})
				}
				var normCount = datamap('qtrly_estabs_count')
				var lqCount = datamap('lq_qtrly_estabs_count')
				console.log('normCounts',normCount)
				console.log('lqCounts',lqCount)
				var key = data.values.map((ind,i) =>{
						return <div style={{backgroundColor:colors(i)}}>{ind.key}</div>
				});
				return (<div>
								{key}
								<LineGraph 
								data={normCount} 
								uniq={'qtrlyCount'}
								title={'Quarterly Establishment Count'}
								yFormat={(x)=>x}
								/>
								
								<LineGraph 
								data={lqCount} 
								uniq='lqCount' 
								xFormat={(x)=>revMap(x)} 
								title={'Location Quotient Quarterly Establishment Count'}
								xAxis={true}
								xScaleType={'linear'}
								/>
								</div>)
		}
}

const mapStateToProps = (state) => ({
		data : state.metroQcewData.data
})

export default connect((mapStateToProps), {
		loadData : (msaId, year) => loadMetroData(msaId)
})(NaicsGraph)
