/* @flow */
import React, { PropTypes } from 'react'
import classes from 'styles/sitewide/index.scss'
import { browserHistory } from 'react-router'


export default class DataSources extends React.Component {
  render () {
    return (
      <div>
        <a name='computed' />
         <div className='conatiner-fluid' id='computed'>
          <div className='container-fluid'>
            <div className='row'>
              <div className={'col-xs-12 ' + classes['text-div']}>
                <h1>Entrepreneurial Ecosystem Atlas Computed Data</h1>
               
                 <p>
                  Here we provide access to all the data that we have computer to create this website.

                  <table className='table ' >
                    <thead>
                      <tr>
                        <th> Variable Name</th> 
                        <th> Description </th>
                        <th> Sources </th>
                        <th> Link </th>
                      </tr>  
                      <tr>
                        <th colSpan='4'> Meta Data Variables </th> 
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Msa Names</td>
                        <td> Look up from fips code to metropolitan area full name</td>
                        <td></td>
                        <td> <a  href='/data/msaName.json'> /data/msaName.json  </a></td>
                      </tr>
                      <tr>
                        <td>Msa Pop</td>
                        <td> Look up of all MSA population values from 1990 to 2014.</td>
                        <td> BEA</td>
                        <td> <a href='/data/msaPop.json'> /data/msaPop.json </a> </td>
                      </tr>
                      <tr>
                        <td>Naics Meta Data</td>
                        <td> Nested look up table for NAICS meta data, with names and descriptions.</td>
                        <td> </td>
                        <td> <a href='/data/naicsKeys.json'> /data/naicsKeys.json </a> </td>
                      </tr>
                      <tr>
                        <td>EEA Index</td>
                        <td>  Look up of Combined Composite plus ranking for all MSAs</td>
                        <td></td>
                        <td> <a href='/data/processedCombinedComposite.json'> /data/processedCombined Composite.json </a> </td>
                      </tr>
                      <tr>
                        <th colSpan='3'> Density Variables </th> 
                      </tr>
                        <tr>
                          <td>Density Composite</td>
                          <td>  Look up of Density Composite plus ranking for all MSAs.</td>
                          <td></td>
                          <td> <a href='data/processedDensityComposite.json'> /data/processedDensity Composite.json </a> </td>
                        </tr>
                        <tr>
                          <td>New Firms / 1k Pop</td>
                          <td>  Array of New Firms / 1k Population and Scores for all  MSAs.</td>
                          <td> BDS </td>
                          <td> <a href='data/processedNewFirms.json'> /data/processedNewFirms.json </a> </td>
                        </tr>
                        <tr>
                          <td> % Employment in New Firms (BDS)</td>
                          <td>  Array of % Employment in New Firms and scores for all  MSAs.(Not Used in Composite)</td>
                          <td> BDS </td>
                          <td> <a href='data/processedShareEmp.json'> /data/processedShareEmp.json </a> </td>
                        </tr>
                        <tr>
                          <td> % Employment in New Firms (QWI)</td>
                          <td>  Array of % Employment in New Firms from QWI and scores for all  MSAs.</td>
                          <td> QWI </td>
                          <td> <a href='data/processedShareEmpNewFirmsQWI_All.json'> 
                            /data/processedShareEmpNewFirmsQWI All.json 
                            </a> 
                          </td>
                        </tr>
                        <tr>
                          <td>% Employment in new Traded Firms</td>
                          <td>  Array of % Employment in New Firms excluding firms in NAICS sectors 72 (Accomodations and Food Service) and 44-45 (Retail Trade) from QWI and scores for all  MSAs. (Not used in composite)</td>
                          <td> QWI </td>
                          <td> <a href='/data/processedShareEmpNewFirmsQWI_ExceptAccomAndRetail.json'> /data/processedShareEmpNewFirmsQWI ExceptAccomAndRetail.json </a> </td>
                        </tr>
                        <tr>
                          <td>% Employment in new High Tech</td>
                          <td>  Array of % Employment in New Firms in NAICS sectors 54 Professional, Scientific, and Technical Services and 51 Information from QWI and scores for all  MSAs.</td>
                          <td> QWI </td>
                          <td> <a href='/data/processedShareEmpNewFirmsQWI_HighTech.json'> /data/processedShareEmpNewFirmsQWI HighTech.json </a> </td>
                        </tr>
                      <tr>
                        <th colSpan='4'> Diversity Variables </th> 
                      </tr>
                      <tr>
                          <td>Diversity Composite</td>
                          <td>  Look up of Diversity Composite plus ranking for all MSAs.</td>
                          <td></td>
                          <td> <a href='data/processedDiversityComposite.json'> /data/processedDiversity Composite.json </a> </td>
                      </tr>
                       <tr>
                          <td>Equality of Opportunity</td>
                          <td>  Equality opportunity data with percentage change in income of children from top and bottom quartiles of population with added score and rank.</td>
                          <td> EOP</td>
                          <td> <a href='data/processedOpportunity.json'> /data/processedOpportunity.json </a> </td>
                        </tr>
                        <tr>
                          <td>% Foreignborn</td>
                          <td> Percentage of the population that is foreign born with added score and rank.</td>
                          <td> ACS </td>
                          <td> <a href='data/processedForeignborn.json'> /data/processedForeignborn.json </a> </td>
                        </tr>
                        <tr>
                          <td>EmpVariance</td>
                          <td>Statistical variance of location quotient of employment in all 6 digit NAICS industries. (Not used in composite)</td>
                          <td> QCEW </td>
                          <td> <a href='data/processedEmpVariance.json'> /data/processedEmpVariance.json </a> </td>
                        </tr>
                        <tr>
                          <td>EmpHHI (Economic Diversity) </td>
                          <td>Sum of the square of % employment for each 4 digit NAICS industry. An ecomonic diversity measure based on the <a href='http://www.investopedia.com/terms/h/hhi.asp'>Herfindahl-Hirschman index</a>. </td>
                          <td> QCEW </td>
                          <td> <a href='data/processedEmpHHI.json'> /data/processedEmpHHI.json </a> </td>
                        </tr>
                       <tr>
                        <th colSpan='4'> Fluidity Variables </th> 
                       </tr>
                        <tr>
                          <td>Fluidity Composite</td>
                          <td>  Look up of Fluidity Composite plus ranking for all MSAs.</td>
                          <td></td>
                          <td> <a href='data/processedFluidityComposite.json'> /data/processedFluidity Composite.json </a> </td>
                        </tr>
                        <tr>
                          <td>High Growth Firms</td>
                          <td>  Number of high growth firms and number per 1k pop for each MSA.</td>
                          <td> INC 5000</td>
                          <td> <a href='data/processedInc5000.json'> /data/processedInc5000.json </a> </td>
                        </tr>

                        <tr>
                          <td>Net Migration</td>
                          <td> Total inflowing migration - outflowing migration for each MSA</td>
                          <td> IRS</td>
                          <td> <a href='data/processedNetMirgration.json'> /data/processedNetMirgration.json </a> </td>
                        </tr>

                        <tr>
                          <td>Population Flux</td>
                          <td> Total inflowing migration + outflowing migration for each MSA</td>
                          <td> IRS </td>
                          <td> <a href='data/processedNetMirgration.json'> /data/proccessedTotalMigration.json </a> </td>
                        </tr>

                         <tr>
                          <td>Employment Churn></td>
                          <td> Percentage of workforce leaving on job and finding a new job per year.</td>
                          <td> QWI </td>
                          <td> <a href='data/processedAnnualChurn.json'> /data/processedAnnualChurn.json </a> </td>
                        </tr>

                       
                    </tbody>
                  </table>
                </p>
              </div>
            </div>
          </div>
        </div>
        <a name='apis' />
        <div className='conatiner-fluid' id='apis'>
          <div className='container-fluid'>
            <div className='row'>
              <div className={'col-xs-12 ' + classes['text-div']}>
                <h1>AVAIL API's</h1>
               
                 <p>
                  For this project we created four different REST API's for large public data sets that aided greatly in our development of the Entrepreneurial Ecosystem Atlas. 
                  We also hope that an easy way to access these data sets will encourage future research and development using them will be possible.
                </p>
              </div>
            </div>
          </div>
        
      <div className='conatiner-fluid' style={{backgroundColor: '#64728c', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
          <div className='container-fluid'>
            <div className='row'>
             
              <div className={'col-xs-9 ' + classes['text-div']}>
                <h4>Quarterly Workforce Indicators (QWI) </h4>
                <p>
                  The Quarterly Workforce Indicators (QWI) are a set of economic indicators including employment, job creation,
                   earnings, and other measures of employment flows. 

                  The QWI are reported based on detailed firm characteristics (geography, industry, age, size) and worker
                   demographics information (sex, age, education, race, ethnicity) and are available tabulated to national,
                    state, metropolitan/micropolitan areas, county, and Workforce Investment Board (WIB) areas.
                  </p><p>
                  Currently the AVAIL API only serves data tabulated for metropolitan areas.
                 </p>
                </div>
                <div className={'col-xs-3 ' + classes['text-div']}>
                 <a href='http://qwi.availabs.org' target='_blank' style={{color:'#efefef'}}>
                <img src='/images/qwi_api.png' className='img-responsive' style={{marginTop: 15}} />
                API:<br /> 
                  http://qwi.availabs.org
                </a>
                <br />
                Source:<br /> <a href='http://lehd.ces.census.gov/data/#qwi' target='_blank' style={{color:'#efefef'}}>
                  http://lehd.ces.census.gov/data/#qwi
                </a>
             </div>
              </div>
            </div>
        </div>
        <div className='conatiner-fluid' style={{backgroundColor: '#7d8faf', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
          <div className='container-fluid'>
            <div className='row'>
            <div className={'col-xs-9 ' + classes['text-div']}>
              <h4>Business Dynamics Statistics (BDS)</h4>
               <p>The Business Dynamics Statistics (BDS) provides annual measures of business dynamics
                (such as job creation and destruction, establishment births and deaths, and firm startups and shutdowns) 
                for the economy and aggregated by establishment and firm characteristics. The BDS is created from the <a href="http://www.census.gov/ces/dataproducts/datasets/lbd.html" id="anch_328" style={{textDecoration:'underline', color:'#efefef'}}>Longitudinal Business Database</a> 
                 (LBD), a confidential database available to qualified researchers through secure <a href="http://www.census.gov/fsrdc" id="anch_329" style={{textDecoration:'underline', color:'#efefef'}}>Federal Statistical Research Data Centers</a>. 
                 The use of the LBD as its source data permits tracking establishments and firms over time.
              </p>
            </div>
            <div className={'col-xs-3 ' + classes['text-div']}>
              <a href='http://bds.availabs.org' target='_blank' style={{color:'#efefef'}}>
                <img src='/images/bds_api.png' className='img-responsive' style={{marginTop: 15}} />
                API:<br /> 
                  http://bds.availabs.org
                </a>
                <br />
                Source:<br /> <a href='http://www.census.gov/ces/dataproducts/bds/' target='_blank' style={{color:'#efefef'}}>
                  http://www.census.gov/ces/dataproducts/bds/
                </a>
            </div>
          </div>
        </div>
      </div>
      <div className='conatiner-fluid' style={{backgroundColor: '#97a5bf', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
          <div className='container-fluid'>
            <div className='row'>
           
            <div className={'col-xs-9 ' + classes['text-div']}>
              <h4>Zip / County Business Patterns (ZBP / CBP)</h4>
              <p>
                
              Zip and County Business Patterns  County Business Patterns (CBP) is an annual series that provides subnational economic data by industry. This series includes the number of establishments, employment during the week of March 12, first quarter payroll, and annual payroll. This data is useful for studying the economic activity of small areas; analyzing economic changes over time; and as a benchmark for other statistical series, surveys, and databases between economic censuses. Businesses use the data for analyzing market potential, measuring the effectiveness of sales and advertising programs, setting sales quotas, and developing budgets. Government agencies use the data for administration and planning.


              </p>


             
            </div>
            <div className={'col-xs-3 ' + classes['text-div']}>
              <a href='http://zbp.availabs.org' target='_blank' style={{color:'#efefef'}}>
                <img src='/images/zbp_api.png' className='img-responsive' style={{marginTop: 15}} />
                API:<br /> 
                  http://zbp.availabs.org
                </a>
                <br />
                Source:<br /> <a href='http://www.census.gov/programs-surveys/cbp.html' target='_blank' style={{color:'#efefef'}}>
                  http://www.census.gov/programs-surveys/cbp.html
                </a>
            </div>
          </div>
        </div>
    </div>
      <div className='conatiner-fluid' style={{backgroundColor: '#b1bbcf', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
          <div className='container-fluid'>
            <div className='row'>
            <div className={'col-xs-9 ' + classes['text-div']}>
              <h4>Quarterly Census of Employment and Wages (QCEW) </h4>
                <p>
                  The Quarterly Census of Employment and Wages Program is a cooperative program involving the Bureau of Labor Statistics (BLS) of the U.S. Department of Labor and the State Employment Security Agencies (SESAs). The QCEW program produces a comprehensive tabulation of employment and wage information for workers covered by State unemployment insurance (UI) laws and Federal workers covered by the Unemployment Compensation for Federal Employees (UCFE) program. Publicly available files include data on the number of establishments, monthly employment, and quarterly wages, by NAICS industry, by county, by ownership sector, for the entire United States. These data are aggregated to annual levels, to higher industry levels (NAICS industry groups, sectors, and supersectors), and to higher geographic levels (national, State, and Metropolitan Statistical Area (MSA)).
                </p>
            </div>
             <div className={'col-xs-3 ' + classes['text-div']}>
              <a href='http://qcew.availabs.org' target='_blank' style={{color:'#efefef'}}>
                <img src='/images/qcew_api.png' className='img-responsive' style={{marginTop: 15}} />
                API:<br /> 
                  http://qcew.availabs.org
                </a>
                <br />
                Source:<br /> <a href='http://www.bls.gov/cew/' target='_blank' style={{color:'#efefef'}}>
                  http://www.bls.gov/cew/
                </a>
            </div>
          </div>
        </div>
      </div>
      </div>
      <a name="other" />
      <div className='conatiner-fluid' id="other">
        <div className='container-fluid'>
          <div className='row'>
            <div className={'col-xs-12 ' + classes['text-div']}>
              <h1>Other Data Sources</h1>
               <p>
                A number of data sets that we use for this project already have developer API's available for them, or didnt' warrant the use of an API.             
               </p>
            </div>
          </div>
        </div>
      
      <div className='conatiner-fluid' style={{backgroundColor: '#996b25', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
          <div className='container-fluid'>
            <div className='row'>
           
            <div className={'col-xs-9 ' + classes['text-div']}>
              <h4>IRS SOI Tax Stats - Migration Data</h4>
              <p>Migration data for the United States are based on year-to-year address changes reported on individual income tax returns filed with the IRS. They present migration patterns by State or by county for the entire United States and are available for inflows—the number of new residents who moved to a State or county and where they migrated from, and outflows—the number of residents leaving a State or county and where they went. The data are available for Filing Years 1991 through 2014 and include:</p>
              <ul>
                <li class="first-child">Number of returns filed, which approximates the number of households that migrated</li>

                <li>Number of personal exemptions claimed, which approximates the number of individuals</li>

                <li>Total adjusted gross income, starting with Filing Year 1995</li>

                <li class="last-child">Aggregate migration flows at the State level, by the size of adjusted gross income (AGI) and age of the primary taxpayer, starting with Filing Year 2011.</li>
              </ul>

             
            </div>
            <div className={'col-xs-3 ' + classes['text-div']}>
             
                Source:<br /> <a href='https://www.irs.gov/uac/soi-tax-stats-migration-data' target='_blank' style={{color:'#efefef'}}>
                  https://www.irs.gov/uac/soi-tax-stats-migration-data
                </a>
            </div>
          </div>
        </div>
      </div>
      <div className='conatiner-fluid' style={{backgroundColor: '#c58a30', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
          <div className='container-fluid'>
            <div className='row'>
           
            <div className={'col-xs-9 ' + classes['text-div']}>
              <h4>Bureau of Economic Analysis API (BEA)</h4>
              <p>The data API provides programmatic access to BEA published economic statistics using industry-standard methods and procedures. BEA's data API includes methods for retrieving a subset of our statistical data and the meta-data that describes it.
              </p><p>
              The data API and its documentation are for programmers who are familiar with the concepts and techniques of retrieving data from Web Services.
              </p>
             
            </div>
            <div className={'col-xs-3 ' + classes['text-div']}>
             
                Source:<br /> <a href='http://www.bea.gov/API/signup/index.cfm' target='_blank' style={{color:'#efefef'}}>
                  http://www.bea.gov/API/signup/index.cfm
                </a>
            </div>
          </div>
        </div>
      </div>
      <div className='conatiner-fluid' style={{backgroundColor: '#dea44a', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
          <div className='container-fluid'>
            <div className='row'>
           
            <div className={'col-xs-9 ' + classes['text-div']}>
              <h4>INC 5000</h4>
              <p> In 2007, the Inc. 500 list expanded to the Inc. 5000, giving readers a deeper, richer understanding of the entrepreneurial landscape and capturing a broader spectrum of success.

Today, the list is a distinguished editorial award, a celebration of innovation, a network of entrepreneurial leaders, and an effective public relations showcase. The Inc. 5000 ranks companies by overall revenue growth over a three-year period. All 5,000 honoree companies are individually profiled on Inc.com. The top 500 are featured in the September issue of Inc. magazine, the leading entrepreneurial advocate for 33 years running. Inc. also ranks the fastest-growing companies by industry, metro area, revenue, and number of employees, and we also highlight women- and minority- run companies.</p>
             
            </div>
            <div className={'col-xs-3 ' + classes['text-div']}>
             
                Source:<br /> <a href='http://www.inc.com/inc5000/list/2015' target='_blank' style={{color:'#efefef'}}>
                  http://www.inc.com/inc5000/list/2015
                </a>
            </div>
          </div>
        </div>
      </div>
       <div className='conatiner-fluid' style={{backgroundColor: '#e2ae5e', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
          <div className='container-fluid'>
            <div className='row'>
           
            <div className={'col-xs-9 ' + classes['text-div']}>
              <h4>American Community Survey (ACS) </h4>
              <p>The American Community Survey (ACS) is an ongoing survey that provides vital information on a yearly basis about our nation and its people. Information from the survey generates data that help determine how more than $400 billion in federal and state funds are distributed each year.
              </p><p>
              Through the ACS, we know more about jobs and occupations, educational attainment, veterans, whether
              people own or rent their home, and other topics. Public officials, planners, and entrepreneurs use this information to assess the past and plan the future. When you respond to the ACS, you are doing your part to help your community plan hospitals and schools, support school lunch programs, improve emergency services, build bridges, and inform businesses looking to add jobs and expand to new markets, and more.
              </p>
             
            </div>
            <div className={'col-xs-3 ' + classes['text-div']}>
             
                Source:<br /> <a href='http://www.census.gov/data/developers/data-sets.html' target='_blank' style={{color:'#efefef'}}>
                  http://www.census.gov/data/developers/data-sets.html
                </a>
            </div>
          </div>
        </div>
      </div>
       <div className='conatiner-fluid' style={{backgroundColor: '#dea44a', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
          <div className='container-fluid'>
            <div className='row'>
           
            <div className={'col-xs-9 ' + classes['text-div']}>
              <h4>Equality of Opportunity Project (EOP) </h4>
              <p>   
              How can we improve economic opportunities for low-income children? The Equality of Opportunity Project uses “big data” to develop new answers to this question. The previous phase of the project presented statistics on how upward mobility varies across areas of the U.S. and over time. In the current phase, we focus on families who moved across areas to study how neighborhoods affect upward mobility. We find that every year of exposure to a better environment improves a child’s chances of success, both in a national quasi-experimental study of five million families and in a re-analysis of the Moving to Opportunity Experiment. We use the new methodology and data to present estimates of the causal effect of each county in America on upward mobility.
              </p>
             
            </div>
            <div className={'col-xs-3 ' + classes['text-div']}>
             
                Source:<br /> <a href='http://www.equality-of-opportunity.org/index.php/data' target='_blank' style={{color:'#efefef'}}>
                 http://www.equality-of-opportunity.org/index.php/data
                </a>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>

    )
  }
}


