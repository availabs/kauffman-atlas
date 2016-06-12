"use strict"
import React from 'react'
import d3 from 'd3'
import { connect } from 'react-redux'
import classes from '../../components/maps/NationalMap.scss'
import { withRouter } from 'react-router'

export class BarChart extends React.Component<void, Props, void> {

    constructor () {
        super()

        this._renderGraph = this._renderGraph.bind(this)
        this._labelFunction = this._labelFunction.bind(this)
        this._msaClick = this._msaClick.bind(this)
    }

      componentDidMount () {
          this._renderGraph(this.props);
      }

      componentWillReceiveProps (nextProps) {
        if(this.props.title !== nextProps.title || this.props.graph !== nextProps.graph || this._metroChange(this.props.metros,nextProps.metros)){
          this._renderGraph(nextProps);
        }
      }

      _metroChange (oldMetros,newMetros){
        if(oldMetros.length == newMetros.length){
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
        this.context.router.push('/metro/'+d.key+'/combined');   
    }

    _renderGraph (props) {
        var percFormat = d3.format("%");
        var scope = this;

    	var data = props.data;

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

        //Need to add a circular reference to each value
        data.forEach(metro => {
            var city = metro;

            metro.values.forEach(yearValue => {
              yearValue.city = city;
            })

        })

        if(props.graph != "opportunity"){
            //Sort data so bar chart descends
            data.sort(function(a,b){
              return b.values[(b.values.length-1)].y - a.values[(a.values.length-1)].y
            })
            var filteredData = data;
        }
        else{
            //Sort data so bar chart descends
            if(props.dataType != "composite"){
                data.sort(function(a,b){
                    var aVal,
                        bVal;

                    a.values.forEach(function(val){
                        if(val.x == props.dataType){
                            aVal = val.y;
                        }
                    })
                    b.values.forEach(function(val){
                        if(val.x == props.dataType){
                            bVal = val.y;
                        }
                    })

                    if(aVal<=bVal){
                        return 1;
                    }
                    else if(aVal>bVal){
                        return -1;
                    }
                    else{
                        return 0;
                    }
                })                
            }

            //Trim data so that each city only has the values for the current selected metric
            var trimmedData = data.map(function(metroArea){
                var values = [];
                var filteredMetro = {
                    "key":metroArea.key,
                    "name":metroArea.name,
                    "values":null
                };

                filteredMetro.values = metroArea.values.filter(function(value){
                    if(props.dataType == "composite"){
                        return value;
                    }
                    else{
                        if(value.x == props.dataType){
                            return value;
                        }
                    }
                })
                return filteredMetro;
            })   

            //Make sure the cities we are using have the selected dataset
            var filteredData = trimmedData.filter(metroArea => {
                if(props.dataType == "composite"){
                    if(metroArea.values[0].y == null || metroArea.values[1].y == null){
                        return false;
                    }
                    else{
                        return true;
                    }
                }
                else{
                    if(metroArea.values[0] == null){
                        return false;
                    }
                    else{
                        return true;
                    }                
                }
            })          
        }

        var margin = {top: 0, right: -0, bottom: 0, left: -0},
            width = document.getElementById("mapDiv").offsetWidth,
            height = width*.5;

		var x = d3.scale.ordinal()
		    .rangeBands([0, width], .5,1);

		var y = d3.scale.linear()
		    .range([height, 0]);

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom")
            .tickValues([]);

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
            .ticks(20)
            .tickFormat(percFormat);
		    
        var voronoi = d3.geom.voronoi()
            .x(function(d) { return x(d.city.key); })
            .y(function(d) { return y(d.y); })
            .clipExtent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]])

        //Remove everything currently in the svg
        d3.select("#barChart svg").selectAll("*").remove();

        //Make a new svg
        var svg = d3.select("#barChart svg")
            .attr('viewBox','-90 -10 ' + (width+110) + ' ' + (height+60))

		x.domain(filteredData.map(function(d) { return +d.key; }));
        y.domain([d3.min(filteredData, function(d) { return d['values'][(d.values.length-1)]['y']; }), d3.max(filteredData, function(d) { return d['values'][(d.values.length-1)]['y'] })]);
    

		svg.append("g")
		    .attr("class", "x axis")
		    .attr("transform", "translate(0," + height + ")")
		    .call(xAxis)
                .selectAll("text")  
                .style("display", "none");

		svg.append("g")
		    .attr("class", "y axis")
		    .call(yAxis)
		      .append("text")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", "-3.5em")
		      .style("text-anchor", "end")
		      .text(function(){
                return "Percent Income Gain/loss"
              });

        data.sort(function(a,b){
            return b.values[2].rank - a.values[2].rank
        })


        data.forEach(function(b,i){
            svg.append("g")
                .append("rect")
                    .on("mouseover", mouseover.bind(null,b))
                    .on("mouseout", mouseout.bind(null,b))
                    .on("click",click.bind(null,b))
                    .attr("class",function(){return "metroArea" + b.key})
                    .attr("transform",function(){ return "translate(" + x(b.key) + ",0)";})
                    .attr("id",function(){b.rect = this; return "metroArea"+ b.key + "combined";})
                    .attr("width",x.rangeBand())
                    .attr("x",function(){return x.rangeBand(b.key)})
                    .attr("y",function(){ if(y(b.values[2].y) == height){return height-5} else{return y(b.values[2].y);}})
                    .attr("height",function(){if(y(b.values[2].y) == height){return 5} else{return height- y(b.values[2].y);}})
                    .style("fill",function(){
                        return b.color;
                    })                     
        })


        //Focus is the hover popup text
        var focus = svg.append("g")
            .attr("transform", "translate(-100,-100)")
            .attr("class", "focus");

        focus.append("text")
        .attr("y", 10)
        .style("font-size",".75em");

        function mouseover(d) {
            props.onMouseover({id: d.key})               

            var name = d.name;
            var popText = "Name: " + name
            popText += " | " + d.values[2].y;

            focus.attr("transform", "translate(10,-5)");
            focus.select("text").text(popText);            
       
            var rect = d3.select(d.rect);
            rect.attr("width",(x.rangeBand()*2));
        }

        function click(d){ 
            scope._msaClick(d) 
        }

        function mouseout(d) {                         
            var rect = d3.select(d.rect);

            rect.attr("width",(x.rangeBand()));     
            rect.style("fill",function(){return d.color})    
        }
    }
    _labelFunction () {
        return "Income gain/loss relative to parental income by metro area"

    }
    render () {
    	var scope = this;

        return (
        <div className={classes['graphContainer']}>
            <div className={classes['title']}>
              <h4>{this._labelFunction(this.props)}</h4>
            </div>
            <div id="barChart" className={classes['svg-container']}>
              <svg className={classes['.svg-content-responsive']} preserveAspectRatio='xMinYMin meet'/>
            </div>
        </div>
    );           
    }
}
BarChart.contextTypes = {
  router: React.PropTypes.object.isRequired
}
const mapStateToProps = (state) => ({

})

export default connect((mapStateToProps), {

})(BarChart)