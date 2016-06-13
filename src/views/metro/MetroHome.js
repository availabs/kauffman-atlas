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
import MetroQcewCluster from 'components/metro/MetroQcewCluster'
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

    _linkIsActive(type){
		let pageid = this.props.params.pageid
		return type === (pageid || (!pageid && this.state.display)) ? {backgroundColor:'#db9a36'} : {}
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
			<MetroQcew currentMetro={metroId} year={year}
				   syear={syear}
				   type={'employment'}
				   title={'Employment'}
				   params={this.props.params}
			/>
		    )
		    case 'Establishment':
		    return (
			<MetroQcew currentMetro={metroId} year={year}
				   syear={syear}
				   type='establishment'
				   title='Establishment'
				   params={this.props.params}
			/>
		    )
		    case 'Wages' :
		    return (
			<MetroQcew currentMetro={metroId} year={year}
				   syear={syear}
				   type='totalwages'
				   title='Wages'
				   params={this.props.params}
			/>
			    )
			case 'StartupEmployment':
			return (
			  <MetroQwi msa={metroId}
			       measure='emp'
			       title='Startup Employment'
			       params={this.props.params}
			  />
			)
			case 'StartupPayroll':
			return (
			  <MetroQwi msa={metroId}
			       measure='payroll'
			       title='Startup Payroll'
			       params={this.props.params}
			  />
			)
		    case 'cluster':
		    return (
			<MetroQcewCluster currentMetro={metroId} year={year}
					  type='cluster'/>
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
				    className={classes['whitelink']}>Combined</Link>
			    </li>
			    <li style={this._linkIsActive('Employment')}
				onClick={this._selectDisplay.bind(null,'Employment')} >
					<Link to={'/metro/'+metroId+'/Employment'+extension}
				    className={classes['whitelink']}>Employment</Link>
			    </li>
			    <li style={this._linkIsActive('Establishment')}
				onClick={this._selectDisplay.bind(null,'Establishment')}>
					<Link to={'/metro/'+metroId+'/Establishment'+extension}
				    className={classes['whitelink']}>Establishment</Link>
			    </li>
			    <li style={this._linkIsActive('Wages')}
				onClick={this._selectDisplay.bind(null,'Wages')}>
					<Link to={'/metro/'+metroId+'/Wages'+extension}
				    className={classes['whitelink']}>Wages</Link>
			    </li>
			    <li style={this._linkIsActive('StartupEmployment')}
                onClick={this._selectDisplay.bind(null, 'StartupEmployment')} >
                    <Link to={`/metro/${metroId}/StartupEmployment`}
                    className={classes['whitelink']}>Startups Employment</Link>
			    </li>
			    <li style={this._linkIsActive('StartupPayroll')}
                onClick={this._selectDisplay.bind(null, 'StartupPayroll')}>
                    <Link to={`/metro/${metroId}/StartupPayroll`}
                    className={classes['whitelink']}>Startups Payroll</Link>
			    </li>
			    <li style={this._linkIsActive('cluster')}
				onClick={this._selectDisplay.bind(null,'cluster')}> 
					<Link to={'/metro/'+metroId + '/cluster'}
				    className={classes['whitelink']}>Cluster Analysis</Link>
			    </li>
			    <li onClick={this._selectDisplay.bind(null,'combined')}>
					<Link to={'/metro/'+metroId+'/workforce'}
				    className={classes['whitelink']}>Workforce Analysis</Link>
			    </li>
			</ul>
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
	}
	else{
	    return (
		<div>
		    <div style={{backgroundColor: '#7d8faf', color: '#efefef', paddingTop:20, paddingBottom: 20}}>
			<MetroHeader metroId={metroId} metroData={this.props.metros[metroId]} selectChange={selectChange}/>
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
