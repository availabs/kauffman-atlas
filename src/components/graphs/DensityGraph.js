"use strict"
import React from 'react'
import d3 from 'd3'
import { connect } from 'react-redux'
import { loadDensityData } from 'redux/modules/densityData'
import colorbrewer from 'colorbrewer'
import topojson from 'topojson'
import classes from '../../components/maps/NationalMap.scss'
import LineGraph from '../../components/graphs/LineGraph.js'

export class DensityGraph extends React.Component<void, Props, void> {
  constructor () {
    super()
    this.state = {
      data:null,
      loaded:false,
      plot:"rank",
      dataType:"raw"
    }
    this._initGraph = this._initGraph.bind(this)
    this._drawGraph = this._drawGraph.bind(this)
    this._processData = this._processData.bind(this)
  }

  componentWillMount () {
    this._initGraph();
  }

  componentWillReceiveProps (nextProps){
    if(this.props !== nextProps){
      this.setState({loaded:false})
    }
    if(this.props.loaded !== nextProps.loaded){
      this._processData(nextProps);
    }
  }

  _initGraph () {
    if(!this.props.loaded){
      return this.props.loadData()
    }
    if(!this.state.loaded){
      this._processData(this.props)      
    }
  }

  _processData (props){
     var data = props.data,
        dataset = this.props.selectedMetric;

    var scope = this,
        ages = d3.range(12),
        newFirmData = {};


    Object.keys(data).forEach(function(firmAge){
        Object.keys(data[firmAge]).forEach(function(metroAreaId){
            //If we havent gotten to this MSA yet
            if(!newFirmData[metroAreaId]){
                newFirmData[metroAreaId] = {};
            }

            //Iterating through every year for a given firm age in a metro area
            data[firmAge][metroAreaId].forEach(function(rowData){
                if(dataset == "newValues"){
                    if(rowData["year2"]>= 1990 && rowData["year2"]<= 2009){
                        if(!newFirmData[metroAreaId][rowData["year2"]]){
                            newFirmData[metroAreaId][rowData["year2"]] = {};
                        }
                        newFirmData[metroAreaId][rowData["year2"]][firmAge] = rowData["firms"]; 
                    }                      
                }
                else{
                    if(!newFirmData[metroAreaId][rowData["year2"]]){
                        newFirmData[metroAreaId][rowData["year2"]] = {};
                    }                        
                    newFirmData[metroAreaId][rowData["year2"]][firmAge] = rowData["emp"];
                }
            })
        })
    })  

    var rawChartData = [];

    //Every msa represented as:
    //{values:[{x:val,y:val}....],key=msa,}
    //Want to return 1 (x,y) object for each year, where x=year and y=new firms per 1000 people
    var relativeChartData = Object.keys(newFirmData).map(function(msaId){
        //Iterating through every year within a metro area
        var rawValueArray = [];
        var relativeValueArray = Object.keys(newFirmData[msaId]).map(function(year){
            var curRelativeCoord={"x":+year,"y":0},
                curRawCoord={"x":+year,"y":0},
                newFirmSum = 0,
                newPer1000 = 0,
                pop = 0,
                pop1000 = 0,
                totalEmploySum = 0,
                share = 0;

            //Creates number of new firms for that year
            ages.forEach(function(age){
                if(newFirmData[msaId][year][age] && (age < 6)){
                    newFirmSum = newFirmSum + +newFirmData[msaId][year][age];
                }

                if(dataset == "share"){
                    if(newFirmData[msaId][year][age]){
                        totalEmploySum = totalEmploySum + +newFirmData[msaId][year][age];                   
                    }                            
                }
            })

            if(dataset == "share"){
                share = newFirmSum/totalEmploySum;

                curRawCoord["y"] = newFirmSum
                curRelativeCoord["y"] = share;

                //Want to return: x:year y:percent
                rawValueArray.push(curRawCoord);
                return curRelativeCoord;
            }
            else{
                if(props.metros[msaId] && props.metros[msaId].pop && props.metros[msaId].pop[year]){
                    pop = props.metros[msaId].pop[year];
                    pop1000 = (pop/1000);                   
                }
                else{
                    pop1000=0;
                }

                if(pop1000 == 0){
                    newPer1000 = 0;
                }
                else{

                    newPer1000 = newFirmSum/pop1000;
                }
                
                curRelativeCoord["y"] = newPer1000;
                curRawCoord["y"] = newFirmSum;

                //Want to return: x:year y:percent
                rawValueArray.push(curRawCoord);                            
                return curRelativeCoord;                        
            }
        })

        //Only return once per metroArea
        rawChartData.push({key:msaId,values:rawValueArray,area:false})
        return {key:msaId,values:relativeValueArray,area:false};
    })

    var rankedData = scope.rankCities(relativeChartData);
    var polishedData = scope.polishData(rankedData,("relative"+dataset));

    var rankedData2 = scope.rankCities(rawChartData);
    var polishedData2 = scope.polishData(rankedData2,dataset)

    var graphData = {};
    graphData['raw'] = polishedData2;
    graphData['relative'] = polishedData;
               
    this._drawGraph(graphData);
  }
  rankCities (cities){
      var scope=this,
          years = d3.range(
              [d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.x }); })],
              [d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.x }); })+1]
          );

      years.forEach(function(year){
          var rank = 1;
          //Sort cities according to each year
          cities.sort(scope.sortCities(year));

          //Go through and assign ranks for current year
          cities.forEach(function(city){
              city.values.forEach(function(yearValues){
                  if(yearValues.x == year){
                      yearValues.rank = rank;
                  }
              })
              rank++;
          })
      })          
      return cities;   
  }
  polishData (data,dataset){
    var scope = this;
    var newData = [];

    Object.keys(data).forEach(function(metroArea){
      var name = "undefined";
      if(scope.props.metros[data[metroArea].key]){
        name = scope.props.metros[data[metroArea].key].name
      }
      if(data[metroArea].length != 0){
          var city = {
            values:null,
            name: name,
            key:data[metroArea].key,
            color:scope.colorFunction(data[metroArea],dataset)
          }

          city.values = data[metroArea].values.map(function(i){
              return {
                  city:city,
                  x:i.x,
                  y:i.y,
                  rank:i.rank,
                  raw:i.raw,
                  color:scope.colorFunction(i,dataset)
              }
          })   
            newData.push(city);           
      }
    });
    return newData;
  }
  colorFunction (params,dataset){
      var scope = this,
          cityColor;

      if(params){
          if(dataset == "opportunity" && params.x){
              var color = scope.colorOppGroup(params.x);    
              cityColor = color(params.y);                             
          }
          else if(params.values){
              var valueLength = params.values.length;
              var curRank = params.values[valueLength-1].rank
              var color = scope.colorGroup();
              cityColor = color(curRank);   
          }
      }  

      return cityColor;
  }
  colorGroup (){
      var scope = this;

      var colorGroup = d3.scale.linear()
          .domain(d3.range(1,366,(366/9)))
          .range(colorbrewer.Spectral[9]);
      
      return colorGroup;
  }

  sortCities (year){
      var scope = this;
      return function(a,b){
    var aValue,
          bValue;

        a.values.forEach(function(yearValues){
          if(yearValues.x == year){
            aValue = yearValues.y;
          }
        })            
    
        b.values.forEach(function(yearValues){
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

  _drawGraph (graphData) {
    this.setState({loaded:true,data:graphData})
    console.log(graphData);
  }

  render () {
    this._initGraph();
    if(this.state.loaded){
      if(this.props.selectedMetric == 1){
        var metric = "share"
      }
      if(this.props.selectedMetric == 2){
        var metric = "newValues"
      }
       return (
          <LineGraph data={this.state.data} plot={this.state.plot} dataType={this.state.dataType} title={metric} graph={metric}/>
        )     
    }
    else{
      return (
        <div></div>
      )      
    }

  }
}

const mapStateToProps = (state) => ({
  loaded : state.densityData.loaded,
  data: state.densityData.data,
  metros: state.metros
})

export default connect((mapStateToProps), {
  loadData: () => loadDensityData()
})(DensityGraph)