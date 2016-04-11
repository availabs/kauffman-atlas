/* @flow */
import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
// import { increment, doubleAsync } from '../../redux/modules/counter'
// import classNamees from './NavBar.scss'



// We avoid using the `@connect` decorator on the className definition so
// that we can export the undecorated component for testing.
// See: http://rackt.github.io/redux/docs/recipes/WritingTests.html
export class NavBar extends React.Component<void, Props, void> {
  static propTypes = {
    router: PropTypes.object.isRequired,
  };



  render () {
    const sectionStyle = {
      height: 200,
      border: '1px solid orangered'
    }
    return (
      <div>
        <nav className='navbar navbar-default'>
          <div className='container'>

            <div className='navbar-header'>
              <button type='button' className='navbar-toggle collapsed' data-toggle='collapse' data-target='#bs-example-navbar-collapse-1' aria-expanded='false'>
                <span className='sr-only'>Toggle navigation</span>
                <span className='icon-bar'></span>
                <span className='icon-bar'></span>
                <span className='icon-bar'></span>
              </button>
              <Link className='navbar-brand' to='/'>Atlas of Entrepreneurial Activity</Link>
            </div>


            <div className='collapse navbar-collapse' id='bs-example-navbar-collapse-1'>
              <ul className='nav navbar-nav'>
                <li className='active'><a href='#'>Link <span className='sr-only'>(current)</span></a></li>
                <li><a href='#'>Link</a></li>
              </ul>

              <ul className='nav navbar-nav navbar-right'>
                <li><a href='#'>Link</a></li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  router: state.router
})
export default connect((mapStateToProps), {})(NavBar)
