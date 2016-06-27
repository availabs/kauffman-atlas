/* @flow */
import React, { PropTypes } from 'react'
import classes from 'styles/sitewide/index.scss'
import { browserHistory } from 'react-router'


export default class Atlas extends React.Component {
  render () {
    return (
      <div>
        <div className='conatiner-fluid'>
          <div className='container'>
            <div className='row'>
              <div className={'col-xs-12 ' + classes['text-div']}>
                <h4>Datasources</h4>
                 <p>
                  <strong>Combined</strong> At the core of any entrepreneurial ecosystem are the entrepreneurs themselves. 
                  Density is a measure of the rate entrepreneurs form new firms are in a metropolitan area. 
                  The density metric does not measure pure volume, instead it ranks the relative density of new firms, and the percentage of the workforce employed by these young firms. 
                </p>
              </div>
            </div>
          </div>
        </div>
      <div className='conatiner-fluid' style={{backgroundColor: '#64728c', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
          <div className='container'>
            <div className='row'>
              <div className={'col-xs-12 ' + classes['text-div']}>
                <h4>Quarterly Workforce Indicators (QWI) </h4>
                <p>
                 Fluidity is a measure of the health of an entrepreneurial ecosystems that shows how metropolitan areas re-sort, adapt, and react. The fluidity metric measures population growth, population flux, and worker churn. Taken together these measures show the health of worker reallocation which can improve the quality of matches between workers and jobs and is an important element to regional growth. Barriers to worker reallocation can drag down a region’s entrepreneurial vibrancy. </p>
               
                </div>
              </div>
            </div>
        </div>
        <div className='conatiner-fluid' style={{backgroundColor: '#7d8faf', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
          <div className='container'>
            <div className='row'>
            <div className={'col-xs-12 ' + classes['text-div']}>
              <h4>Business Dynamics Statistics (BDS)</h4>
               <p>
                <strong>Combined</strong> At the core of any entrepreneurial ecosystem are the entrepreneurs themselves. 
                Density is a measure of the rate entrepreneurs form new firms are in a metropolitan area. 
                The density metric does not measure pure volume, instead it ranks the relative density of new firms, and the percentage of the workforce employed by these young firms. 
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className='conatiner-fluid' style={{backgroundColor: '#97a5bf', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
          <div className='container'>
            <div className='row'>
            <div className={'col-xs-12 ' + classes['text-div']}>
              <h4>Zip / County Business Patterns (ZBP / CBP)</h4>
              <p>
              <strong>Combined</strong> At the core of any entrepreneurial ecosystem are the entrepreneurs themselves. 
              Density is a measure of the rate entrepreneurs form new firms are in a metropolitan area. 
              The density metric does not measure pure volume, instead it ranks the relative density of new firms, and the percentage of the workforce employed by these young firms. 
              </p>

             
            </div>
          </div>
        </div>
    </div>
     <div className='conatiner-fluid' style={{backgroundColor: '#b1bbcf', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
          <div className='container'>
            <div className='row'>
            <div className={'col-xs-12 ' + classes['text-div']}>
              <h4>Quarterly Census of Employment and Wages (QCEW) </h4>
                <p>
                A vibrant entrepreneurial ecosystem requires diversity of industry, population, and sector specializations. An ecosystem that is diverse in these ways tends to be robust and multi-leveled. Diversity of industry, population and sector encourages cross-pollination and mitigates single-sector dependency. Healthy entrepreneurial ecosystems have some industry specialization in order to attract specialized talent but are not over reliant on one industry. Healthy ecosystems also attract and assimilate immigrants. Immigrants are historically highly entrepreneurial, starting businesses at a high rate. Young firms are also a very important element to a diverse and healthy ecosystem. Young firms provide expanded opportunities for young workers to build their resumes and develop their career trajectories. They are also fertile ground for new entrepreneurs to learn what works and what doesn’t. 
                </p>
            </div>
          </div>
        </div>
    </div>
    

    </div>

    )
  }
}


