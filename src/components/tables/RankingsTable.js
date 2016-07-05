/* @flow */
import React from 'react'
import { connect } from 'react-redux'
import CategoryNames from 'components/misc/categoryNames'
import classes from 'styles/sitewide/index.scss'
var roundFormat = d3.format(".2f")
import d3 from 'd3'

let categories = {
  combined: ['combinedcomposite', 'densitycomposite', 'fluiditycomposite', 'diversitycomposite'],
  density: ['densitycomposite','densitynewfirms', 'densityshareofemploymentinnewfirms','densityshareEmpNoAccRet','densityshareEmpHighTech'],
  diversity: ['diversitycomposite','diversityincomebasedonchildhood','diversitypercentageofforeignbornpopulation','diversityemploymentlocationquotientvariance'],
  fluidity: ['fluiditycomposite','fluidityhighgrowthfirms','fluiditynetmigration','fluiditytotalmigration','fluidityannualchurn'],
  qwiDensity: ['qwiDensityshareEmpAll','qwiDensityshareEmpInfo','qwiDensityshareEmpPro']      
}


export class RankingsTable extends React.Component<void, Props, void> {
   constructor () {
    super()
    this.state = {
      sortDirection:"nat",
      sortColumn:null
    }

    this._sortTableChange = this._sortTableChange.bind(this)
    this._renderTable = this._renderTable.bind(this)
  }

  _sortTableChange (columnNameInput,e){

    d3.selectAll(".caret").style('visibility','visible')
    d3.selectAll("."+classes["upCaret"]).style('visibility','visible')

    var columnName = columnNameInput == "rank" ? this.props.active : columnNameInput

    d3.selectAll("."+classes['rankingsTableHeader']).style("font-weight","400")
    d3.select("#"+columnNameInput).style("font-weight","900")

    if(this.state.sortColumn == columnName){
      this.state.sortDirection == "nat" ? d3.select("#"+columnName).select("span").select(".caret").style('visibility','hidden') : d3.select("#"+columnName).select("span").select("."+classes["upCaret"]).style('visibility','hidden')
      this.setState({sortDirection:this.state.sortDirection == "nat" ? "rev" : "nat"})
    }
    else{
      d3.select("#"+columnName).select("span").select("."+classes["upCaret"]).style('visibility','hidden')  
      this.setState({sortColumn:columnName,sortDirection:"nat"})      
    }
  }

  componentWillMount(){
    this.setState({sortColumn:this.props.active})
  }

   shouldComponentUpdate(nextProps,nextState){
    if(this.props.active != nextProps.active ||
      this.state.sortColumn != nextState.sortColumn ||
      this.state.sortDirection != nextState.sortDirection ||
      this.props.year != nextProps.year){
      return true
    }
    else{
      return false
    }
   }

  componentWillReceiveProps(nextProps){
    if(!this.state.sortColumn || this.props.active != nextProps.active){
      this._sortTableChange(nextProps.active)
      this.setState({sortColumn:nextProps.active})      
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

        if(aValue >= bValue){
          return -1;
        }
        if(bValue > aValue){
          return 1;
        }           
              
   
      }
    }

    function _sortProp(prop){
      return (a,b) => {
        var aValue,
        bValue;

        aValue = a[prop];
        bValue = b[prop];

        if(aValue >= bValue){
          return 1;
        }
        if(bValue > aValue){
          return -1
        }


      }
    }

    if(!this.state.sortColumn){
      return <span>Loading...</span>
    }

    //If sort column == name, then use active to draw table
    //Otherwise, use the desired metric
    var indexingColumn = this.state.sortColumn == "Name" ? this.props.active : this.state.sortColumn

    //Sort by desired metric OR name
    if(this.state.sortColumn == "Name"){
      data[indexingColumn].sort(_sortProp("name"))
    }
    else{
      if(this.state.sortColumn == "diversityincomebasedonchildhood" && this.props.active != "diversityincomebasedonchildhood"){
        data[indexingColumn].sort(_sortValues("combined"))        
      }
      else if(this.state.sortColumn != "diversityincomebasedonchildhood" && this.props.active == "diversityincomebasedonchildhood"){
        data[indexingColumn].sort(_sortValues(2013)) 
      }
      else{
        data[indexingColumn].sort(_sortValues(this.props.year)) 
      }

    }
    console.log(typeof (this.props.year) == "number")
    this.state.sortDirection == "rev" ? data[indexingColumn].reverse() : null
    return (
      <table id="rankingsTable" className={'table ' + classes['table-hover']}>
        <thead>
          <tr>      
            <td id="rank" className={classes['rankingsTableHeader']}>
                <a
                   onClick={this._sortTableChange.bind(null,"rank")}>
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
            {
              Object.keys(data).map(cat => {
                return (
                  <td id={cat} className={classes['rankingsTableHeader']}>
                    <a
                       onClick={this._sortTableChange.bind(null,cat)}>
                          {CategoryNames[cat]}
                    </a>  
                    <span className={classes['rankingsCaret']}>
                      <span className={classes['upCaret']}></span>
                      <span className="caret"></span>
                    </span>  
                  </td>
                  )
              })
            }
          </tr>
        </thead>
        <tbody>
          {
            //Make a row for each metro, order determined by sort column
            data[indexingColumn].map(metro => {
              //Go through each metric in the dataset.
              var metroCells = Object.keys(data).map(catName => {
                if(catName == "diversityincomebasedonchildhood" && this.props.active != "diversityincomebasedonchildhood"){
                  var singleMetroYearValue = data[catName].filter(d => d.key == metro.key)[0] ? data[catName].filter(d => d.key == metro.key)[0].values.filter(d => d.x == "combined")[0] : null
                }
                else{
                  if(catName !== "diversityincomebasedonchildhood" && typeof this.props.year != "number"){
                    var singleMetroYearValue = data[catName].filter(d => d.key == metro.key)[0] ? data[catName].filter(d => d.key == metro.key)[0].values.filter(d => d.x == 2013)[0] : null                                      
                  }
                  else{
                    var singleMetroYearValue = data[catName].filter(d => d.key == metro.key)[0] ? data[catName].filter(d => d.key == metro.key)[0].values.filter(d => d.x == this.props.year)[0] : null                  
                  }
                
                }
                

                return (<td>{singleMetroYearValue ? roundFormat(singleMetroYearValue.y) : ""}</td>)
              })
              if(this.state.sortColumn == "diversityincomebasedonchildhood" && this.props.active != "diversityincomebasedonchildhood"){
                var rankCellData = data[this.props.active].filter(d => d.key == metro.key)[0] ? data[this.props.active].filter(d => d.key == metro.key)[0].values.filter(d => d.x == "combined")[0] : null
              }
              else{
                var rankCellData = data[this.props.active].filter(d => d.key == metro.key)[0] ? data[this.props.active].filter(d => d.key == metro.key)[0].values.filter(d => d.x == this.props.year)[0] : null
              }
              var rankCellData = data[this.props.active].filter(d => d.key == metro.key)[0] ? data[this.props.active].filter(d => d.key == metro.key)[0].values.filter(d => d.x == this.props.year)[0] : null
              var rankCell = (<td>{rankCellData ? rankCellData.rank : ""}</td>) 
              return (
                  <tr id={metro.key} onClick={this.props.onClick.bind(null,metro.key)} onMouseOver={this.props.onHover.bind(null,metro.key)}>      
                    {rankCell}
                    <td>{metro.name}</td>
                    {metroCells}       
                  </tr>
                )
            })
          }
        </tbody>
      </table>
      )
  }


  render() {
    return (
     <div>
      {this._renderTable(this.props.data2)}
     </div>
    )

  }



}


const mapStateToProps = (state) => ({
  metros : state.metros
})

export default connect((mapStateToProps), {

})(RankingsTable)
