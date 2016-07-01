/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from  'react-router'
import classes from './Navbar.scss'
import sitewideClasses from 'styles/sitewide/index.scss'
// import classes from './HomeView.scss'

export class Navbar extends React.Component {
  constructor () {
    super()

    this.state = {
      dropdown : false
    }

    this._toggleDropdown = this._toggleDropdown.bind(this)
    
  }

  _toggleDropdown () {
    this.setState({dropdown: !this.state.dropdown})
  }

  render () {

    const sectionStyle = {
      height: 200,
      border: '1px solid orangered'
    }

    let metroId = this.props.router.locationBeforeTransitions.pathname.split('/')[2]
    var metro = this.props.metros[metroId] && this.props.metros[metroId].name ? this.props.metros[metroId].name : ''
    let open = this.state.dropdown ? ' open' : ''
    return (
      <nav className={'navbar ' + classes['kauffman-nav']}>
        <div className='container'>
          <div className='navbar-header'>
            <button type='button' className='navbar-toggle collapsed' data-toggle='collapse' data-target='#bs-example-navbar-collapse-1' aria-expanded='false'>
              <span className='sr-only'>Toggle navigation</span>
              <span className='icon-bar'></span>
              <span className='icon-bar'></span>
              <span className='icon-bar'></span>
            </button>
            
            <Link className={classes['kauffman-navbar-brand'] + ' ' + sitewideClasses['whitelink']} to='/'>
              <img src='/images/entrepreneurial-ecosystem-symbol.png' className={classes['kauffman-navbar-logo']} />
              Entrepreneurial Ecosystem Atlas
            </Link>
          </div>

          <div className='collapse navbar-collapse' id='bs-example-navbar-collapse-1'>
           
            <ul className='nav navbar-nav navbar-right'>
              <li>
                <Link to='/research' className={sitewideClasses['whitelink']} style={{paddingTop:25, paddingBottom:25}}>Research</Link>
              </li>
              <li className={'dropdown' + open} onClick={this._toggleDropdown}>
                <a onClick={this._toggleDropdown} className={ sitewideClasses['whitelink']+' dropdown-toggle' }  style={{paddingTop:25, paddingBottom:25}} href="#" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                  Resources <span className="caret"></span>
                </a>
                <ul className="dropdown-menu">
                  <li><Link to="/about">About</Link></li>
                  <li><Link to="/eei">Entrepreneurial Ecosystem Index</Link></li>
                  <li><Link to="/datasources">Data Sources</Link></li>
                </ul>
              </li>
      
            </ul>
          </div>
        </div>
      </nav>
    )
  }
}

const mapStateToProps = (state) => ({
  router: state.router,
  metros : state.metros || {}
})

export default connect((mapStateToProps), {})(Navbar)
