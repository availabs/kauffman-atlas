/* @flow */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { increment, doubleAsync } from '../../redux/modules/counter'
import DuckImage from './Duck.jpg'
import classes from './HomeView.scss'
import NationalMap from 'components/maps/NationalMap'
// import DensityView from 'views/'
import { browserHistory } from 'react-router'


type Props = {
  counter: number,
  doubleAsync: Function,
  increment: Function
};

export class HomeView extends React.Component<void, Props, void> {
  static propTypes = {
    counter: PropTypes.number.isRequired,
    doubleAsync: PropTypes.func.isRequired,
    increment: PropTypes.func.isRequired
  };

  render () {


    let msaClick = (d) =>{
      console.log(d);
      this.props.history.push('/metro/'+d.id);
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
          <div className='col-xs-6' style={sectionStyle}>
            <Link to='/combined'>Combined</Link>
          </div>
          <div className='col-xs-6' style={sectionStyle}>
            <Link to='/density'>Density</Link>
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-6' style={sectionStyle}>
            <Link to='/fluidity'>Fluidity</Link>
          </div>
          <div className='col-xs-6' style={sectionStyle}>
            <Link to='/diversity'>Diversity</Link>
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
  counter: state.counter
})

export default connect((mapStateToProps), {
  increment: () => increment(1),
  doubleAsync
})(HomeView)
