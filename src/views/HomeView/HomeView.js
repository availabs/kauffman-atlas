/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { increment, doubleAsync } from '../../redux/modules/counter'
import { loadDensityData,loadComposite } from 'redux/modules/densityData'
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
   constructor () {
    super()
    this.state = {
      activeComponent:'combined'
    }
    this._initGraph = this._initGraph.bind(this)
    this._isActive = this._isActive.bind(this)
    this._linkIsActive = this._linkIsActive.bind(this)
    this._setActiveComponent = this._setActiveComponent.bind(this)
  }

  componentWillMount () {
    this._initGraph();
  }

  componentWillReceiveProps (nextProps){
    if(this.props.loaded !== nextProps.loaded){
      return this.props.loadData()
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

  _initGraph () {
    if(!this.props.loaded){
      return this.props.loadData()
    }
    if(!this.props['composite']){
      return this.props['getcomposite']()
    }         
  }

  render () {

    this._initGraph();
    var topFive;

    let msaClick = (d) =>{
      console.log(d);
      if(d.id){
       this.props.history.push('/metro/'+d.id);       
      }
      else{
        this.props.history.push('/metro/'+d.target.id);  
      }

    }

    if(this.props.loaded && this.props.composite){

      topFive = this.props.composite.reduce((prev,msa) => {
        if(msa.values[msa.values.length-1].rank < 6){
          prev[msa.values[msa.values.length-1].rank] = {name:msa.name,score:msa.values[msa.values.length-1].y,id:msa.key}
        }
        return prev;
      },{})
      console.log(topFive)
      topFive = Object.keys(topFive).map(rank => {
        var roundFormat = d3.format(".2f")
        return(
              <div onClick={msaClick} id={topFive[rank].id} className={classes["msa"]}>{rank + ". " + topFive[rank]["name"]} <div className={classes["score"]}>{roundFormat(topFive[rank]["score"])}</div></div>
        )
      })



    }
    else{
      topFive = "Not"
    }



    const sectionStyle = {
    }

    return (
     
      <div className='container'>
        <div className='row'>
          <div className={'col-xs-12 ' + classes['text-div']}>
            <strong>Lorem</strong> ipsum dolor sit amet, mel nibh soluta molestiae in, ut vis illud utamur disputando, sed id eius bonorum. Mei vivendum adversarium ex, libris assentior eu per. In summo invenire interpretaris quo, ex vix partem facilisis signiferumque, ridens splendide conclusionemque an vis. Dico aliquip scriptorem vix et. Te eum omnes possit omittantur. Ei volutpat dignissim sit, erat option pri in.
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-3' style={sectionStyle} onClick={this._setActiveComponent.bind(null,'combined')}>
            <div className={classes['selector-buttons']+' '+this._isActive('combined')}>
              <Link className={'darklink '+this._linkIsActive('combined')} to='/combined'>Combined</Link>
            </div>
          </div>
          <div className='col-xs-3' style={sectionStyle} onClick={this._setActiveComponent.bind(null,'density')}>
           <div className={classes['selector-buttons']+' '+this._isActive('density')}>
              <Link className={'darklink '+this._linkIsActive('density')} to='/density'>Density</Link>
              <div className={classes["topFive"]}>{topFive}</div>
            </div>
          </div>
          <div className='col-xs-3' style={sectionStyle} onClick={this._setActiveComponent.bind(null,'fluidity')}>
            <div className={classes['selector-buttons']+' '+this._isActive('fluidity')}>
              <Link className={'darklink '+this._linkIsActive('fluidity')} to='/fluidity'>Fluidity</Link>
            </div>
          </div>
          <div className='col-xs-3' style={sectionStyle} onClick={this._setActiveComponent.bind(null,'diversity')}>
            <div className={classes['selector-buttons']+' '+this._isActive('diversity')}>
              <Link className={'darklink '+this._linkIsActive('diversity')} to='/diversity'>Diversity</Link>
            </div>
          </div>
        </div>
        <div className='row'>
         <div className={'col-xs-12 ' + classes['text-div']}>
              <strong>Lorem</strong> ipsum dolor sit amet, mel nibh soluta molestiae in, ut vis illud utamur disputando, sed id eius bonorum. Mei vivendum adversarium ex, libris assentior eu per. In summo invenire interpretaris quo, ex vix partem facilisis signiferumque, ridens splendide conclusionemque an vis. Dico aliquip scriptorem vix et. Te eum omnes possit omittantur. Ei volutpat dignissim sit, erat option pri in.
           </div>
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
  composite:state.densityData.compositeData,
  loaded:state.densityData.loaded
})

export default connect((mapStateToProps), {
  loadData: () => loadDensityData(),
  getcomposite: () => loadComposite()
})(HomeView)
