/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { loadDensityComposite } from 'redux/modules/densityData'
import { loadFluidityComposite } from 'redux/modules/fluidityData'
import { loadDiversityComposite } from 'redux/modules/diversityData'
import { loadCombinedComposite } from 'redux/modules/combinedData'
import classes from 'styles/sitewide/index.scss'
import d3 from 'd3'
import NationalMap from 'components/maps/NationalMap'
import RankBoxes from 'components/ranks/RankBoxes'
// import DensityView from 'views/'
import { browserHistory } from 'react-router'

export class HomeView extends React.Component<void, Props, void> {
   constructor () {
    super()
    this.state = {
      activeComponent:'combined',
      bucket:'all'
    }
    this._initGraph = this._initGraph.bind(this)
    this._isActive = this._isActive.bind(this)
    this._linkIsActive = this._linkIsActive.bind(this)
    this._setActiveComponent = this._setActiveComponent.bind(this)
  }

  componentWillMount () {
    this._initGraph();
  }
 

  _initGraph () {
    if(!this.props['densitycomposite']){
      this.props['getdensitycomposite']()
    }
    if(!this.props['fluiditycomposite']){
      this.props['getfluiditycomposite']()
    }
    if(!this.props['diversitycomposite']){
      this.props['getdiversitycomposite']()
    }
    if(!this.props['combinedcomposite']){
      this.props['getcombinedcomposite']()        
    }        
  }

  _setActiveComponent(type){
    this.setState({activeComponent:type})
  }

  _isActive(type){
    return type === this.state.activeComponent ? classes['active'] : ''
  }

  _linkIsActive(type){
    return type === this.state.activeComponent ? classes['active-link'] : ''
  }

  render () {

    this._initGraph();
    var topFiveDensity;
    var topFiveFluidity;
    var topFiveDiversity;
    var topFiveCombined;

    var popDomain = Object.keys(this.props.metros).reduce((popDomain,msaId) => {
      if(this.props.metros[msaId].pop){
        if(this.props.metros[msaId].pop[2014]){
          popDomain.push(this.props.metros[msaId].pop[2014]);          
        }
      }
      return popDomain;
    },[])

    var popScale = d3.scale.quantile()
                    .domain([250000, 1000000, 2000000])
                    .range([0,1,2,3])




    var bucketDisplay = [];

    let msaClick = (d) =>{

      if(d.id){
       this.props.history.push('/metro/'+d.id);       
      }
      else{
        this.props.history.push('/metro/'+d.target.id);  
      }  

    }

    let bucketClick = (d) =>{
      d3.selectAll("."+classes["bucket"])[0].forEach(bucketDiv => {
        bucketDiv.className = classes["bucket"];
      })

      d.target.className = classes["active"] + " " + classes["bucket"];


      this.setState({'bucket':d.target.id});
    }


    bucketDisplay.push(          
      <div className={'col-xs-2'}>
        <div id="all" onClick={bucketClick} className={classes["active"] + " " + classes["bucket"]}>
          All Metros
        </div>
      </div>
    )

    popScale.domain().forEach(quantileValue => {
      var curIndex = popScale.domain().indexOf(quantileValue);

      if(curIndex == 0){
        bucketDisplay.push(
          <div className={'col-xs-2'}>
            <div id={curIndex} onClick={bucketClick} className={classes["bucket"]}>
              {'< '} {Math.round(quantileValue)}
            </div>
          </div>
          )        
      }
      else{
        bucketDisplay.push (
          <div className={'col-xs-2'}>
            <div id={curIndex} onClick={bucketClick} className={classes["bucket"]}>
              {Math.round(popScale.domain()[curIndex-1])} to {Math.round(quantileValue)}
            </div>
          </div>
          )             
      }
    })

    bucketDisplay.push(          
      <div className={'col-xs-2'}>
        <div id={popScale.domain().length} onClick={bucketClick} className={classes["bucket"]}>
          {Math.round(popScale.domain()[popScale.domain().length-1])}+
        </div>
      </div>
    )

    var metrosInBucket = Object.keys(this.props.metros).filter(msaId => {
      return (this.state.bucket === 'all' ||
        (this.props.metros[msaId] && 
        this.props.metros[msaId].pop && 
        this.props.metros[msaId].pop[2014] && 
        popScale(this.props.metros[msaId].pop[2014]) == this.state.bucket))
     
    })

    return (
      <div>
      <div className='container'>
        <div className='row'>
          <div className={'col-xs-12 ' + classes['text-div']}>
            <strong>Lorem</strong> ipsum dolor sit amet, mel nibh soluta molestiae in, ut vis illud utamur disputando, sed id eius bonorum. Mei vivendum adversarium ex, libris assentior eu per. In summo invenire interpretaris quo, ex vix partem facilisis signiferumque, ridens splendide conclusionemque an vis. Dico aliquip scriptorem vix et. Te eum omnes possit omittantur. Ei volutpat dignissim sit, erat option pri in.
          </div>
        </div>
        <RankBoxes popScale={popScale} bucket={this.state.bucket} onComponentChange={this._setActiveComponent} />
        <div className='row' style={{padding:15, border:'1px solid black', marginTop: 15}}>
          {bucketDisplay}
        </div>
        {this.state.bucket}
        <div className='row'>
         <div className={'col-xs-12 ' + classes['text-div']}>
              <strong>Lorem</strong> ipsum dolor sit amet, mel nibh soluta molestiae in, ut vis illud utamur disputando, sed id eius bonorum. Mei vivendum adversarium ex, libris assentior eu per. In summo invenire interpretaris quo, ex vix partem facilisis signiferumque, ridens splendide conclusionemque an vis. Dico aliquip scriptorem vix et. Te eum omnes possit omittantur. Ei volutpat dignissim sit, erat option pri in.
           </div>
        </div>
      </div>
      <div className='container-fluid'>
        <div className='row'>
        
          <div className='col-xs-10'>
            <NationalMap metros={metrosInBucket}/>
          </div>
          <div className='col-xs-2'>
            info and stuff
          </div>
        </div>  
      </div>
      </div>
      
    )
  }
}

const mapStateToProps = (state) => ({
  densitycomposite:state.densityData.compositeData,
  fluiditycomposite:state.fluidityData.compositeData,
  diversitycomposite : state.diversityData.diversitycomposite,
  combinedcomposite : state.combinedData.combinedcomposite,
  metros : state.metros
})

export default connect((mapStateToProps), {
  getdensitycomposite: () => loadDensityComposite(),
  getfluiditycomposite: () => loadFluidityComposite(),
  getdiversitycomposite: () => loadDiversityComposite(),
  getcombinedcomposite: () => loadCombinedComposite()
})(HomeView)
