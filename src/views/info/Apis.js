/* @flow */
import React, { PropTypes } from 'react'
import classes from 'styles/sitewide/index.scss'
import { browserHistory } from 'react-router'


export default class Apis extends React.Component {
  render () {
    return (
      <div className='container'>
        <div className='row'>
          <div className={'col-xs-12 ' + classes['text-div']}>
            <h4>API's</h4>
            The <strong> Atlas of Entreprenurial Activity </strong> is a set of interactive tools and indices designed to provide a visual understanding of the economic indicators of entreprenurial ecosystems in the United States. Take a broad view of the United States with AEA Inddex which combines a dozen different indicators to rank metropolitan areas on their entreprenurial ecosystems or get a detailed overview of entreprenurial and economic activity of individual metropolitan areas. 
          </div>
        </div>
      </div>
    )
  }
}


