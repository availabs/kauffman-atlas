"use strict"
import React from 'react'
import d3 from 'd3'
import { connect } from 'react-redux'
import classes from '../../components/maps/NationalMap.scss'

export class BarChart extends React.Component<void, Props, void> {

    constructor () {
        super()
        // this.props = {
        //   data:[],
        //   plot:"rank",
        //   dataType:"raw",
        //   title:"",
        //   graph:"composite"
        // }
        this._renderGraph = this._renderGraph.bind(this)
    }

    componentWillMount () {
        console.log("comp will mount barchart")
    }
    componentDidMount () {
        console.log("barchartmount");
        this._renderGraph();
    }

    _renderGraph () {
        console.log("bar_rendergraph");
        var percFormat = d3.format(".3%");
        var scope = this;

        var compColor = d3.scale.ordinal()
            .domain(["lowIncome","highIncome"])
            .range(['red','green']);



    	var data = scope.props.data;

        if(scope.props.dataType != "composite"){
            data.sort(function(a,b){
                var aVal,
                    bVal;

                a.values.forEach(function(val){
                    if(val.x == scope.props.dataType){
                        aVal = val.y;
                    }
                })
                b.values.forEach(function(val){
                    if(val.x == scope.props.dataType){
                        bVal = val.y;
                    }
                })

                if(aVal<bVal){
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

        var filteredData = data.map(function(metroArea){

            var values = [];

            var filteredMetro = {
                "key":metroArea.key,
                "name":metroArea.name,
                "values":null
            };

            filteredMetro.values = metroArea.values.filter(function(value){
                if(scope.props.dataType == "composite"){
                    return value;
                }
                else{
                    if(value.x == scope.props.dataType){
                        return value;
                    }
                }
            })

            return filteredMetro;
        })

        console.log("data",data);
        console.log("filtered",filteredData);

        var margin = {top: 0, right: 40, bottom: 0, left: 55},
            width = window.innerWidth*.98 - margin.left - margin.right,
            height = window.innerHeight*.95 - margin.top - margin.bottom;

		var x0 = d3.scale.ordinal()
		    .rangeBands([0, width], .5,1);

        var x1 = d3.scale.ordinal();

		var y = d3.scale.linear()
		    .range([height, 0]);

		var xAxis = d3.svg.axis()
		    .scale(x0)
		    .orient("bottom")
            .tickValues([]);

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		    .ticks(20, "%");

        var voronoi = d3.geom.voronoi()
            .x(function(d) { return x0(d.city.key); })
            .y(function(d) { return y(d.y); })
            .clipExtent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]])

          d3.select("#barChart svg").selectAll("*").remove();

          var svg = d3.select("#barChart svg")
          .attr('viewBox','-90 -10 ' + (width) + ' ' + (height+60))

		x0.domain(filteredData.map(function(d) { return +d.key; }));
        x1.domain(['lowIncome','highIncome']).rangeRoundBands([0,x0.rangeBand()]);
		y.domain([d3.min(filteredData, function(d) { return d['values'][0]['y']; }), d3.max(filteredData, function(d) { return d['values'][0]['y']; })]);

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
		      .text("Percent Income Gain/loss");


        var metroArea = svg.selectAll(".metroArea")
              .data(filteredData)
            .enter().append("g")
              .attr("class","metroArea")
              .attr("transform",function(d){ return "translate(" + x0(d.key) + ",0)";});



        metroArea.selectAll("rect")
              .data(function(d){ return d.values;})
            .enter().append("rect")
              .attr("id",function(d){return "metroArea"+ d.city.key + d.x;})
              .attr("width",x1.rangeBand())
              .attr("x",function(d){ return x1(d.x);})
              .attr("y",function(d){ return y(d.y);})
              .attr("height",function(d){return height- y(d.y);})
              .style("fill",function(d){
                if(scope.props.dataType == "composite"){ 
                    return compColor(d.x);
                }
                else{
                    return d.color;
                }
              })    



        var focus = svg.append("g")
              .attr("transform", "translate(-100,-100)")
              .attr("class", "focus");


            focus.append("text")
              .attr("y", -10)
              .style("font-weight","bold");

        var voronoiGroup = svg.append("g")
              .attr("class", "voronoi")
              .style("fill","#FFFFFF")
              .style("stroke","#000000")
              .style("opacity","0")

        voronoiGroup.selectAll("path")
                .data(voronoi(d3.nest()
                    .key(function(d) {return (x0(d.city.key) + x1(d.x)) + "," + y(d.y); })
                    .rollup(function(v) { return v[0]; })
                    .entries(d3.merge(filteredData.map(function(d) { return d.values; })) )
                    .map(function(d) { return d.values; })))
            .enter().append("path")
                .attr("d", function(d) { if(d!=undefined){return "M" + d.join("L") + "Z"}; })
                .datum(function(d) { if(d!=undefined){return d.point}; })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout)
                .on("click",click);
    
        function mouseover(d) {
            var popText = "",
                name;
            name = d.city.name;
       
            var rect = d3.select("#metroArea"+d.city.key+d.x);

            rect.style("fill","#000000");
            rect.attr("width",(x1.rangeBand()*5));
            popText = "Name: " + name

            if(scope.props.dataType == "composite" || scope.props.dataType == "highIncome"){
                popText += " High Income: " + percFormat(d.city.values[1].y)
            }
            if(scope.props.dataType == "composite" || scope.props.dataType == "lowIncome"){
                popText += " Low Income: " + percFormat(d.city.values[0].y);
            }


            focus.attr("transform", "translate(100,-25)");
            focus.select("text").text(popText);
        }

        function click(d){ 
            console.log("d.city",d.city);
        }


        function mouseout(d) {                          
            var rect = d3.select("#metroArea"+d.city.key+d.x);
            if(scope.props.dataType == "composite"){
                rect.style("fill",function(){return compColor(d.x);})
            }
            else{
                rect.style("fill",function(){return d.color})                        
            }
            
            rect.attr("width",(x1.rangeBand()));
        }
    }

    render () {
    	var scope = this;

    	console.log("bargraph",scope);
        this._renderGraph();
        return (
            <div className={classes['graphContainer']}>
                <div className={classes['title']}>

                </div>
                <div id="barChart" className={classes['svg-container']}>
                  <svg className={classes['.svg-content-responsive']} preserveAspectRatio='xMinYMin meet'/>
                </div>
            </div>
        );            
    }

}

const mapStateToProps = (state) => ({

})

export default connect((mapStateToProps), {

})(BarChart)