/*global d3:true*/
/*eslint no-undef: 2*/
import _ from 'lodash'

var UNIQUE_CLIP_ID = 0

module.exports = function () {
  let data = []
  let clipId = ++UNIQUE_CLIP_ID
  let svg = null
  let svgNode = null
  let width = 250
  let height = 250
  let xScale = d3.scale.linear()
  let xScaleType = 'linear'
  let yScale = d3.scale.linear()
  let graphGroup = null
  let pointsGroup = null
  let margin = { left: 25, bottom: 20, top: 10, right: 10 }
  let xAxis = d3.svg.axis()
    .orient('bottom')
    .tickFormat(function (d) { return d })
    .ticks(6)
    .tickSize(0, 0)
    .scale(xScale)
  let yAxis = d3.svg.axis()
    .tickFormat(d3.format('d'))
    .ticks(6)
    .tickSize(0, 0)
    .orient('left')
    .scale(yScale)
  let xAxisGroup = null
  let yAxisGroup = null
  let xGridGroup = null
  let YGridGroup = null
  let showX = false
  let showY = true
  let showGrid = true
  let line = d3.svg.line()
    .defined(function () { return true })
    .x(function (d, i) { return xScale(xAccessor(d, i)) })
    .y(function (d, i) { return yScale(yAccessor(d, i)) })
  let attr = {}
  let voronoi = d3.geom.voronoi()
    .x(function (d) { return xScale(d.x) })
    .y(function (d) { return yScale(d.y) })
  let voronoiGroup = null
  let mouseover = null
  let mousemove = null
  let mouseout = null
  let click = null
  let guideLine = null
  let showGuideLine = true
  let lineGroup = null
  let tickPadding = 0
  let showVoronoi = true
  let xDomain = linearDomain
  let autoResize = false
  let transitionTime = 250
  let plotPoints = false
  let pointAttr = {}
  let mouseListener = null 
  function showLine () {
    if (showGuideLine) {
      guideLine.attr('stroke', '#000')
    }
  }

  function hideLine () {
    guideLine.attr('stroke', 'none')
  }

  let xAccessor = xAccessorDefault
  let yAccessor = yAccessorDefault
  let getValues = getValuesDefault

  function timeDomain (d) { return d3.extent(_.flatMap(d, x => [_.first(x.values).key, _.last(x.values).key])) }
  function linearDomain (d) { return [0, d.length ? getValues(d[0]).length - 1 : 1] }
  function ordinalDomain (d) { return d.length ? getValues(d[0]).map(function (d, i) { return xAccessor(d, i) }) : [] }

  function xAccessorDefault (d) { return d.values.x }
  function yAccessorDefault (d) { return d.values.y }
  function getValuesDefault (d) { return d.values }

  function make_x_axis () { return d3.svg.axis().scale(xScale).orient('bottom').ticks(5) }

  function make_y_axis () { return d3.svg.axis().scale(yScale).orient('left').ticks(5) }

  function graph (selection) {
    if (selection) {
      svg = selection
      svg.append('defs').append('clipPath')
        .attr('id', 'clip-' + clipId)
        .append('rect')
        .attr('width', width)
        .attr('height', height)

      svgNode = selection.node()
      pointsGroup = svg.append('g')
      graphGroup = svg.append('g')
      lineGroup = svg.append('g')
      xAxisGroup = svg.append('g')
       .attr({ class: 'x axis' })
      yAxisGroup = svg.append('g')
       .attr({ class: 'y axis' })
      xGridGroup = svg.append('g')
        .attr('class', 'grid')
      YGridGroup = svg.append('g')
        .attr('class', 'grid')
      voronoiGroup = svg.append('g')
        .attr('class', 'voronoi-group')
      voronoiGroup.on({
        mouseover: showLine,
        mouseout: hideLine
      })
      graphGroup.attr('clip-path', 'url(#clip-' + clipId + ')')
      xAxisGroup.attr('class', 'x axis')
      yAxisGroup.attr('class', 'y axis')
      return
    }

    if (autoResize) { resize() }

    pointsGroup.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
    graphGroup.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
    xAxisGroup.attr('transform', 'translate(' + margin.left + ', ' + (height - margin.bottom) + ')')
    yAxisGroup.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
    voronoiGroup.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
    lineGroup.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

    let wdth = width - margin.left - margin.right
    let hght = height - margin.top - margin.bottom

    d3.select('#clip-' + clipId + ' rect')
      .attr('width', wdth)
      .attr('height', hght)

    guideLine = lineGroup
      .selectAll('line')
      .data(['line'])

    guideLine.enter().append('line')
      .attr({
        y1: 0,
        y2: hght,
        class: 'npmrds-guide-line',
        stroke: 'none'
      })

    xScale.domain(typeof xDomain === 'function' ? xDomain(data) : xDomain)
    if (xScaleType === 'ordinal') {
      xScale.rangePoints([0, wdth], tickPadding)
    } else {
      xScale.range([0, wdth])
    }

    var extent = d3.extent(d3.merge(data.map((d) => {
      return d3.extent(getValues(d).filter(line.defined()), function (d, i) { return yAccessor(d, i) })
    })))

    if(yScale.domain()[0] == 0){
      yScale.range([hght, 0])
            .domain([extent[0] - extent[0] * 0.05, extent[1] + extent[0] * 0.05])
    }

    if (showX) {
      if (transitionTime) {
        xAxisGroup.transition()
          .delay(transitionTime)
          .call(xAxis)
      } else {
        xAxisGroup.call(xAxis)
      }
    }
    if (showY) {
      if (transitionTime) {
        yAxisGroup.transition()
          .delay(transitionTime)
          .call(yAxis)
      } else {
        yAxisGroup.call(yAxis)
      }
    }
    if (showGrid) {
      xGridGroup
      .attr('transform', 'translate(' + margin.left + ',' + hght + ')')
      .call(make_x_axis()
        .tickSize(-hght, 0, 0)
        .tickFormat('')
      )

      YGridGroup
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .call(make_y_axis()
        .tickSize(-wdth, 0, 0)
        .tickFormat('')
      )
    }
    var lines = graphGroup.selectAll('path')
      .data(data)
    lines.exit().remove()
    lines.enter().append('path')
      .attr({
        opacity: 0.8,
        fill: 'none',
        'stroke-linejoin': 'round',
      })
    lines.attr(attr)
    lines.attr('stroke-width', (d) => {
      return d.strokeWidth || 3
    })
    lines.attr('stroke', (d) => {
      return d.color || '#000'
    })
    lines.attr('stroke-dasharray', (d) => d.filledValue ? "2,2" : "")

    if (transitionTime) {
      lines.transition().delay(transitionTime)
      .attr('d', function (d) { return line(getValues(d)) })
    } else {
      lines.attr('d', function (d) { return line(getValues(d)) })
    }

    if (showVoronoi) {
      voronoi.clipExtent([[0, 0], [wdth, hght]])
      var points = []
      lines.each(function (line) {
        getValues(line).forEach(function (d, i) {
          points.push({
            line: this,
            x: xAccessor(d, i),
            y: yAccessor(d, i),
            key: line.key
          })
        }, this)
      })
      var vPoints = voronoi(points).filter(function (d) { return d && d.length })
      var vLines = voronoiGroup.selectAll('path')
        .data(vPoints)
      vLines.exit().remove()
      vLines.enter().append('path')
      vLines.attr({
        fill: 'none',
        stroke: 'none',
        'pointer-events': 'all',
        d: function (d) { return 'M' + d.join('L') + 'Z' }
      })
      .on({
        mouseover: __mouseover,
        mousemove: __mousemove,
        mouseout: mouseout,
        click: click
      })
    }

    if (plotPoints) {
      points = []
      lines.each(function (line) {
        getValues(line).forEach(function (d, i) {
          points.push({
            line: this,
            x: xAccessor(d, i),
            y: yAccessor(d, i),
            key: line.key
          })
        }, this)
      })
      points = pointsGroup
        .selectAll('circle').data(points)// function(d) { return d.values.filter(line.defined()) })
      points.exit().remove()
      points.enter().append('circle')
        .attr({
          r: 1,
          fill: '#000',
          stroke: 'none'
        })
      points.attr(pointAttr)
      points.transition().delay(transitionTime).attr({
        cx: function (d, i) { return xScale(d.x) },
        cy: function (d, i) { return yScale(d.y) }
      })
    }
  }
  graph.xScaleType = function (t) {
    if (!arguments.length) {
      return xScaleType
    }
    xScaleType = t
    if (xScaleType === 'ordinal') {
      xScale = d3.scale.ordinal()
      xDomain = ordinalDomain
    } else if (xScaleType === 'time') {
      xScale = d3.time.scale()
      xDomain = timeDomain 
    } else {
      xScale = d3.scale.linear()
      xDomain = linearDomain
    }
    xAxis.scale(xScale)
    return graph
  }
  graph.plotPoints = function (pp) {
    if (!arguments.length) {
      return plotPoints
    }
    plotPoints = pp
    return graph
  }
  graph.pointAttr = function (a) {
    if (!arguments.length) {
      return pointAttr
    }
    for (var key in a) {
      pointAttr[key] = a[key]
    }
    return graph
  }
  graph.autoResize = function (b) {
    if (!arguments.length) {
      return autoResize
    }
    if (autoResize && !b) {
      window.removeEventListener('resize', resize)
    } else if (!autoResize && b) {
      window.addEventListener('resize', resize)
    }
    autoResize = b
    return graph
  }
  graph.defined = function (d) {
    if (!arguments.length) {
      return line.defined()
    }
    line.defined(d)
    return graph
  }
  graph.transitionTime = function (t) {
    if (!arguments.length) {
      return transitionTime
    }
    transitionTime = t
    return graph
  }
  graph.xFormat = function (x) {
    if (!arguments.length) {
      return xAxis.tickFormat()
    }
    xAxis.tickFormat(x)
    return graph
  }
  graph.xTickValues = function (x) {
    if (!arguments.length) {
      return xAxis.tickValues()
    }
    xAxis.tickValues(x)
    return graph
  }
  graph.yFormat = function (y) {
    if (!arguments.length) {
      return yAxis.tickFormat()
    }
    yAxis.tickFormat(y)
    return graph
  }
  graph.showVoronoi = function (v) {
    if (!arguments.length) {
      return showVoronoi
    }
    showVoronoi = v
    return graph
  }
  graph.guideLine = function (b) {
    if (!arguments.length) {
      return showGuideLine
    }
    showGuideLine = b
    return graph
  }
  graph.showX = function (b) {
    if (!arguments.length) {
      return showX
    }
    showX = b
    return graph
  }
  graph.showY = function (b) {
    if (!arguments.length) {
      return showY
    }
    showY = b
    return graph
  }
  graph.showGrid = function (b) {
    if (!arguments.length) {
      return showGrid
    }
    showGrid = b
    return graph
  }
  graph.tickPadding = function (p) {
    if (!arguments.length) {
      return tickPadding
    }
    tickPadding = p
    return graph
  }
  graph.xTickSize = function (i, o) {
    if (!arguments.length) {
      return xAxis.tickSize()
    }
    if (arguments.length === 1) {
      xAxis.tickSize(i)
    } else if (arguments.length === 2) {
      xAxis.tickSize(i, o)
    }
    return graph
  }
  graph.yTickSize = function (i, o) {
    if (!arguments.length) {
      return yAxis.tickSize()
    }
    if (arguments.length === 1) {
      yAxis.tickSize(i)
    } else {
      yAxis.tickSize(i, o)
    }
    return graph
  }
  graph.x = function (x) {
    if (!arguments.length) {
      return xAccessor
    }
    xAccessor = x
    return graph
  }
  graph.y = function (y) {
    if (!arguments.length) {
      return yAccessor
    }
    yAccessor = y
    return graph
  }
  graph.values = function (v) {
    if (!arguments.length) {
      return getValues
    }
    getValues = v
    return graph
  }
  graph.xDomain = function (x) {
    if (!arguments.length) {
      return xDomain
    }
    xDomain = x
    return graph
  }
  graph.data = function (d) {
    if (!arguments.length) {
      return data
    }
    data = d
    return graph
  }
  // graph.ghostAttr = function (a) {
  //   if (!arguments.length) {
  //       return ghostAttr
  //   }
  //   ghostAttr = a
  //   return graph
  // }
  graph.attr = function (a) {
    if (!arguments.length) {
      return attr
    }
    attr = a
    return graph
  }
  graph.size = function (s) {
    if (!arguments.length) {
      return { width: width, height: height }
    }
    width = s.width || width
    height = s.height || height
    svg.style({
      width: width + 'px',
      height: height + 'px'
    })
    return graph
  }
  graph.mouseover = function (mo) {
    if (!arguments.length) {
      return mouseover
    }
    mouseover = mo
    return graph
  }
  graph.mousemove = function (mm) {
    if (!arguments.length) {
      return mousemove
    }
    mousemove = mm
    return graph
  }
  graph.mouseout = function (mo) {
    if (!arguments.length) {
      return mouseout
    }
    mouseout = mo
    return graph
  }
  graph.click = function (c) {
    if (!arguments.length) {
      return click
    }
    click = c
    return graph
  }
  graph.xScale = function (scale) {
    if (!arguments.length) {
      return xScale
    }
    xScale = scale
    return xScale
  }
  graph.yScale = function (scale) {
    if (!arguments.length) {
      return yScale
    }
    yScale = scale
    return yScale
  }
  // obj should be an object with key: value pairs
  graph.margin = function (obj) {
    if (!arguments.length) {
      return margin
    }
    for (var key in obj) {
      margin[key] = obj[key]
    }
    return graph
  }
  graph.mouseListener = function (ml) {
      if(!arguments.length)
	  return ml
      mouseListener = ml
      return graph
  }

  return graph

  function resize () {
    if (!svgNode) return
    svg.style('width', '100%')
      .style('display', 'block')

    var bounds = svgNode.getBoundingClientRect()

    width = bounds.right - bounds.left
    height = bounds.bottom - bounds.top
  }

  function __mouseover (d) {
    if (mouseover) {
	mouseover.call(this, d, svg)
    }
      if(mouseListener) {
	    Object.keys(mouseListener).forEach(id => {
//		mouseListener[id](d)
	    })
	}
  }
  function __mousemove (d) {
    var x = xScale(d.point.x)
    guideLine.attr({
      x1: x,
      x2: x
    })
    if (mousemove) {
	mousemove.call(this, d, svg)
    }
      if(mouseListener) {
	  Object.keys(mouseListener).forEach(id => {
	      mouseListener[id](d,data)
	  })
      }
  }
}
