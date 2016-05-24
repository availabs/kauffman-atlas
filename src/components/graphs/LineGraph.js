"use strict"
import React from 'react'
import d3 from 'd3'
import { connect } from 'react-redux'
import classes from '../../components/maps/NationalMap.scss'

export class LineGraph extends React.Component<void, Props, void> {

  constructor () {
    super()

    this._renderGraph = this._renderGraph.bind(this)
    this._labelFunction = this._labelFunction.bind(this)
  }
  componentDidMount () {
      this._renderGraph();
  }
  _renderGraph () {
    var percFormat = d3.format(".3%"),
        axisPercFormat = d3.format("%"),
        commaFormat = d3.format(","),
        scope = this;

    if(Array.isArray(scope.props.data)){
        var data = scope.props.data;
    }
    else{
        var data = scope.props.data[scope.props.dataType];
    }

    if(this.props.metros){
      data = data.filter(d => {
        var inBucket = false;
        this.props.metros.forEach(msaId => {
          if(d.key == msaId){
            inBucket = true;
          } 
        })
        return inBucket;
      }) 
    }

    var cityData = data.map(metroArea => {
      var city = {
        name:metroArea.name,
        color:metroArea.color,
        key:metroArea.key,
        values:null
      }

      city.values = metroArea.values.map(yearValue => {
        return {x:yearValue.x, y:yearValue.y, city:city, rank:yearValue.rank}
      }).filter(yearValue => {
        if(this.props.graph == "inc"){
          if(yearValue.y <= 0){
            return false;
          }
          else{
            return true;
          }  
        }
        if(this.props.graph == "foreignBorn"){
          if(yearValue.y < 0){
            return false;
          }
          else{
            return true;
          }  
        }
        else{
          if(yearValue.y == null){
            return false;
          }
          else{
            return true;
          }          
        }

        })

        return city;
      })



    var filteredData =  cityData.filter(metroArea => {
      if(metroArea.values.length == 0){
        return false;
      }
      else{
        return true;
      }
    })

    var margin = {top: 10, right: 10, bottom: 10, left: 10}
    let width = document.getElementById("mapDiv").offsetWidth
    let height = width  * 0.5

    let paddedWidth = width-100;
    let paddedHeight = height-100;

    if(scope.props.plot == "rank"){
        var voronoi = d3.geom.voronoi()
            .x(function(d) { return x(d.x); })
            .y(function(d) { return y(d.rank); })
            .clipExtent([[-margin.left, -margin.top], [paddedWidth + margin.right, paddedHeight + margin.bottom]])

        var y = d3.scale.linear()
            .range([paddedHeight,0]);

        y.domain([d3.max(filteredData, function(c) { return d3.max(c.values, function(v) { return v.rank }); }),0]);

        var x = d3.scale.ordinal()
            .domain(d3.range(
                [d3.min(filteredData, function(c) { return d3.min(c.values, function(v) { return v.x }); })],
                [d3.max(filteredData, function(c) { return d3.max(c.values, function(v) { return v.x }); })+1]
                ))
            .rangeRoundBands([0,paddedWidth]);

        var xTangent = 40; // Length of Bézier tangents to control curve.

        var line = function line(d) {
          var path = [];

          x.domain().slice(1).forEach(function(b, i) {
            var a = x.domain()[i];

            if(d[i+1] != undefined){
                path.push("L", x(a), ",", y(d[i].rank), "h", x.rangeBand(), curve(a, b, i, d));    
            }
            
          });
          path[0] = "M";
          path.push("h", x.rangeBand());
          return path.join("");
        }

        var curve = function curve(a, b, i, d) {
        
          return "C" + (x(a) + xTangent + x.rangeBand()) + "," + y(d[i].rank)+ " "
              + (x(b) - xTangent) + "," + y(d[i+1].rank) + " "
              + x(b) + "," + y(d[i+1].rank);
        }  

        var heightVal = y.domain()[1]-y.domain()[0];
    }
    else{
        var voronoi = d3.geom.voronoi()
            .x(function(d) { return x(d.x); })
            .y(function(d) { return y(d.y); })
            .clipExtent([[-margin.left, -margin.top], [paddedWidth + margin.right, paddedHeight + margin.bottom]])

        var y = d3.scale.linear()
        .range([paddedHeight,0]);

        y.domain([d3.min(filteredData, function(c) { return d3.min(c.values, function(v) { return v.y }); }),d3.max(filteredData, function(c) { return d3.max(c.values, function(v) { return v.y }); })]);

        var x = d3.scale.linear()
            .range([0, paddedWidth]);

        x.domain([
            d3.min(filteredData, function(c) { return d3.min(c.values, function(v) { return v.x }); }),
            d3.max(filteredData, function(c) { return d3.max(c.values, function(v) { return v.x }); })
        ]);

        var line = d3.svg.line()
            .interpolate("cardinal")
            .x(function(d) { return x(d.x); })
            .y(function(d) { return y(d.y); });

        heightVal = 200;
    }

    var xAxis = d3.svg.axis()
        .scale(x)
        .outerTickSize([3])
        .tickFormat(d3.format("f"))
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .outerTickSize([3])
        .orient("left");

    if(scope.props.plot != 'rank'){
      if(scope.props.dataType != "raw" && scope.props.graph != "newValues" && (scope.props.graph.substr(-9)) != "composite" && scope.props.graph != "inc"){
          yAxis.tickFormat(axisPercFormat);
      }
      else if(scope.props.dataType != "raw" && scope.props.graph == "inc"){
          yAxis.tickFormat(percFormat);         
      }    
      else{
        xAxis.ticks(x.domain()[1]-x.domain()[0])           
      }      
    }

    //Get rid of everything already in the svg
    d3.select("#lineGraph svg").selectAll("*").remove();

    //Create new svg
    var svg = d3.select("#lineGraph svg")
    .attr('viewBox','-90 -20 ' + (width) + ' ' + (height))

    filteredData.sort(function(a,b){
        return b.values[0].rank - a.values[0].rank
    })

    //For each city
    //Draws two lines, to create a colored line with a black border
    filteredData.forEach(function(b,i){
        svg.append("g")
            .append("path")
            .attr("d",function(){b.border = this; return line(b.values)})
            .style("stroke","black")
            .style("stroke-width",.6)
            .style("fill","none")
            .style("opacity",".4");     

        svg.append("g")
            .append("path")
            .attr("class","cities")
            .attr("d",function(){b.line = this; return line(b.values)})
            .style("stroke",function(){return b.color;})
            .style("stroke-width",.5)
            .style("fill","none")
            .style("opacity",".6");                    
    })

    //Focus is the hover popup text
    var focus = svg.append("g")
          .attr("transform", "translate(-100,-100)")
          .attr("class", "focus");

    focus.append("text")
      .attr("y", 10)
      .style("font-size",".75em");

    var voronoiGroup = svg.append("g")
          .attr("class", "voronoi")
          .style("fill","#FFFFFF")
          .style("stroke","#000000")
          .style("opacity","0")

    voronoiGroup.selectAll("path")
            .data(voronoi(d3.nest()
                .key(function(d) { return x(d.x) + "," + y(d.y); })
                .rollup(function(v) { return v[0]; })
                .entries(d3.merge(filteredData.map(function(d) { return d.values; })) )
                .map(function(d) { return d.values; })))
        .enter().append("path")
            .attr("d", function(d) { if(d!=undefined){return "M" + d.join("L") + "Z"}; })
            .datum(function(d) { if(d!=undefined){return d.point}; })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click",click);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(-1," + (paddedHeight) + ")")
      .call(xAxis)
    .selectAll("text")  
      .style("text-anchor", "end")
      .attr("dx", "-.6em")
      .attr("dy", ".15em")
      .attr("transform", function(d) {
          return "rotate(-65)" 
      })

    svg.append("g")
      .attr("class", "y axis")   
      .attr("transform", "translate(2,0)")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", "-7.5em")
      .attr("dy", "2em")
      .attr("x",0-(paddedHeight/2))
    .style("text-anchor", "middle")
      .style("font-weight","bold")
      .style("text-decoration","underline")
      .text(function(){
        if(scope.props.plot == 'value'){
          if(scope.props.graph.substr(-9) !== 'composite'){
            return scope._labelFunction().split("by")[0]  
          }
          else{
            return "Composite Score"
          }      
        }
        else{
         return "Ranking"               
        }
      });

    function mouseover(d) {
        d3.select(d.city.line).style("stroke-width",( (paddedHeight/(heightVal) )+2))
        d3.select(d.city.line).style("stroke","#000000")
        d3.select(d.city.line).style("opacity","2")

        var popText = "",
            name;

            name = d.city.name;
       
        if(scope.props.plot == "rank"){
            popText += name + ' | ' + d.x +':  '+ d.rank;                    
        }
        else{
            if(scope.props.dataType != "raw" && scope.props.graph != "newValues" && (scope.props.graph.substr(-9)) != "composite"){
                popText += name + ' | ' + d.x +':  '+ percFormat(d.y);
            }
            else{
                popText += name + ' | ' + d.x +':  '+ commaFormat(d.y);                        
            }
        }

        d.city.line.parentNode.appendChild(d.city.line);
        focus.attr("transform", "translate(10,-20)");
        focus.select("text").text(popText);
    }

    function click(d){ 
        console.log("d.city",d.city);
    }

    function mouseout(d) {                              
        d3.select(d.city.line).style("stroke-width",.5)
        d3.select(d.city.line).style("stroke",function(){return d.city.color})
        d3.select(d.city.line).style("opacity",".6")
        focus.attr("transform", "translate(-100,-100)");
    }
  }

  _labelFunction () {

    if(this.props.graph == "share"){
      if(this.props.plot == "value"){
        if(this.props.dataType == "raw"){
          return "Number employed in new and young firms by year"
        }
        else{
          return "Share of employment in new and young firms by year"
        }             
      }
      else{
        if(this.props.dataType == "raw"){
          return "Metro Area Ranking for number employed in new and young firms by year"
        }
        else{
          return "Metro Area Ranking for share of employment in new and young firms by year"
        }                  
      }          
    }
    else if(this.props.graph == "newValues"){
      if(this.props.plot == "value"){
        if(this.props.dataType == "raw"){
          return "Number of new and young firms by year"
        }
        else{
          return "Number of new and young firms per 1000 people by year"
        }             
      }
      else{
        if(this.props.dataType == "raw"){
          return "Metro Area Ranking for number of new and young firms by year"
        }
        else{
          return "Metro Area Ranking for new and young firms per 1000 people by year"
        }                  
      }          
    }
    else if (this.props.graph == "densitycomposite"){
      if(this.props.plot == "value"){
          return "Composite density score by year"            
      }
      else{
          return "Metro Area Ranking for composite density score by year" 
      }          
    }
    else if(this.props.graph == "irsNet"){
      if(this.props.plot == "value"){
        if(this.props.dataType == "raw"){
          return "Net migration by year"
        }
        else{
          return "Net Migration as a percentage of total population by year"
        }             
      }
      else{
        if(this.props.dataType == "raw"){
          return "Metro Area Ranking for net migration by year"
        }
        else{
          return "Metro Area Ranking for net Migration as a percentage of total population by year"
        }                  
      }          
    }    
    else if(this.props.graph == "irsTotalMigration"){
      if(this.props.plot == "value"){
        if(this.props.dataType == "raw"){
          return "Total Migration (inflow/outflow sum) by year"
        }
        else{
          return "Total Migration (inflow/outflow sum) as a percentage of total population by year"
        }             
      }
      else{
        if(this.props.dataType == "raw"){
          return "Metro Area Ranking for total Migration (inflow/outflow sum) by year"
        }
        else{
          return "Metro Area Ranking for total Migration (inflow/outflow sum) as a percentage of total population by year"
        }                  
      }          
    } 
    else if(this.props.graph == "irsInflowMigration"){
      if(this.props.plot == "value"){
        if(this.props.dataType == "raw"){
          return "Inflow Migration by year"
        }
        else{
          return "Inflow Migration as a percentage of total population by year"
        }             
      }
      else{
        if(this.props.dataType == "raw"){
          return "Metro Area Ranking for inflow Migration by year"
        }
        else{
          return "Metro Area Ranking for inflow Migration as a percentage of total population by year"
        }                  
      }          
    } 
    else if(this.props.graph == "irsOutflowMigration"){
      if(this.props.plot == "value"){
        if(this.props.dataType == "raw"){
          return "Outflow Migration by year"
        }
        else{
          return "Outflow Migration as a percentage of total population by year"
        }             
      }
      else{
        if(this.props.dataType == "raw"){
          return "Metro Area Ranking for outflow Migration by year"
        }
        else{
          return "Metro Area Ranking for outflow Migration as a percentage of total population by year"
        }                  
      }          
    } 
    else if(this.props.graph == "inc"){
      if(this.props.plot == "value"){
        if(this.props.dataType == "raw"){
          return "Number of High Growth Firms by year"
        }
        else{
          return "Number of High Growth Firms as a percentage of total firms by year"
        }             
      }
      else{
        if(this.props.dataType == "raw"){
          return "Metro Area Ranking for number of High Growth Firms by year"
        }
        else{
          return "Metro Area Ranking for number of High Growth Firms as a percentage of total firms by year"
        }                  
      }          
    } 
    else if (this.props.graph == "fluiditycomposite"){
      if(this.props.plot == "value"){
          return "Composite fluidity score by year"            
      }
      else{
          return "Metro Area Ranking for composite fluidity score by year" 
      }          
    }
    else if(this.props.graph == "foreignBorn"){
      if(this.props.plot == "value"){
        if(this.props.dataType == "raw"){
          return "Number of foreign born current residents by year"
        }
        else{
          return "Number of foreign born current residents as a percentage of total population by year"
        }             
      }
      else{
        if(this.props.dataType == "raw"){
          return "Metro Area Ranking for number of foreign born current residents by year"
        }
        else{
          return "Metro Area Ranking for number of foreign born current residents as a percentage of total population by year"
        }                  
      }          
    } 
    else if (this.props.graph == "diversitycomposite"){
      if(this.props.plot == "value"){
          return "Composite diversity score by year"            
      }
      else{
          return "Metro Area Ranking for composite diversity score by year" 
      }          
    }
    else if (this.props.graph == "combinedcomposite"){
      if(this.props.plot == "value"){
          return "Composite combined score by year"            
      }
      else{
          return "Metro Area Ranking for composite combined score by year" 
      }          
    }
  }


  render () {
    var scope = this;

    console.log("linegraph render state",scope);

    scope._renderGraph();
    return (
        <div className={classes['graphContainer']}>
            <div className={classes['title']}>
              <h4>{scope._labelFunction()}</h4>
            </div>
            <div id="lineGraph" className={classes['svg-container']}>
              <svg className={classes['.svg-content-responsive']} preserveAspectRatio='xMinYMin meet'/>
            </div>
        </div>
    );          
  }
  
}



const mapStateToProps = (state) => ({

})

export default connect((mapStateToProps), {

})(LineGraph)