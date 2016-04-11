"use strict"
import React from 'react'
import d3 from 'd3'
import topojson from 'topojson'

var backColor = "#DCDCDC",
    msaColor = "#7EC0EE";

export class NationalMap extends React.Component<void, Props, void> {
  
  componentDidMount (){
    this.renderGraph()
  }
  
  renderGraph () {
      let width = 960,
          height = 600;

      let projection = d3.geo.albersUsa()
          .scale(1000)
          .translate([width / 2.5, height / 2.5]);

      let path = d3.geo.path()
          .projection(projection);

      let svg = d3.select("#mapDiv").append("svg")
          .attr("width", width)
          .attr("height", height);

      d3.json('/us.json', function(err,us){
        console.log(Object.keys(us.objects))
        svg.append("path")
          .datum(topojson.feature(us,us["objects"]["states.geo"]))
          .style("fill",backColor)
          .attr("d", path);

        svg.insert("path", ".graticule")
              .datum(topojson.mesh(us,us["objects"]["states.geo"], function(a, b) { return a !== b; }))
              .style("fill", "none")
              .style("stroke","#fff")
              .attr("d", path);

        svg.selectAll("path", ".msa")
              .data(topojson.feature(us,us["objects"]["fixMsa.geo"]).features)
              .enter().append('path')
              .attr("class","msa")
              .attr("id",function(d){return "msa"+d.properties.id;})
              .style("fill", msaColor)
              .style("stroke","#fff")
              .attr("d", path)
              .on('click',click);
      })

      function click(d){
        this.props.click(d)
      }

    }
    render () {
        
        const legendStyle = {
          float:'left',
          width:'18%',
          height:'300px',
          boxShadow:'2px 2px' + backColor,
          paddingLeft:'10px',
          paddingTop:'2px',
          paddingRight:'10px',
          paddingBottom:'2px',
          marginLeft:'40px',
          marginRight:'200px',
          marginTop:'15px',
          background:backColor,
          color:"#black"
        }

        const headerStyle = {
          textAlign:'center',
          marginBottom:'0px',
          borderBottom:'2px solid black'
        }

        const contentStyle={
          marginTop:'5px'
        }

        return (
            <div>
                <div id="msaLegend" style={legendStyle}>
                  <div id="msaLegendHeader" style={headerStyle}><h4>Metropolitan Statistical Area</h4></div>
                  <div id="msaLegendContent" style={contentStyle}></div>
                </div>
                <div id="mapDiv"></div>
            </div>
                
        )
    }
}

export default  NationalMap
