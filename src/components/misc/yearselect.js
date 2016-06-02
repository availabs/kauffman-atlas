"use strict"
import React from 'react'
import { connect } from 'react-redux'
import { setYear } from 'redux/modules/metroTime'
import _  from 'lodash'
import Select from 'react-select'
import 'react-select/dist/react-select.css'

class YearSelect extends React.Component{
  constructor () {
      super()
    this.state = {
        year:''
    }
    this._change = this._change.bind(this)
  }


  _change (x) {
    console.log('change',x)
    this.props.loadYear({key:this.props.type,value:x.value+''})
  }

  componentWillReceiveProps (nextProps) {
    if(this.props.year !== nextProps.year && parseInt(nextProps.year))
      this.setState({year:parseInt(nextProps.year)})
  }
    
  render () {
    let elements = _.range(2001,2015).map((x,i) => {return {value:x,label:x+''}})
    return (
      <div>
        <div className='row'>
          <strong> {'Year '+(this.props.id || '')} </strong>
        </div>
        <div className='row'>
          <div className='col-sm-12'>
            <Select
                ref='selectYear'
                autofocus
                name={'year'+this.state.year}
                options={elements}
                value={(this.state.year || parseInt(this.props.year))}
                onChange={this._change} />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({})
console.info('connection',mapStateToProps,setYear)
export default connect ((mapStateToProps), {
    loadYear: (year) => setYear(year)
})(YearSelect)
  
