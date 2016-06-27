/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import MetroHeader from 'components/metro/MetroHeader'
import MetroScores from 'components/metro/MetroScores'
import MetroZbp from 'components/metro/MetroZbp'
import MetroQcew from 'components/metro/MetroQcew'
import MetroQwi from 'components/metro/MetroQwi'
import MetroZbpCluster from 'components/metro/MetroZbpCluster'
import MetroParagraph from 'components/metro/MetroParagraph'
import classes from 'styles/sitewide/index.scss'
import { withRouter } from 'react-router'


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

    _linkIsActive(type, sub){
		let pageid = this.props.params.pageid
		if(typeof type === 'object'){
			return type.indexOf(pageid) >= 0 ? {backgroundColor:'#db9a36'} : {}
		}
		return type === (pageid || (!pageid && this.state.display)) ? {backgroundColor: sub ?  '#e7bb77' : '#db9a36'} : {}
    }

    _selectDisplay (display) {
		this.setState({display})
    }

    renderDisplay(){
	let metroId = this.props.params.geoid
	let year = this.props.year || '2012'
	let syear = this.props.syear || '2001'
	let page = this.props.params.pageid || this.state.display


	    switch(page){
		case 'combined':
		    return (
			<MetroScores metroId={metroId} metroData={this.props.metros[metroId]} />
		    )
		    case 'Employment':
			    return (
					<MetroQcew 
               msa={metroId} 
               measure='emplvl'
               currentMetro={metroId} 
               year={year}
						   syear={syear}
						   type={'employment'}
						   title={'Employment'}
						   params={this.props.params}
					/>
			    )
		    case 'Establishment':
			    return (
					<MetroQcew 
               msa={metroId} 
               measure='qtrly_estabs_count'
               currentMetro={metroId} 
               year={year}
						   syear={syear}
						   type='establishment'
						   title='Establishment'
						   params={this.props.params}
					/>
			    )
		    case 'Wages' :
			    return (
					<MetroQcew 
               msa={metroId} 
               measure='avg_wkly_wage'
               currentMetro={metroId} 
               year={year}
						   syear={syear}
						   type='totalwages'
						   title='Wages'
						   params={this.props.params}
					/>
			    )
			case 'StartupEmployment':
				return (
					<MetroQwi 
                 msa={metroId}
					       measure='emptotal'
					       title='Employment by Firm Age'
					       params={this.props.params}
					/>
				)
			case 'StartupPayroll':
				return (
				  	<MetroQwi 
               msa={metroId}
				       measure='payroll'
				       title='Payroll by Firm Age'
				       params={this.props.params}
				  	/>
				)
		    case 'cluster':
			    return (
					<MetroZbpCluster currentMetro={metroId} year={2012} />
			    )
		    case 'workforce':
			    return (
					<span></span>
			    )
		    default: 
			    return (
					<MetroZbp currentMetro={metroId} year={year}/>
			    )
	    }
    }

    renderNav () {
		let navStyle = {
		    backgroundColor: '#5d5d5d',//'#5d5d5d',//'#7d8faf'//'#db9a36',
		    borderRadius: 0,
		    border: 'none',
		    marginBottom: 0
		    //borderTop: '1px solid #efefef'
		}
		let linkStyle = {
		    color: '#efefef'
		}
		let metroId = this.props.params.geoid
		let year = this.props.params.year
		let naics_code = this.props.params.naics_code
		let extension =[naics_code,year].reduce((acc,str)=>(str)?acc+'/'+str :acc,'')
		
		return (
		    <nav className="navbar navbar-default" style={navStyle}> 
			<div className="container">
			    <div className="collapse navbar-collapse">
				<ul className="nav navbar-nav">
				    <li style={this._linkIsActive('combined')}
					onClick={this._selectDisplay.bind(null,'combined')}>
						<Link to={'/metro/'+metroId+'/combined'}
					    className={classes['whitelink']}>Overview</Link>
				    </li>
				    <li style={this._linkIsActive(['Employment','Establishment','Wages'])}
					onClick={this._selectDisplay.bind(null,'Employment')} >
						<Link to={'/metro/'+metroId+'/Employment'+extension}
					    className={classes['whitelink']}>Industry Explorer</Link>
				    </li>
				    <li style={this._linkIsActive(['StartupEmployment','StartupPayroll'])}
	                onClick={this._selectDisplay.bind(null, 'StartupEmployment')} >
	                    <Link to={`/metro/${metroId}/StartupEmployment`}
	                    className={classes['whitelink']}>Startup Explorer</Link>
				    </li>
				    <li style={this._linkIsActive('cluster')}
					onClick={this._selectDisplay.bind(null,'cluster')}> 
						<Link to={'/metro/'+metroId + '/cluster'}
					    className={classes['whitelink']}>Cluster Analysis</Link>
				    </li>
				    <li onClick={this._selectDisplay.bind(null,'combined')}>
						<Link to={'/metro/'+metroId+'/workforce'}
					    className={classes['whitelink']}>Firm Mapping</Link>
				    </li>
				</ul>
			    </div>
			</div>
		    </nav>
		)
    }

    subNav () {
    	let navStyle = {
		    backgroundColor: '#db9a36',//'#5d5d5d',//'#7d8faf'//'#db9a36',
		    color: '#5d5d5d',
		    borderRadius: 0,
		    border: 'none',
		    marginBottom: 0
		    //borderTop: '1px solid #efefef'
		}
    	let metroId = this.props.params.geoid
		let year = this.props.params.year
		let naics_code = this.props.params.naics_code
		let extension =[naics_code,year].reduce((acc,str)=>(str)?acc+'/'+str :acc,'')
		let page = this.props.params.pageid || this.state.display
		let section = ['StartupPayroll', 'StartupEmployment'].indexOf(page) >= 0 ? 'startup' : null
 		section = ['Employment', 'Establishment', 'Wages'].indexOf(page) >= 0 ? 'industry' : section

 		if(!section) return <span />
    	let content = {
    		industry: 
    		(
	    		<ul className="nav navbar-nav">
	    			<li style={this._linkIsActive('Employment', true)}
						onClick={this._selectDisplay.bind(null,'Employment')} >
						<Link to={'/metro/'+metroId+'/Employment'+extension}
					    className={classes['whitelink']}>Employment</Link>
				    </li>
	    		 	<li style={this._linkIsActive('Establishment', true)}
					onClick={this._selectDisplay.bind(null,'Establishment')}>
						<Link to={'/metro/'+metroId+'/Establishment'+extension}
					    className={classes['whitelink']}>Establishment</Link>
				    </li>
				    <li style={this._linkIsActive('Wages', true)}
					onClick={this._selectDisplay.bind(null,'Wages')}>
						<Link to={'/metro/'+metroId+'/Wages'+extension}
					    className={classes['whitelink']}>Wages</Link>
				    </li>
				</ul>
    		),
    		startup: (
    			<ul className="nav navbar-nav">	
    				<li style={this._linkIsActive('StartupEmployment', true)}
	                onClick={this._selectDisplay.bind(null, 'StartupEmployment')} >
	                    <Link to={`/metro/${metroId}/StartupEmployment`}
	                    className={classes['whitelink']}>Employment</Link>
				    </li>
				    <li style={this._linkIsActive('StartupPayroll', true)}
	                onClick={this._selectDisplay.bind(null, 'StartupPayroll')}>
	                    <Link to={`/metro/${metroId}/StartupPayroll`}
	                    className={classes['whitelink']}>Wages</Link>
	                </li>
	            </ul>
    		)
    	}
    	return (
    		<nav className="navbar navbar-default" style={navStyle}> 
				<div className="container">
				    <div className="collapse navbar-collapse">
					{content[section]}
					</div>
				</div>
			</nav>
    	)	
    }


    render () {
	let metroId = this.props.params.geoid
	var scope = this;

	
	function selectChange(msaId){
		scope.context.router.push('/metro/'+msaId+'/'+scope.props.params.pageid)
	}

	if(!this.props.metros[metroId] || !this.props.metros[metroId].pop){
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
	} else {
	    return (
			<div>
			    <div style={{backgroundColor: '#7d8faf', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
				<MetroHeader metroId={metroId} metroData={this.props.metros[metroId]} selectChange={selectChange}/>
				<MetroParagraph metroId={metroId} metroData={this.props.metros[metroId]}/>
			    </div>
			    {this.renderNav()}
			    {this.subNav()}
			    <div style={{marginTop: 15, minHeight: 500}}>
				{this.renderDisplay()}
			    </div>   
			</div>
	    )
	}

    }
}

MetroHome.contextTypes = {
  router: React.PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    router : state.router,
    metros : state.metros,
    year   : state.metroTime.year.current,
    syear  : state.metroTime.year.syear
    
})

    export default connect((mapStateToProps), {})(MetroHome)
