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
                    .domain(popDomain)
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
          </div>)

    popScale.quantiles().forEach(quantileValue => {
      var curIndex = popScale.quantiles().indexOf(quantileValue);

      if(curIndex == 0){
        bucketDisplay.push(
          <div className={'col-xs-2'}>
            <div id={curIndex} onClick={bucketClick} className={classes["bucket"]}>
              {Math.round(d3.min(popDomain))} to {Math.round(quantileValue)}
            </div>
          </div>
          )        
      }
      else{
        bucketDisplay.push (
          <div className={'col-xs-2'}>
            <div id={curIndex} onClick={bucketClick} className={classes["bucket"]}>
              {Math.round(popScale.quantiles()[curIndex-1])} to {Math.round(quantileValue)}
            </div>
          </div>
          )             
      }
    })

    bucketDisplay.push(          
          <div className={'col-xs-2'}>
            <div id={popScale.quantiles().length} onClick={bucketClick} className={classes["bucket"]}>
              {Math.round(popScale.quantiles()[popScale.quantiles().length-1])}+
            </div>
          </div>)




    if(this.props.densitycomposite){
      var topDensityValues = [];
      var i=0;

      while(topDensityValues.length < 5 && i<this.props.densitycomposite.length-1){
        //If we have population data on this metro, proceed
        if(this.state.bucket != "all"){
          if(this.props.metros[this.props.densitycomposite[i].key] && this.props.metros[this.props.densitycomposite[i].key].pop && this.props.metros[this.props.densitycomposite[i].key].pop[2014]){
            if(popScale(this.props.metros[this.props.densitycomposite[i].key].pop[2014]) == this.state.bucket){
              topDensityValues.push(this.props.densitycomposite[i])
            }
          }          
        }
        else{
          topDensityValues.push(this.props.densitycomposite[i])          
        }

        i++;
      }

      topFiveDensity = topDensityValues.map(metro => {
        var curIndex = topDensityValues.indexOf(metro) + 1
        var roundFormat = d3.format(".2f")
        return(
              <div onClick={msaClick}  className={classes["msa"]}><div id={curIndex} className={classes["name"]}>{curIndex + ". " + metro["name"]}</div> <div id={metro.id} className={classes["score"]}>{roundFormat(metro.values[metro.values.length-1].y)}</div></div>
        )        
      })
    }
    else{
      topFiveDensity = "Loading..."
    }

    if(this.props.fluiditycomposite){
      var topFluidityValues = [];
      var i=0;

      while(topFluidityValues.length < 5 && i<this.props.fluiditycomposite.length-1){
        //If we have population data on this metro, proceed
        if(this.state.bucket != "all"){
          if(this.props.metros[this.props.fluiditycomposite[i].key] && this.props.metros[this.props.fluiditycomposite[i].key].pop && this.props.metros[this.props.fluiditycomposite[i].key].pop[2014]){
            if(popScale(this.props.metros[this.props.fluiditycomposite[i].key].pop[2014]) == this.state.bucket){
              topFluidityValues.push(this.props.fluiditycomposite[i])
            }
          }          
        }
        else{
          topFluidityValues.push(this.props.fluiditycomposite[i])          
        }

        i++;
      }

      topFiveFluidity = topFluidityValues.map(metro => {
        var curIndex = topFluidityValues.indexOf(metro) + 1
        var roundFormat = d3.format(".2f")
        return(
              <div onClick={msaClick}  className={classes["msa"]}><div id={curIndex} className={classes["name"]}>{curIndex + ". " + metro["name"]}</div> <div id={metro.id} className={classes["score"]}>{roundFormat(metro.values[metro.values.length-1].y)}</div></div>
        )        
      })
    }
    else{
      topFiveFluidity = "Loading..."
    }

    if(this.props.diversitycomposite){
      var topDiversityValues = [];
      var i=0;

      while(topDiversityValues.length < 5 && i<this.props.diversitycomposite.length-1){
        //If we have population data on this metro, proceed
        if(this.state.bucket != "all"){
          if(this.props.metros[this.props.diversitycomposite[i].key] && this.props.metros[this.props.diversitycomposite[i].key].pop && this.props.metros[this.props.diversitycomposite[i].key].pop[2014]){
            if(popScale(this.props.metros[this.props.diversitycomposite[i].key].pop[2014]) == this.state.bucket){
              topDiversityValues.push(this.props.diversitycomposite[i])
            }
          }          
        }
        else{
          topDiversityValues.push(this.props.diversitycomposite[i])          
        }

        i++;
      }

      topFiveDiversity = topDiversityValues.map(metro => {
        var curIndex = topDiversityValues.indexOf(metro) + 1
        var roundFormat = d3.format(".2f")
        return(
              <div onClick={msaClick}  className={classes["msa"]}><div id={curIndex} className={classes["name"]}>{curIndex + ". " + metro["name"]}</div> <div id={metro.id} className={classes["score"]}>{roundFormat(metro.values[metro.values.length-1].y)}</div></div>
        )        
      })
    }
    else{
      topFiveDiversity = "Loading..."
    }

    if(this.props.combinedcomposite){
      var topCombinedValues = [];
      var i=0;

      while(topCombinedValues.length < 5 && i<this.props.combinedcomposite.length-1){
        //If we have population data on this metro, proceed
        if(this.state.bucket != "all"){
          if(this.props.metros[this.props.combinedcomposite[i].key] && this.props.metros[this.props.combinedcomposite[i].key].pop && this.props.metros[this.props.combinedcomposite[i].key].pop[2014]){
            if(popScale(this.props.metros[this.props.combinedcomposite[i].key].pop[2014]) == this.state.bucket){
              topCombinedValues.push(this.props.combinedcomposite[i])
            }
          }          
        }
        else{
          topCombinedValues.push(this.props.combinedcomposite[i])          
        }

        i++;
      }

      topFiveCombined = topCombinedValues.map(metro => {
        var curIndex = topCombinedValues.indexOf(metro) + 1
        var roundFormat = d3.format(".2f")
        return(
              <div onClick={msaClick}  className={classes["msa"]}><div id={metro.key} className={classes["name"]}>{curIndex + ". " + metro["name"]}</div> <div id={metro.key} className={classes["score"]}>{roundFormat(metro.values[metro.values.length-1].y)}</div></div>
        )        
      })
    }
    else{
      topFiveCombined = "Loading..."
    }

    var metrosInBucket = Object.keys(this.props.metros).filter(msaId => {
      //If it isn't all, only take those in the bucket
      if(this.state.bucket != "all"){
        if(this.props.metros[msaId] && this.props.metros[msaId].pop && this.props.metros[msaId].pop[2014]){
          if(popScale(this.props.metros[msaId].pop[2014]) == this.state.bucket){
            return true;
          }
          else{
            return false;
          }
        }
        //If we don't have pop data, we can't take it
        else{
          return false;
        }
      }
      //If this.state.bucket is all, we want all of them
      else{
        return true;
      }
    })

    const sectionStyle = {
    }

    return (
      <div>
      <div className='container'>
        <div className='row'>
          <div className={'col-xs-12 ' + classes['text-div']}>
            <strong>Lorem</strong> ipsum dolor sit amet, mel nibh soluta molestiae in, ut vis illud utamur disputando, sed id eius bonorum. Mei vivendum adversarium ex, libris assentior eu per. In summo invenire interpretaris quo, ex vix partem facilisis signiferumque, ridens splendide conclusionemque an vis. Dico aliquip scriptorem vix et. Te eum omnes possit omittantur. Ei volutpat dignissim sit, erat option pri in.
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-3' style={sectionStyle} onClick={this._setActiveComponent.bind(null,'combined')}>
            <div className={classes['selector-buttons']+' '+this._isActive('combined')}>
              <Link className={this._linkIsActive('combined') +' '+ classes['darklink']} to='/combined'>
              Combined
              </Link>
              <div className={classes["topFive"]}>{topFiveCombined}</div>
            </div>
          </div>
          <div className='col-xs-3' style={sectionStyle} onClick={this._setActiveComponent.bind(null,'density')}>
           <div className={classes['selector-buttons']+' '+this._isActive('density')}>
              <Link className={classes['darklink'] + ' ' + this._linkIsActive('density')} to='/density'>
              Density
              </Link>
              <div className={classes["topFive"]}>{topFiveDensity}</div>
            </div>
          </div>
          <div className='col-xs-3' style={sectionStyle} onClick={this._setActiveComponent.bind(null,'fluidity')}>
            <div className={classes['selector-buttons']+' '+this._isActive('fluidity')}>
              <Link className={classes['darklink'] + ' ' + this._linkIsActive('fluidity')} to='/fluidity'>
              Fluidity
              </Link>
              <div className={classes["topFive"]}>{topFiveFluidity}</div>
            </div>
          </div>
          <div className='col-xs-3' style={sectionStyle} onClick={this._setActiveComponent.bind(null,'diversity')}>
            <div className={classes['selector-buttons']+' '+this._isActive('diversity')}>
              <Link className={classes['darklink'] + ' ' + this._linkIsActive('diversity')} to='/diversity'>
              Diversity
              </Link>
              <div className={classes["topFive"]}>{topFiveDiversity}</div>
            </div>
          </div>
        </div>
         <div className='row' style={{padding:15, border:'1px solid black', marginTop: 15}}>
          {bucketDisplay}
        </div>
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
