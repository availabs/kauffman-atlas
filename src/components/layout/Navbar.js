/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from  'react-router'
import classes from './Navbar.scss'
// import classes from './HomeView.scss'

export class Navbar extends React.Component<void, Props, void> {
  static propTypes = {
    router: PropTypes.object.isRequired,
    metros: PropTypes.object
  };

  render () {

    const sectionStyle = {
      height: 200,
      border: '1px solid orangered'
    }

    let metroId = this.props.router.locationBeforeTransitions.pathname.split('/')[2]
    var metro = this.props.metros[metroId] && this.props.metros[metroId].name ? this.props.metros[metroId].name : ''
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
            
            <Link className={classes['kauffman-navbar-brand'] + ' whitelink'} to='/'>
              <img src='/images/entrepreneurial-ecosystem-symbol.png' className={classes['kauffman-navbar-logo']} />
              Atlas of Entrepreneurial Activity
            </Link>
          </div>

          <div className='collapse navbar-collapse' id='bs-example-navbar-collapse-1'>
           
            <ul className='nav navbar-nav navbar-right'>
            
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
