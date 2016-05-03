/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { increment, doubleAsync } from '../../redux/modules/counter'
import { loadDensityData,loadDensityComposite } from 'redux/modules/densityData'
import { loadFluidityData,loadFluidityComposite } from 'redux/modules/fluidityData'
import DuckImage from './Duck.jpg'
import classes from './HomeView.scss'
import d3 from 'd3'
import NationalMap from 'components/maps/NationalMap'
// import DensityView from 'views/'
import { browserHistory } from 'react-router'


type Props = {
  counter: number,
  doubleAsync: Function,
  increment: Function
};

export class HomeView extends React.Component<void, Props, void> {
  componentWillMount () {
    this._initGraph();
  }

  componentWillReceiveProps (nextProps){
    if(this.props.densityloaded !== nextProps.densityloaded){
      return this.props.loadDensityData()
    }
    if(this.props.fluidityloaded !== nextProps.fluidityloaded){
      return this.props.loadFluidityData()
    }
  }

  _initGraph () {
    if(!this.props.densityloaded){
      return this.props.loadDensityData()
    }
    if(!this.props['densitycomposite']){
      return this.props['getdensityComposite']()
    }
    if(!this.props.fluidityloaded){
      return this.props.loadFluidityData()
    }
    if(!this.props['fluiditycomposite']){
      return this.props['getfluidityComposite']()
    }               
  }

  render () {

    this._initGraph();
    var topFiveDensity;
    var topFiveFluidity

    let msaClick = (d) =>{
      console.log(d);
      if(d.id){
       this.props.history.push('/metro/'+d.id);       
      }
      else{
        this.props.history.push('/metro/'+d.target.id);  
      }

    }

    if(this.props.densityloaded && this.props.densitycomposite){
      topFiveDensity = this.props.densitycomposite.reduce((prev,msa) => {
        if(msa.values[msa.values.length-1].rank < 6){
          prev[msa.values[msa.values.length-1].rank] = {name:msa.name,score:msa.values[msa.values.length-1].y,id:msa.key}
        }
        return prev;
      },{})
      console.log("density",topFiveDensity)
      topFiveDensity = Object.keys(topFiveDensity).map(rank => {
        var roundFormat = d3.format(".2f")
        return(
              <div onClick={msaClick} id={topFiveDensity[rank].id} className={classes["msa"]}>{rank + ". " + topFiveDensity[rank]["name"]} <div className={classes["score"]}>{roundFormat(topFiveDensity[rank]["score"])}</div></div>
        )
      })
    }
    else{
      topFiveDensity = "Loading..."
    }

    if(this.props.fluidityloaded && this.props.fluiditycomposite){
      topFiveFluidity = this.props.fluiditycomposite.reduce((prev,msa) => {
        if(msa.values[msa.values.length-1].rank < 6){
          prev[msa.values[msa.values.length-1].rank] = {name:msa.name,score:msa.values[msa.values.length-1].y,id:msa.key}
        }
        return prev;
      },{})
      console.log("fluidity",topFiveFluidity)
      topFiveFluidity = Object.keys(topFiveFluidity).map(rank => {
        var roundFormat = d3.format(".2f")
        return(
              <div onClick={msaClick} id={topFiveFluidity[rank].id} className={classes["msa"]}>{rank + ". " + topFiveFluidity[rank]["name"]} <div className={classes["score"]}>{roundFormat(topFiveFluidity[rank]["score"])}</div></div>
        )
      })
    }
    else{
      topFiveFluidity = "Loading..."
    }


    const sectionStyle = {
      height: 200,
      border: '1px solid orangered'
    }

    return (
     
      <div className='container'>
        <div className='row'>
          <div className='col-xs-12'>
            <strong>Lorem</strong> ipsum dolor sit amet, mel nibh soluta molestiae in, ut vis illud utamur disputando, sed id eius bonorum. Mei vivendum adversarium ex, libris assentior eu per. In summo invenire interpretaris quo, ex vix partem facilisis signiferumque, ridens splendide conclusionemque an vis. Dico aliquip scriptorem vix et. Te eum omnes possit omittantur. Ei volutpat dignissim sit, erat option pri in.
          </div>
          
        </div>
        <div className='row'>
          <div className='col-xs-3' style={sectionStyle}>
            <Link to='/combined'>Combined</Link>
          </div>
          <div className='col-xs-3' style={sectionStyle}>
            <Link to='/density'>Density</Link>
            <div className={classes["topFive"]}>{topFiveDensity}</div>

          </div>
          <div className='col-xs-3' style={sectionStyle}>
            <Link to='/fluidity'>Fluidity</Link>
            <div className={classes["topFive"]}>{topFiveFluidity}</div>
          </div>
          <div className='col-xs-3' style={sectionStyle}>
            <Link to='/diversity'>Diversity</Link>
          </div>
        </div>
         <div className='col-xs-12'>
            <strong>Lorem</strong> ipsum dolor sit amet, mel nibh soluta molestiae in, ut vis illud utamur disputando, sed id eius bonorum. Mei vivendum adversarium ex, libris assentior eu per. In summo invenire interpretaris quo, ex vix partem facilisis signiferumque, ridens splendide conclusionemque an vis. Dico aliquip scriptorem vix et. Te eum omnes possit omittantur. Ei volutpat dignissim sit, erat option pri in.
          </div>
          
        <div className='row'>
          <div className='col-xs-12'>
            <NationalMap click={msaClick}/>
          </div>
        </div>  
      </div>
      
    )
  }
}

const mapStateToProps = (state) => ({
  densitycomposite:state.densityData.compositeData,
  densityloaded:state.densityData.loaded,
  fluiditycomposite:state.fluidityData.compositeData,
  fluidityloaded:state.fluidityData.fluLoaded
})

export default connect((mapStateToProps), {
  loadDensityData: () => loadDensityData(),
  getdensityComposite: () => loadDensityComposite(),
  loadFluidityData: () => loadFluidityData(),
  getfluidityComposite: () => loadFluidityComposite()
})(HomeView)
