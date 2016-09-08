/* @flow */
import React, { PropTypes } from 'react'
import classes from 'styles/sitewide/index.scss'
import { browserHistory } from 'react-router'


export default class Atlas extends React.Component {
  render () {
    return (
      <div>
        <div className='conatiner-fluid' >
          <div className='container-fluid'>
            <div className='row'>
            <div className={'col-xs-12 ' + classes['text-div']}>
              <h4>Entrepreneurial Ecosystem Index (EEI)</h4>
                <p>
                The EEI represents the overall health of entrepreneurial ecosystems. The EEI is a composite index based on sub-indicators - Fluidity, Density and Diversity - and calculated using various U.S. Economic Census datasets. These sub-indicators are measures of ecosystem health, including population flux, sector variance, worker churn, immigration, and equality of opportunity. In the Entrepreneurial Ecosystem Atlas, every metropolitan statistical area (MSA) in the United States is given an EEI score, and subsequently ranked. Click on the sub-indicator or on the MSAs for further in-depth analysis.
                </p>
            </div>
          </div>
        </div>
      </div>
      <div id='density' className='conatiner-fluid' style={{backgroundColor: '#7d8faf', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
          <div className='container-fluid'>
            <div className='row'>
            <div className={'col-xs-12 ' + classes['text-div']}>
              <h4>Density</h4>
              <a name='density' />
              <p><strong>Combined</strong> At the core of any entrepreneurial ecosystem are the entrepreneurs themselves. Density is a measure of the rate entrepreneurs form new firms are in a metropolitan area. The density metric does not measure pure volume, instead it ranks the relative density of new firms, and the percentage of the workforce employed by these young firms. </p>

              <p>The Density metric is comprised of three measurements: New and young firms per 1k population, share of employment in new and young firms, and high-tech sector density.</p>

              <p>
              <strong>New Firms per 1K Population</strong> is calculated using the Business Dynamics Statistics Dataset where firm-age is 1 year or less. This number is then divided by the US Census population for the metropolitan area for a given year. For Metropolitan Statistical Areas with changing boundaries, we’ve used the sum of the population of counties in the appropriate geography. Business Dynamics Statistics is the only public dataset that offers both the number of establishments and their firm-age but does not link firms to industry type. </p>
              <p>
              <strong>Share of Employment in New Firms</strong> is calculated using Quarterly Workforce Indicators (QWI). During the development of this tool we calculated this metric using both the Business Dynamics Statistics and Quarterly Workforce Indicators datasets and found that the two have only very slight differences. In the final implementation of the tool we chose to use QWI because it is updated more frequently.</p>

              <p>
              <strong>Share of Employment in New Traded Firms</strong> is calculated using Quarterly Workforce Indicators (QWI).  One of the greatest strengths of QWI is that it shows share of employment by both 2-digit NAICS industry and firm-age. This metric calculates share of employment in new firms (>1 year old) in all industries except for retail (NAICS 44-45) and accommodations and food services (NAICS 72).</p>

              <p>
              <strong>Share of Employment in New High-Tech Firms</strong> is calculated using Quarterly Workforce Indicators (QWI).  One of the greatest strengths of QWI is that it shows share of employment by both 2-digit NAICS industry and firm-age.This metric calculate share of employment in new firms (>1 year old), only in the sectors Information (NAICS 51) and Professional Scientific and Technical Services (54). </p>
            </div>
          </div>
        </div>
    </div>
     <div id='diversity' className='conatiner-fluid' >
          <div className='container-fluid'>
            <div className='row'>
            <div className={'col-xs-12 ' + classes['text-div']}>
              <h4>Diversity</h4>
              <p>
              <a name='diversity' />
               A vibrant entrepreneurial ecosystem requires diversity of industry, population, and sector specializations. An ecosystem that is diverse in these ways tends to be robust and multi-leveled. Diversity of industry, population and sector encourages cross-pollination and mitigates single-sector dependency. Healthy entrepreneurial ecosystems have some industry specialization in order to attract specialized talent but are not over reliant on one industry. Healthy ecosystems also attract and assimilate immigrants. Immigrants are historically highly entrepreneurial, starting businesses at a high rate. Young firms are also a very important element to a diverse and healthy ecosystem. Young firms provide expanded opportunities for young workers to build their resumes and develop their career trajectories. They are also fertile ground for new entrepreneurs to learn what works and what doesn’t. </p>


              <p>
               <strong>Diversity Combined</strong> A vibrant entrepreneurial ecosystem requires diversity of economy and population. It is important that all parts of the population are engaged in the economy and social mobility is one of the drivers of multi-level engagement.  As such one measure of a diverse entrepreneurial ecosystem is the equality of opportunity which is measured here as cross generational income growth based on parent’s income. </p>
              <p>
              Healthy ecosystems also attract and assimilate immigrants. Immigrants are historically highly entrepreneurial, starting businesses at a high rate. </p>

              <p>
              The diversity metric is comprised of two measures: immigration, and income mobility.  An ecosystem that is diverse in these ways tends to be robust and multi-leveled.</p>
              <p>
              <strong>Equality of Opportunity</strong> score is calculated using data from the Equality of Opportunity Project. To create an overall metric for metropolitan areas we take the average income change for children whose parents are in the bottom 25th percentile of income and children whose parents in the top 25th percentile of income. This measures how an entrepreneurial ecosystem diversifies opportunity.</p>

              <p><strong>Percentage of Foreign Born Population</strong> is taken from the American Communities Survey of the US Census. Historically, immigrants have a high entrepreneurial propensity.</p>

               <p><strong>Economic Diversity</strong> is calculated using the Quarterly Census of Earnings and Wages (QCEW). This metric starts by taking the location quotient of all six-digit NAICS industries in a metropolitan area and calculates the statistical variance of that dataset. This is a measure of the Economic Diversity of a Metropolitan Statistical Area, where MSAs with high variance among industries tend to be over specialized. More advanced Metropolitan Economies tend to have lower variance scores.</p> 
            </div>
          </div>
        </div>
    </div>
    <div id='fluidity' className='conatiner-fluid' style={{backgroundColor: '#996b25', color: '#efefef', paddingTop:20, paddingBottom: 400}}>
      <div className='container-fluid'>
        <div className='row'>
          <div className={'col-xs-12 ' + classes['text-div']}>
            <h4>Fluidity</h4>
            <a name='fluidity' />
            <p>
             Fluidity is a measure of the health of an entrepreneurial ecosystems that shows how metropolitan areas re-sort, adapt, and react. The fluidity metric measures population growth, population flux, and worker churn. Taken together these measures show the health of worker reallocation which can improve the quality of matches between workers and jobs and is an important element to regional growth. Barriers to worker reallocation can drag down a region’s entrepreneurial vibrancy. </p>

            <p><strong>The High Growth Firms</strong> metric is scored using Inc 5,000 dataset listing the 5,000 fastest growing firms in America. This metric takes into account both the total number of High Growth Firms in a Metropolitan Statistical Area and the number of High Growth Firms per 1K population.</p>

            <p>
            <strong>Net Migration</strong> is taken from the IRS population dataset. This metric is the number of immigrant (incoming) as a percentage of total population minus the number of emigrants (outgoing) as a percentage of total population.</p>

            <p>
            <strong>Total Migration</strong> is taken from the IRS population dataset. This metric is the number of immigrant (incoming) as a percentage of total population minus the number of emigrants (outgoing) as a percentage of total population.</p>

            <p>
              <strong>Annual Churn</strong> is calculated using Quarterly Workforce Indicators. This metric is the employment turnover rate as a percentage of total employment. Annual Churn is the percentage of people who left their job and found new work in a given year. A strong Entrepreneurial Ecosystem has high worker reallocation which can improve the quality of matches between workers and jobs.
            </p>
            </div>
          </div>
        </div>
    </div>

    </div>

    )
  }
}


