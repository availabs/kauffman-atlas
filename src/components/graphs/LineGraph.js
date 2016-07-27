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
    this._msaClick = this._msaClick.bind(this)
    this._resetBrush = this._resetBrush.bind(this)
  }

  _filterData (props){
    if(Array.isArray(props.data)){
        var data = props.data;
    }
    else{
        var data = props.data[props.dataType];
    }

    if(props.metros){
      data = data.filter(d => {
        var inBucket = false;
        props.metros.forEach(msaId => {
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
        key:metroArea.key,
        values:null
      }

      if(props.activeColor == "ranks"){
        city.color = metroArea.color;
      }
      else{
        city.color = metroArea.scoreColor;
      }


        city.values = metroArea.values.map(yearValue => {
          return {x:yearValue.x, y:yearValue.y, city:city, rank:yearValue.rank}
        }).filter(yearValue => {
          if(props.graph == "inc"){
            if(yearValue.y <= 0){
              return false;
            }
            else{
              return true;
            }  
          }
          if(props.graph == "foreignBorn"){
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

    return filteredData;
  }

  componentWillMount(){
    var newData = this._filterData(this.props);

    var newProps = Object.assign({},this.props);
    newProps.data = newData;



    if(this.props.plot == "value"){
      var extent = [d3.min(newData, function(c) { return d3.min(c.values, function(v) { return v.y }); }),d3.max(newData, function(c) { return d3.max(c.values, function(v) { return v.y }); })]                  
    }
    else{
      var extent = [0,d3.max(newData, function(c) { return d3.max(c.values, function(v) { return v.rank }); })]              
    }
    
    this.setState({extent:extent})
    if(this.props.extent){
      this.setState({
        extent: this.props.extent
      })
    }
  }

  componentDidMount () {
    var newData = this._filterData(this.props);

    var newProps = Object.assign({},this.props);
    newProps.data = newData;

    this._renderGraph(newProps);
  }

  componentWillReceiveProps (nextProps) {
    if(this.props.title !== nextProps.title || this.props.graph !== nextProps.graph || this._metroChange(this.props.metros,nextProps.metros) || this.props.activeColor !== nextProps.activeColor){
      var newData = this._filterData(nextProps);

      var newProps = Object.assign({},nextProps);
      newProps.data = newData;

      if(this.props.plot == "value"){
        var extent = [d3.min(newData, function(c) { return d3.min(c.values, function(v) { return v.y }); }),d3.max(newData, function(c) { return d3.max(c.values, function(v) { return v.y }); })]                  
      }
      else{
        var extent = [0,d3.max(newData, function(c) { return d3.max(c.values, function(v) { return v.rank }); })]              
      }

      this._renderGraph(newProps);
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(prevState.extent !== this.state.extent){
      var newData = this._filterData(this.props);

      var newProps = Object.assign({},this.props);
      newProps.data = newData;

      this._renderGraph(newProps);
    }
  }

  _metroChange (oldMetros,newMetros){
    if(oldMetros && oldMetros.length === newMetros.length){
      //Check to see if they are
      for(var i=0; i<oldMetros.length; i++){
        if(oldMetros[i] != newMetros[i]){
          return true;
        }
      }
      //If we never find a mismatch, the list of metros is the same, we don't need to redraw anything.
      return false; 
    }
      return true;
  }

  _msaClick (d) {
    console.log(d.key);
    this.context.router.push('/metro/'+d.key+'/combined');   
  }

  _renderGraph (props) {
    var percFormat = d3.format(".3%"),
        axisPercFormat = d3.format("%"),
        commaFormat = d3.format(","),
        scope = this;


    var filteredData = props.data.filter(metroArea => {
      var withinBounds = true;

        metroArea.values.forEach(yearValue => {
          if(props.plot == "rank"){
            if(!(yearValue.rank >= scope.state.extent[0]) || !(yearValue.rank <= scope.state.extent[1])){
              withinBounds = false;
            }
          }
          else{
            if(!(yearValue.y >= scope.state.extent[0]) || !(yearValue.y <= scope.state.extent[1])){
              withinBounds = false;
            }            
          }

        })        

      return withinBounds;
    })




    var margin = {top: 10, right: 10, bottom: 10, left: 10}
    let width = document.getElementById("mapDiv").offsetWidth
    let height = width  * 0.6

    let paddedWidth = width-130;
    let paddedHeight = height-100;

    if(props.plot == "rank"){
        var voronoi = d3.geom.voronoi()
            .x(function(d) { return x(d.x); })
            .y(function(d) { return y(d.rank); })
            .clipExtent([[-margin.left, -margin.top], [paddedWidth + margin.right, paddedHeight + margin.bottom]])

        var y = d3.scale.linear()
            .range([0,paddedHeight]);

        y.domain(scope.state.extent);

        var yBrush = d3.scale.linear()
            .range([0,paddedHeight]);

        yBrush.domain([0,d3.max(props.data, function(c) { return d3.max(c.values, function(v) { return v.rank }); })]);


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
            
            if(d[i+1]){
                path.push("L", x(d[i].x,), ",", y(d[i].rank), "h", x.rangeBand(), curve(d[i].x, d[i+1].x, i, d));    
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
        
        y.domain(scope.state.extent);

        var yBrush = d3.scale.linear()
        .range([paddedHeight,0]);

        yBrush.domain([d3.min(props.data, function(c) { return d3.min(c.values, function(v) { return v.y }); }),d3.max(props.data, function(c) { return d3.max(c.values, function(v) { return v.y }); })]);




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

    var yAxisBrush = d3.svg.axis()
        .scale(yBrush)
        .outerTickSize([3])
        .orient("right");

    if(props.plot != 'rank'){
      if(props.dataType != "raw" && props.graph != "newValues" && (props.graph.substr(-9)) != "composite" && props.graph != "inc"){
          yAxis.tickFormat(axisPercFormat);
      }
      else if(props.dataType != "raw" && props.graph == "inc"){
          yAxis.tickFormat(percFormat);         
      }    
      else{
        xAxis.ticks(x.domain()[1]-x.domain()[0])           
      }      
    }

    //Get rid of everything already in the svg
    d3.select("#" + (this.props.container || 'line') + "svg").selectAll("*").remove();

    //Create new svg
    var svg = d3.select("#" + (this.props.container || 'line') + " svg")
    .attr('viewBox','-90 -20 ' + (width) + ' ' + (height))

    filteredData.sort(function(a,b){
        return b.values[0].rank - a.values[0].rank
    })

    //For each city
    //Draws two lines, to create a colored line with a black border
    filteredData.forEach(function(b){
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

    //Guideline stuff
    var lineGroup = svg.append('g')
    lineGroup.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

    function showLine () {
      guideLine.attr('stroke', '#000')
      guideLine.attr('stroke-width', '2px')
    }

    function hideLine () {
      guideLine.attr('stroke', 'none')
    }

    function mousemove (d) {
      var xHere = x(d.x)
      guideLine.attr({
        x1: (xHere-margin.left),
        x2: (xHere-margin.left)
      })
    }

    var guideLine = lineGroup
      .selectAll('line')
      .data(['line'])

    guideLine.enter().append('line')
      .attr({
        y1: -margin.top,
        y2: (paddedHeight-margin.top),
        class: 'home-guide-line',
        stroke: 'none'
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
            .on("mousemove",mousemove)
            .on("click",click);




    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(-1," + (paddedHeight) + ")")
      .call(xAxis)
    .selectAll("text")  
      .style("text-anchor", "end")
      .attr("dx", "-.6em")
      .attr("dy", ".15em")
      .attr("transform", function() {
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
        if(props.plot == 'value'){
          if(props.title.substr(-9) !== 'composite'){
            return scope._labelFunction(props).split("by")[0]               
          }
          else{
            return "Composite Score"
          }      
        }
        else{
         return "Ranking"               
        }
      });
    if(! this.props.hideBrush) {
      svg.append("g")
        .attr("class", "y axis")
        .attr("transform","translate("+paddedWidth+",0)")
        .call(yAxisBrush)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", "-5em")
        .attr("dy", "2em")
        .attr("x","-15em") 


      var brush = d3.svg.brush()
          .y(yBrush)
          .extent(scope.state.extent)
          .on("brushstart", brushstart)
          .on("brush", brushmove)
          .on("brushend", brushend);


      var arc = d3.svg.arc()
          .outerRadius(15)
          .startAngle(0)
          .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

      var brushg = svg.append("g")
          .attr("class", "brush")
          .attr("transform", "translate("+(paddedWidth + 17)+",0)")
          .call(brush)
          .style("opacity",".4");  


      brushg.selectAll(".resize").append("path")
          .attr("transform", "translate("+(paddedHeight / 4) + ",0)")
          .attr("transform", "rotate(-90)")
          .attr("d", arc);

      brushg.selectAll(".resize").append("path")
          .attr("transform", "rotate(-90)")
          .attr("d", arc);

      brushg.selectAll("rect")
          .attr("transform","translate(-15,0)")
          .attr("width", (30));

      brushstart();
      brushmove();
  }
function brushstart() {

}

function brushmove() {

}

function brushend() {
    var s = brush.extent();
    if(scope.state.plot == "rank"){
        brush.extent([Math.round(s[1]),Math.round(s[0])])(d3.select(this));
        scope.setState({extent:[Math.round(s[0]),Math.round(s[1])]})                   
    }
    else{
        scope.setState({extent:[s[0],s[1]]})              
    }
}

    function mouseover(d) {
        props.onMouseover({id: d.city.key,year:d.x})
        showLine();
        d3.select(d.city.line).style("stroke-width",( (paddedHeight/(heightVal) )+2))
        d3.select(d.city.line).style("stroke","#000000")
        d3.select(d.city.line).style("opacity","2")

        var popText = "",
            name;

            name = d.city.name;
       
        if(props.plot == "rank"){
            popText += name + ' | ' + d.x +':  '+ d.rank;                    
        }
        else{
            if(props.dataType != "raw" && props.graph != "newValues" && (props.graph.substr(-9)) != "composite"){
                popText += name + ' | ' + d.x +':  '+ percFormat(d.y);
            }
            else{
                popText += name + ' | ' + d.x +':  '+ commaFormat(d.y);                        
            }
        }
       
        d.city.line.parentNode.appendChild(d.city.line);
        focus.attr("transform", "translate(-40,-20)");
        focus.select("text").text(popText);
    }

    function click(d){ 
        //console.log("d.city",d.city);
        scope._msaClick(d.city);
    }

    function mouseout(d) {       
        hideLine();                       
        d3.select(d.city.line).style("stroke-width",.5)
        d3.select(d.city.line).style("stroke",function(){return d.city.color})
        d3.select(d.city.line).style("opacity",".6")
        focus.attr("transform", "translate(-100,-100)");
    }
  }

  _labelFunction (props) {
    if(props.title == "densityshareofemploymentinnewfirms"){
      if(props.plot == "value"){
        if(props.dataType == "raw"){
          return "Number employed in new and young firms by year"
        }
        else{
          return "Share of employment in new and young firms by year"
        }             
      }
      else{
        if(props.dataType == "raw"){
          return "Metro Area Ranking for number employed in new and young firms by year"
        }
        else{
          return "Metro Area Ranking for share of employment in new and young firms by year"
        }                  
      }          
    }
    else if(props.title == "densitynewfirms"){
      if(props.plot == "value"){
        if(props.dataType == "raw"){
          return "Number of new and young firms by year"
        }
        else{
          return "Number of new and young firms per 1000 people by year"
        }             
      }
      else{
        if(props.dataType == "raw"){
          return "Metro Area Ranking for number of new and young firms by year"
        }
        else{
          return "Metro Area Ranking for new and young firms per 1000 people by year"
        }                  
      }          
    }
    else if (props.title == "densitycomposite"){
      if(props.plot == "value"){
          return "Composite density score by year"            
      }
      else{
          return "Metro Area Ranking for composite density score by year" 
      }          
    }
    else if(props.title == "fluiditynetmigration"){
      if(props.plot == "value"){
        if(props.dataType == "raw"){
          return "Net migration by year"
        }
        else{
          return "Net Migration as a percentage of total population by year"
        }             
      }
      else{
        if(props.dataType == "raw"){
          return "Metro Area Ranking for net migration by year"
        }
        else{
          return "Metro Area Ranking for net Migration as a percentage of total population by year"
        }                  
      }          
    }    
    else if(props.title == "fluiditytotalmigration"){
      if(props.plot == "value"){
        if(props.dataType == "raw"){
          return "Total Migration (inflow/outflow sum) by year"
        }
        else{
          return "Total Migration (inflow/outflow sum) as a percentage of total population by year"
        }             
      }
      else{
        if(props.dataType == "raw"){
          return "Metro Area Ranking for total Migration (inflow/outflow sum) by year"
        }
        else{
          return "Metro Area Ranking for total Migration (inflow/outflow sum) as a percentage of total population by year"
        }                  
      }          
    } 
    else if(props.title == "fluidityannualchurn"){
      if(props.plot == "value"){
        if(props.dataType == "raw"){
          return ""
        }
        else{
          return "Employment Turnover Rate as a percentage of total employment by year"
        }             
      }
      else{
        if(props.dataType == "raw"){
          return ""
        }
        else{
          return ""
        }                  
      }          
    } 
    else if(props.title == "irsInflowMigration"){
      if(props.plot == "value"){
        if(props.dataType == "raw"){
          return "Inflow Migration by year"
        }
        else{
          return "Inflow Migration as a percentage of total population by year"
        }             
      }
      else{
        if(props.dataType == "raw"){
          return "Metro Area Ranking for inflow Migration by year"
        }
        else{
          return "Metro Area Ranking for inflow Migration as a percentage of total population by year"
        }                  
      }          
    } 
    else if(props.title == "irsOutflowMigration"){
      if(props.plot == "value"){
        if(props.dataType == "raw"){
          return "Outflow Migration by year"
        }
        else{
          return "Outflow Migration as a percentage of total population by year"
        }             
      }
      else{
        if(props.dataType == "raw"){
          return "Metro Area Ranking for outflow Migration by year"
        }
        else{
          return "Metro Area Ranking for outflow Migration as a percentage of total population by year"
        }                  
      }          
    } 
    else if(props.title == "fluidityhighgrowthfirms"){
      if(props.plot == "value"){
        if(props.dataType == "raw"){
          return "Number of High Growth Firms by year"
        }
        else{
          return "Number of High Growth Firms as a percentage of total firms by year"
        }             
      }
      else{
        if(props.dataType == "raw"){
          return "Metro Area Ranking for number of High Growth Firms by year"
        }
        else{
          return "Metro Area Ranking for number of High Growth Firms as a percentage of total firms by year"
        }                  
      }          
    } 
    else if (props.title == "fluiditycomposite"){
      if(props.plot == "value"){
          return "Composite fluidity score by year"            
      }
      else{
          return "Metro Area Ranking for composite fluidity score by year" 
      }          
    }
    else if(props.title == "diversitypercentageofforeignbornpopulation"){
      if(props.plot == "value"){
        if(props.dataType == "raw"){
          return "Number of foreign born current residents by year"
        }
        else{
          return "Percentage of foreign-born residents by year"
        }             
      }
      else{
        if(props.dataType == "raw"){
          return "Metro Area Ranking for number of foreign born current residents by year"
        }
        else{
          return "Metro Area Ranking for number of foreign born current residents as a percentage of total population by year"
        }                  
      }          
    } 
    else if(props.title == "diversityemploymentlocationquotientvariance"){
      if(props.plot == "value"){
        if(props.dataType == "raw"){
          return ""
        }
        else{
          return "Location Quotient Variance by year"
        }             
      }
      else{
        if(props.dataType == "raw"){
          return "Metro Area Ranking for Location Quotient Variance by year"
        }
        else{
          return ""
        }                  
      }          
    } 
    else if(props.title == "diversityemploymenthhi"){
      if(props.plot == "value"){
        if(props.dataType == "raw"){
          return ""
        }
        else{
          return "Herfindahl-Hirschman Index (HHI) by year"
        }             
      }
      else{
        if(props.dataType == "raw"){
          return "Metro Area Ranking for Herfindahl-Hirschman Index (HHI) by year"
        }
        else{
          return ""
        }                  
      }          
    } 
    else if(props.title == "densityshareEmpNoAccRet"){
      if(props.plot == "value"){
        if(props.dataType == "raw"){
          return ""
        }
        else{
          return "% emp in non retail and accomodation sectors by year"
        }             
      }
      else{
        if(props.dataType == "raw"){
          return ""
        }
        else{
          return "Metro Area Ranking for % emp in non retail and accomodation sectors by year"
        }                  
      }          
    } 
    else if(props.title == "densityshareEmpHighTech"){
      if(props.plot == "value"){
        if(props.dataType == "raw"){
         return "" 
        }
        else{
          return "% emp in high tech sector by year"
        }             
      }
      else{
        if(props.dataType == "raw"){
          return "Metro Area Ranking for % emp in high tech sector by year"
        }
        else{
          return ""
        }                  
      }          
    } 
    else if (props.title == "diversitycomposite"){
      if(props.plot == "value"){
          return "Composite diversity score by year"            
      }
      else{
          return "Metro Area Ranking for composite diversity score by year" 
      }          
    }
    else if (props.title == "combinedcomposite"){
      if(props.plot == "value"){
          return "Composite combined score by year"            
      }
      else{
          return "Metro Area Ranking for composite combined score by year" 
      }          
    }
  }

  _resetBrush(){
    var newData = this._filterData(this.props);

    if(this.props.plot == "rank"){
      var extent = [0,d3.max(newData, function(c) { return d3.max(c.values, function(v) { return v.rank }); })]              
    }
    else{
      var extent = [d3.min(newData, function(c) { return d3.min(c.values, function(v) { return v.y }); }),d3.max(newData, function(c) { return d3.max(c.values, function(v) { return v.y }); })]                  
    }

   
    this.setState({extent:extent}) 
  }


  render () {
    var scope = this;

    return (
        <div className={classes['graphContainer']}>
            <div className={classes['title']}>
            </div>
            {this.props.hideBrush ? '' :
              <a onClick={this._resetBrush} type="button" className="btn btn-default pull-right">         
                Reset Brush   
              </a>
            }
            <div id={(this.props.container || 'line')} className={classes['svg-container']}>
              <svg className={classes['.svg-content-responsive']} preserveAspectRatio='xMinYMin meet'/>
            </div>
        </div>
    );          
  }
  
}

LineGraph.contextTypes = {
  router: React.PropTypes.object.isRequired
}
const mapStateToProps = (state) => ({
    metrosFull : state.metros
})

export default connect((mapStateToProps), {

})(LineGraph)
