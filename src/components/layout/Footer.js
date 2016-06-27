/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from  'react-router'
import classes from './Footer.scss'
import sitewideClasses from 'styles/sitewide/index.scss'
// import classes from './HomeView.scss'

export class Footer extends React.Component {
  render () {
    return (
        <div className={classes['footer']}>
          Its the footer ....
        </div>
    )
  }
}

const mapStateToProps = (state) => ({
  router: state.router,
  metros : state.metros || {}
})

export default connect((mapStateToProps), {})(Footer)
