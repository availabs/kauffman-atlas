"use strict"
import React from 'react'
import { connect } from 'react-redux'
import { loadMetroData } from 'redux/modules/metroQcewData.js'

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
				console.log('state', this.props)
				
				return <span></span>
		}
}

const mapStateToProps = (state) => ({
		data : state.metroQcewData.data
})

export default connect((mapStateToProps), {
		loadData : (msaId,year) => loadMetroData(msaId)
})(NaicsGraph)
