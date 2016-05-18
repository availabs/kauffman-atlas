/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import MetroHeader from 'components/metro/MetroHeader'
import MetroScores from 'components/metro/MetroScores'
import MetroZbp from 'components/metro/MetroZbp'
import MetroZbpCluster from 'components/metro/MetroZbpCluster'
import classes from 'styles/sitewide/index.scss'

type Props = {
};

export class MetroHome extends React.Component<void, Props, void> {
  constructor () {
    super()
    this.state = {
     display: 'combined'
    }

    this.renderDisplay = this.renderDisplay.bind(this)
    this._selectDisplay = this._selectDisplay.bind(this)
    this._linkIsActive = this._linkIsActive.bind(this)
  }


  _linkIsActive(type){
    return type === this.state.display ? {backgroundColor:'#db9a36'} : {}
  }

  _selectDisplay (display) {
    this.setState({display})
  }

  renderDisplay(){
    let metroId = this.props.router.locationBeforeTransitions.pathname.split('/')[2]
    console.log('render Dsiplay', 2012, metroId)
    switch(this.state.display){
      case 'combined':
        return (
          <MetroScores metroId={metroId} metroData={this.props.metros[metroId]} />
        )
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

  renderNav () {
    let navStyle = {
      backgroundColor: '#5d5d5d',//'#5d5d5d',//'#7d8faf'//'#db9a36',
      borderRadius: 0,
      border: 'none',
      //borderTop: '1px solid #efefef'
    }
    let linkStyle = {

       color: '#efefef'
    }
    return (
      <nav className="navbar navbar-default" style={navStyle}> 
        <div className="container">
          <div className="collapse navbar-collapse">
              <ul className="nav navbar-nav">
                <li style={this._linkIsActive('combined')} onClick={this._selectDisplay.bind(null,'combined')}>
                   <a className={classes['whitelink']}>Combined</a>
                </li>
                <li style={this._linkIsActive('industry')} onClick={this._selectDisplay.bind(null,'industry')}>
                  <a className={classes['whitelink']}>Industry Analysis</a>
                </li>
                <li style={this._linkIsActive('cluster')} onClick={this._selectDisplay.bind(null,'cluster')}> 
                  <a className={classes['whitelink']}>Cluster Analysis</a>
                </li>
                <li onClick={this._selectDisplay.bind(null,'combined')}>
                  <a className={classes['whitelink']}>Workforce Analysis</a>
                </li>
              </ul>
          </div>
        </div>
      </nav>
    )
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
        <div>
          <div style={{backgroundColor: '#7d8faf', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
            <MetroHeader metroId={metroId} metroData={this.props.metros[metroId]} />
            <div className='container'>
              <div className='row'>
                <div className={'col-xs-12 ' + classes['text-div']}>
                  <strong>Lorem</strong> ipsum dolor sit amet, mel nibh soluta molestiae in, ut vis illud utamur disputando, sed id eius bonorum. Mei vivendum adversarium ex, libris assentior eu per. In summo invenire interpretaris quo, ex vix partem facilisis signiferumque, ridens splendide conclusionemque an vis. Dico aliquip scriptorem vix et. Te eum omnes possit omittantur. Ei volutpat dignissim sit, erat option pri in.
                </div>
              </div>
            </div>
          </div>
          {this.renderNav()}
          <div>
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