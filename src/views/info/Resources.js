/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import classes from 'styles/sitewide/index.scss'
import { Link } from 'react-router'
import {StickyContainer, Sticky} from 'react-sticky'
import { Scrollspy } from 'components/util/Scrollspy'
import DataSources from './DataSources'
import Atlas from './Atlas'
import Research from './Research'
import styles from  './Resources.scss'


export default class Resources extends React.Component {
  
  renderContent () {
    var page = this.props.params['resource']

    switch (page) {
      case 'datasources':
        return <DataSources />
      case 'research':
        return <Research />
      default:
        return (
          <Atlas />
        )
      
    }
  }

  _isActive(input){
    let page = this.props.params['resource']
    return page === input ? styles['is-page'] : null
  }

  render () {
    let subStyle = {
       marginLeft: 10,
      fontSize: 12,
      fontWeight:100,
      //color
      
    }






    var color = '#5d5d5d'
    return (
        <div className='container-fluid' >
        <StickyContainer>
        <div className='container'>
          <div className='row'>
            <Sticky style={{paddingTop:"5px"}}>
              <div id="rankingsTableSelect" className="col-md-2">
                <ul className={"nav nav-pills nav-stacked " + styles['kuafnav']}  style={{color:'#efefef'}}>
                  
                  <li role="presentation" className={this._isActive(undefined)}>
                    <Link to="/resources" style={{color}}>Overview</Link>
                    { this._isActive(undefined) ?
                      <Scrollspy className={"nav nav-pills nav-stacked " + styles['kuafnav']} params={this.props.params} items={ ['density', 'diversity', 'fluidity'] } currentClassName={styles['is-current']} className="nav nav-pills nav-stacked">
                        <li style={subStyle} role="presentation" >
                          <a href="#density"  style={{color}}>Density</a>
                        </li>
                        <li style={subStyle} role="presentation" >
                          <a href="#diversity" style={{color}}>Diversity</a>
                        </li>
                        <li style={subStyle} role="presentation" >
                          <a href="#fluidity" style={{color}}>Fluidity</a>
                        </li>
                      </Scrollspy>
                      : <span/>
                    }
                  </li>
                  
                  <li role="presentation" className={this._isActive('datasources')}>
                    <Link to="/resources/datasources" style={{color}}>Data Sources</Link>
                    { this._isActive('datasources') ?
                      <Scrollspy params={this.props.params} items={ ['computed', 'apis', 'other'] } currentClassName={styles['is-current']} className="nav nav-pills nav-stacked">
                        <li style={subStyle} role="presentation" >
                          <a href="#computed" style={{color}}>Computed Data</a>
                        </li>
                        <li style={subStyle} role="presentation" >
                          <a href="#apis" style={{color}}>Avail APIs</a>
                        </li>
                        <li style={subStyle} role="presentation" >
                          <a href="#other" style={{color}}>Other Sources</a>
                        </li>
                      </Scrollspy>
                      : <span/>
                    }
                  </li>
                    
                  <li role="presentation" className={this._isActive('research')}>
                    <Link to='/resources/research' style={{color}}>Research</Link>
                  </li>
                </ul>
              </div>
            </Sticky>
            <div className={'col-md-10 ' + styles['text-div']}  style={{backgroundColor: '#f7f7f7', float:"right", overflow: 'hidden',marginBottom: 2, marginTop: -3}}>
             {this.renderContent ()}
            </div>
          </div>
        </div>
      </StickyContainer>
      </div>
    )
  }
}
