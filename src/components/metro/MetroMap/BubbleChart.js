var colors = require('./ColorScale');

module.exports = {
	initialized:false,
	rScale: d3.scale.pow().exponent(.5).domain([1,1000]).range([1,10]),
	clusters:[],
	
	renderBubbleChart:function(data,inWidth,inHeight,centroids,options,naicsLib){
		//console.log('renderBubbleChart1',options)

		var nodes = this.createNodes(this.getCircleArray(data,naicsLib),inWidth,inHeight,centroids,options,naicsLib);
		//console.log('renderBubbleChart2',nodes)
		this.drawChart(nodes,naicsLib)
	},

	 getCircleArray(data,naicsLib) {
        let scope = this,
            circleArray = [];

        circleArray = Object.keys(data).map((zipKey) => {
            return Object.keys(data[zipKey]).map((naicsKey) => {
                return Object.keys(data[zipKey][naicsKey]).map((sizeKey) => {
                    let cluster = naicsKey.substr(0, 2);
                    if(cluster !== "--" && naicsLib[cluster].part_of_range) {
                        cluster = naicsLib[cluster].part_of_range;
                    }

                    return {
                        cluster,
                        naics: naicsKey,
                        size: sizeKey.split("-")[0],
                        radius: sizeKey.split("-")[0],
                        count: +data[zipKey][naicsKey][sizeKey],
                        zip: zipKey
                    };
                });
            });
        });

        let flat1 = [],
            flat2 = [],
            flat3 = [];

        flat1 = flat1.concat.apply(flat1, circleArray);
        flat2 = flat2.concat.apply(flat2, flat1);

        circleArray = circleArray.map((d) => {
            let output = []
            for(let i = 0;i < d.count;i++){
                output.push(d);
            }
            return output;
        });

        flat3 = flat3.concat.apply(flat2, circleArray);

        circleArray = flat3.filter((d) => {
            return d.radius !== "total" && d.count > 0 && d.naics.substr(0,2) !== "--";
        });

        circleArray = circleArray.map((d) => {
            if(d.radius === "1000+"){
                d.radius = 1000;
            }
            return d;
        });
        //console.log("num establishments:",circleArray.length)
        return circleArray;
    },

	createNodes:function(data,inWidth,inHeight,centroids,options,naicsLib){
		//console.log('createNodes0')
		var scope = this;

		if(data.length <= 0){ return [] }
		var width = inWidth || 600,
	    height = inHeight || 600;
	    //console.log('createNodes',data.length)
		
		this.clusters = {};

		var nodes = data.map(function(n) {
			var d = {cluster: n.cluster,zip:n.zip,naics:n.naics,size:+n.radius};
		 	if (!scope.clusters[d.cluster] || (d.size > scope.clusters[d.cluster].size)) scope.clusters[d.cluster] = d;
		  	return d;
		});

		if(options.naics.depth === 1){
			nodes = nodes.filter(function(d){
				return d.cluster === options.naics.code;
			})
		}else if(options.naics.depth > 1){
			nodes = nodes.filter(function(d){
				return d.naics.substr(0,options.naics.code.length) === options.naics.code;
			})
		}

		console.log('nodes.length',nodes.length)
		this.rScale = nodes.length > 10000 ? 
			d3.scale.pow().exponent(.5).domain([1,1000]).range([1,10]) : 
			d3.scale.pow().exponent(.5).domain([1,1000]).range([1,12]);

		var mode = options.mode || 'cluster';
		//console.log(mode,options)
		var nestedNodes = [];
		if(mode === 'cluster'){
			var currWidth = width,
				currHeight = height;

			if(options.naics.depth >= 1){
				currHeight = height/(4*options.naics.depth);
				currWidth = height/(4*options.naics.depth);
				nestedNodes = d3.nest()
			      	.key(function(d) { return d.cluster })//
						//.key(function(d) { return d.cluster })
						//.rollup(function(d) { return { values:d.length, radius:d.length })
					.key(function(d) { return d.naics.substr(0,4); })
			      	.entries(nodes)

			}else{
				nestedNodes = d3.nest()
			      	.key(function(d) { return d.cluster })//
			      	.entries(nodes)
			}

			d3.layout.pack()
		    .sort(function(a,b){return b.naics - a.naics})
		    .size([currWidth, currHeight])
		    .children(function(d,i) {
		    	return d.values; 
		    })
		    .value(function(d){return scope.rScale(d.size) * scope.rScale(d.size); })
		    .nodes({values:nestedNodes });

		    if(options.naics.depth > 0){
		    	var center = [width/2,height/2],
		    		diff = {};

		    	nestedNodes.forEach(function(d){
				//console.log('ss',[centroids[d.key][0] - d.x,centroids[d.key][1] - d.y ])
					diff[d.key] = [center[0] - d.x,center[1] - d.y ]

				})

				nodes.forEach(function(n){
					n.x += diff[n.cluster][0];
					n.y += diff[n.cluster][1];
				})
			}
		}else if(mode === 'zips'){
			
			var diff = {}
			nestedNodes = d3.nest()
	      		.key(function(d) { return d.zip })//
				.entries(nodes)

			d3.layout.pack()
		    .sort(function(a,b){return b.naics - a.naics})
		    .size([width, height])
		    .children(function(d,i) {
		    	return d.values; 
		    })
		    .value(function(d){return scope.rScale(d.size) * scope.rScale(d.size); })
		    .nodes({values:nestedNodes });
	

			nestedNodes.forEach(function(d){
				//console.log('ss',[centroids[d.key][0] - d.x,centroids[d.key][1] - d.y ])
				if( !centroids[d.key] ){
				
					console.log( 'invalid key', d.key, centroids[d.key] );
				
				}else{
					
					diff[d.key] = [centroids[d.key][0] - d.x,centroids[d.key][1] - d.y ];
				
				}

			})

			nodes.forEach(function(n){
				if(diff[n.zip]){
					n.x += diff[n.zip][0];
					n.y += diff[n.zip][1];
				}
			})
		
		}
		return nodes;
	},


	drawChart:function(nodes,naicsLib){
		var svg = d3.select("#circle_group"),
			scope = this;
		
		var node = svg.selectAll("circle")
		    .data(nodes);


		node.transition()
			//.duration(750)
			.style("fill", function(d) { return colors.getColor(d.naics, naicsLib) })
			.attr('class',function(d){
		    	return 'n2_'+d.cluster+' n4_'+d.naics.substr(0,4)+' n6_'+d.naics;
		    })
			.attr('cx',function(d){
		    	return d.x
		    })
		    .attr('cy',function(d){
		    	return d.y
		    })
		    .attr('r',function(d){
		    	return scope.rScale(d.size);
		    })
		    

		node.enter().append("circle")
		    .style("fill", function(d) { return colors.getColor(d.naics, naicsLib) })
		    .attr('class',function(d){
		    	return 'n2_'+d.cluster+' n4_'+d.naics.substr(0,4)+' n6_'+d.naics;
		    })
		    .attr('cx',function(d){
		    	return d.x
		    })
		    .attr('cy',function(d){
		    	return d.y
		    })
		    .attr('r',function(d){
		    	return scope.rScale(d.size);
		    })
		    .on('mouseover',function(d,i){
		    	var el = d3.select(this);
		    	var xpos = Number(el.attr('cx'))+10
     	 		var ypos = (el.attr('cy') - scope.rScale(d.size) - 10)
     	 		el.style("stroke","#000").style("stroke-width",3);
		    	d3.select("#nytg-tooltip").style('top',ypos+"px").style('left',xpos+"px").style('display','block') 
	          	d3.select("#nytg-tooltip .nytg-name").html(
	          		'<strong>'+d.zip+'</strong><br>'+
	          		d.naics+' - '+naicsLib[d.naics].title
	          	)
	          	//d3.select("#nytg-tooltip .nytg-discretion").text(that.discretionFormat(d.discretion))
	          	d3.select("#nytg-tooltip .nytg-department").text(naicsLib[d.cluster].title)
	          	d3.select("#nytg-tooltip .nytg-value").html(d.size)
				    	
		    })
		    .on('mouseout',function(){
		    	var el = d3.select(this);
		    	el.style("stroke","#000").style("stroke-width",0);
		    	d3.select("#nytg-tooltip").style('display','none');
		    })
		    
		node.exit()
	      .attr("class", "exit")
	    .transition()
	      //.duration(750)
	      //.attr('r',0)
	      //.style("fill-opacity", 1e-6)
	      .remove();
		// node.transition()
		//     .duration(750)
		//     .delay(function(d, i) { return i/10; })
		//     .attrTween("r", function(d) {
		//       var i = d3.interpolate(0, d.radius);
		//       return function(t) { return d.radius = i(t); };
		//     });
		
	},
	
	drawLegends:function(data){
		var svg = d3.select("#circleLegend");
		

		svg.append("g")
		  .attr("class", "legendSize")
		  .attr("transform", "translate(10,20)");

		var legendSize = d3.legend.size()
		  .scale(d3.scale.pow().exponent(.5).domain([1,1000]).range([1,10]))
		  .shape('circle')
		  .shapePadding(15)
		  .labelOffset(20)
		  .orient('horizontal');

		svg.select(".legendSize")
		  .call(legendSize);

	}
}