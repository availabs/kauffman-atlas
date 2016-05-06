/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import MetroMap from 'components/maps/MetroMap'
import MetroZbpCluster from 'components/metro/MetroZbpCluster'
import MetroZbp from 'components/metro/MetroZbp'
import classes from 'styles/sitewide/index.scss'
import { Link } from 'react-router'

type Props = {
};

export class MetroHome extends React.Component<void, Props, void> {
  constructor () {
    super()
    this.state = {
     display: 'industry'
    }
    this.renderDisplay = this.renderDisplay.bind(this)
    this._selectDisplay = this._selectDisplay.bind(this)
    this._isActive = this._isActive.bind(this)
    this._linkIsActive = this._linkIsActive.bind(this)
  }

  _isActive(type){
    return type === this.state.display ? classes['active'] : ''
  }

  _linkIsActive(type){
    return type === this.state.display ? classes['active-link'] : ''
  }

  _selectDisplay (display) {
    this.setState({display})
  }

  renderDisplay(){
    let metroId = this.props.router.locationBeforeTransitions.pathname.split('/')[2]
    switch(this.state.display){
      case 'industry':
        return (
           <MetroZbp currentMetro={metroId} year='2012'/>
        )
      case 'cluster':
        return (
           <MetroZbpCluster currentMetro={metroId} year='2012'/>
        )
      default: 
        return (
          <MetroZbp currentMetro={metroId} year='2012'/>
        )
    }
  }

  render () {

    let metroId = this.props.router.locationBeforeTransitions.pathname.split('/')[2]
    if(!this.props.metros[metroId]){
      return (
        <div>
          <div className='container text-center'>
            <div className='row'>
              <div className='col-xs-12'>
                <h4>Invalid Metro Area Code {metroId}</h4>
                {JSON.stringify(this.props.router)}
              </div>
            </div>            
          </div>
        </div>
      ) 
    }
    else{
      return (
        
        <div className='container text-center'>
          <h4>{this.props.metros[metroId].name}</h4>
          <div className='row'>
            <div className='col-xs-3'>
                <MetroMap currentMetro={metroId} />
                Population: {this.props.metros[metroId].pop['2012']}
            </div>
          </div>

          <div className='row'>
            <div className='col-xs-3' onClick={this._selectDisplay.bind(null,'combined')}>
              <div className={classes['selector-buttons']+' '+this._isActive('combined')}>
                <Link className={this._linkIsActive('combined') +' '+ classes['darklink']} to='/combined'>Combined</Link>
              </div>    
            </div>
            <div className='col-xs-3' onClick={this._selectDisplay.bind(null,'industry')}>
              <div className={classes['selector-buttons']+' '+this._isActive('industry')}>
                <Link className={this._linkIsActive('industry') +' '+ classes['darklink']} to='/industry'>Industries (By NAICS)</Link>
              </div>    
            </div>
            <div className='col-xs-3' onClick={this._selectDisplay.bind(null,'cluster')}>
              <div className={classes['selector-buttons']+' '+this._isActive('cluster')}>
                <Link className={this._linkIsActive('cluster') +' '+ classes['darklink']} to='/cluster'>Industry Clusters</Link>
              </div>    
            </div>
            <div className='col-xs-3' onClick={this._selectDisplay.bind(null,'workforce')}>
              <div className={classes['selector-buttons']+' '+this._isActive('workforce')}>
                <Link className={this._linkIsActive('workforce') +' '+ classes['darklink']} to='/workforce'>Workforce</Link>
              </div>    
            </div>
          </div>

          <div className='row'>
            <div className={'col-xs-12 ' + classes['text-div']}>
              <strong>Lorem</strong> ipsum dolor sit amet, mel nibh soluta molestiae in, ut vis illud utamur disputando, sed id eius bonorum. Mei vivendum adversarium ex, libris assentior eu per. In summo invenire interpretaris quo, ex vix partem facilisis signiferumque, ridens splendide conclusionemque an vis. Dico aliquip scriptorem vix et. Te eum omnes possit omittantur. Ei volutpat dignissim sit, erat option pri in.
            </div>
          </div>

          <div className='row'>
              {this.renderDisplay()}
          </div>           
        </div>

      )      
    }

  }
}

const mapStateToProps = (state) => ({
  router : state.router,
  metros : state.metros
})

export default connect((mapStateToProps), {})(MetroHome)
