import d3 from 'd3'
import d3Legend from 'd3-svg-legend'
export default {
  draw: function(id,graph,options) {
    if (!graph) throw 'no data provided';
    let width = options.w || 900
    let height = options.h || 500
    console.log('test',width,height)
    
    let distanceScale = d3.scale.linear()
    distanceScale.domain([
      d3.min(graph.links, d => { return +d.value }),
      d3.max(graph.links, d => { return +d.value })
    ])
    .range([0,1])

    let force = d3.layout.force()
      .gravity(1)
      .linkDistance(90)
      .charge(-1000)
      .linkStrength(function(d) {
        return distanceScale(d.value)
      })
      // .linkDistance(function(d){
      //   return 90
      // })
      .size([width, height]);

    d3.select(id).select("svg").remove();
  
    let svg = d3.select(id)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    console.log('bfore force', graph)
    force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();


    distanceScale.range([0.5,5])
    let link = svg.selectAll(".link")
      .data(graph.links)
    .enter().append("line")
      .attr("class", "link")
      .style('stroke', '#999')
      .style("stroke-width", function(d) { return distanceScale(d.value) });

    

    // ---------- size and color Scales ---------
    let sizeScale = d3.scale.linear()
    sizeScale
      .domain([0.01,4])
      .range([5,30])

    let color = d3.scale.quantile()
      .domain( graph.nodes.map((d) => {return d.empShare}).sort())
      .range(["#f1eef6", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#034e7b"]) 
    // ---------- --------------------- ---------
    let w =  width - (60*color.quantiles().length)
    let h =  height - 36
    console.log('test width', w)
    
    let circleLegend = svg.append("g")
      .attr("transform", "translate(" + (40) + "," + (h-20) + ")")
      .attr("class", "legend")
      .append('g')
    
    var legendSize = d3.legend.size()
      .scale(sizeScale)
      .shape('circle')
      .shapePadding(15)
      .labelOffset(20)
      .labelFormat(d3.format(".02f"))
      .orient('horizontal');

    circleLegend
      .call(legendSize);

    circleLegend
      .append('text')
      .attr("dx", 124)
      .attr("dy", -40)
      .text( 'Employment Quotient')


    let legend = svg.append("g")
      .attr("transform", "translate(" + w + "," + h + ")")
      .attr("class", "legend")
      .append('g')
    
    legend
      .append('text')
      .attr("dx", 204)
      .attr("dy", ".35em")
      .text( 'Share of Employment')

    let legendCells = legend
      .selectAll('.legendCells')
      .data(color.quantiles())
      .enter()
      

    legendCells
      .append('rect')
      .attr("height", 15)
      .attr("width", 60)
      .attr("transform", function(d,i) {return "translate(" + (i * 60) + ",24)" })
      .attr('fill', function(d) {return color(d)} )
      

    legendCells
      .append('text')
      .attr("transform", function(d,i) {return "translate(" + (i * 60) + ",16)" })
      .attr("dx", 4)
      .attr("dy", ".35em")
      .style('font-size', '10px')
      .text(function(d) {
        return (d*100).toFixed(2) + '%'
      })

    let node = svg.selectAll(".node")
      .data(graph.nodes)
    .enter()
      .append("g")
      .attr("class", "node")

    node.append('circle')
      .attr("r", d => {
        return sizeScale(d.emp_quot*100)
      })
      .style("fill", function(d,i) { return color(d.empShare); })
      .call(force.drag);

    node.append("text")
      .attr("dx", 4)
      .attr("dy", ".35em")
      .text(function(d) { return d.cluster_name });

    force.on("tick", function() {
      link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      // node
      //   .attr("cx", function(d) { return d.x; })
      //   .attr("cy", function(d) { return d.y; });
      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    });
  }
}
