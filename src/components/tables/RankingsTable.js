/* @flow */
import React from 'react'
import { connect } from 'react-redux'
import CategoryNames from 'components/misc/categoryNames'
import classes from 'styles/sitewide/index.scss'
var roundFormat = d3.format(".2f")
import d3 from 'd3'


export class RankingsTable extends React.Component<void, Props, void> {
   constructor () {
    super()
    this.state = {
      sortColumn:"y",
      sortDirection:"nat"
    }

    this._sortTableChange = this._sortTableChange.bind(this)
    this._renderTable = this._renderTable.bind(this)
  }

  _sortTableChange (columnName,e){
    var ColumnNames = {
      "MetroId" : "key",
      "Name" : "name",
      "Score" : "y",
      "Rank" : "y"
    }

    d3.selectAll(".caret").style('visibility','visible')
    d3.selectAll("."+classes["upCaret"]).style('visibility','visible')

    if(this.state.sortColumn == ColumnNames[columnName]){
      this.state.sortDirection == "nat" ? d3.select("#"+e.target.text).select("span").select(".caret").style('visibility','hidden') : d3.select("#"+e.target.text).select("span").select("."+classes["upCaret"]).style('visibility','hidden')
      this.setState({sortDirection:this.state.sortDirection == "nat" ? "rev" : "nat"})
    }
    else{
      d3.select("#"+e.target.text).select("span").select("."+classes["upCaret"]).style('visibility','hidden')   
      this.setState({sortColumn:ColumnNames[columnName],sortDirection:"nat"})      
    }
  }


  _renderTable(data){
    function _sortValues(year){
      return (a,b) => {
        var aValue = null,
        bValue = null;

        a.values.forEach(yearValues => {
          if(yearValues.x == year){
            aValue = yearValues.y;
          }
        })            

        b.values.forEach(yearValues => {
          if(yearValues.x == year){
            bValue = yearValues.y;
          }
        })       

        if(aValue > bValue){
          return -1;
        }
        if(bValue > aValue){
          return 1;
        }           
              
        return 0;     
      }
    }

    function _sortProp(prop){
      return (a,b) => {
        var aValue,
        bValue;

        aValue = a[prop];
        bValue = b[prop];

        if(aValue > bValue){
          return 1;
        }
        if(bValue > aValue){
          return -1
        }

        return 0
      }
    }

    if(this.state.sortColumn == "y"){
      data.sort(_sortValues(this.props.year))
    }
    else{
      data.sort(_sortProp(this.state.sortColumn))
    }

    this.state.sortDirection == "rev" ? data.reverse() : null
    return (
      <table id="rankingsTable" className={'table ' + classes['table-hover']}>
        <thead>
          <tr>
            <td id="Rank" className={classes['rankingsTableHeader']}>
              <a
                 onClick={this._sortTableChange.bind(null,"Rank")}>
                  Rank
              </a>
              <span className={classes['rankingsCaret']}>
                <span className={classes['upCaret']}></span>
                <span className="caret"></span>
              </span>
            </td>          
            <td id="Name" className={classes['rankingsTableHeader']}>
              <a
                 onClick={this._sortTableChange.bind(null,"Name")}>
                    Name
              </a>
              <span className={classes['rankingsCaret']}>
                <span className={classes['upCaret']}></span>
                <span className="caret"></span>
              </span>
            </td>
            <td id={this.props.active.substring(this.props.active.length-9) == "composite" ? "Score" : "Value"} className={classes['rankingsTableHeader']}>
              <a
                 onClick={this._sortTableChange.bind(null,"Score")}>
                    {this.props.active.substring(this.props.active.length-9) == "composite" ? "Score" : "Value"}
              </a>
              <span className={classes['rankingsCaret']}>
                <span className={classes['upCaret']}></span>
                <span className="caret"></span>
              </span>
            </td>
          </tr>
        </thead>
        <tbody>
          {
            data.map((metro) => {
                var curYearValue = metro.values.filter(d => d.x==this.props.year)[0]
                return (
                  <tr id={metro.key} onClick={this.props.onClick.bind(null,metro.key)} onMouseOver={this.props.onHover.bind(null,metro.key)}>   
                    <td>{curYearValue ? curYearValue.rank : "N/A"}</td>      
                    <td>{metro.name}</td>
                    <td>{curYearValue ? roundFormat(curYearValue.y) : "N/A"}</td>        
                  </tr>
                  )
              })
          }
        </tbody>
      </table>
      )
  }


  render() {
    var table = this._renderTable(this.props.data);
    return (
     <div>
      {table}
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
  getcombinedcomposite: () => loadCombinedComposite(),
})(RankingsTable)
