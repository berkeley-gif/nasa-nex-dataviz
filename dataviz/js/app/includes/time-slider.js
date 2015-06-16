// Adapted from zanarmstrong’s block #ddff7cd0b1220bc68a58
// http://bl.ocks.org/zanarmstrong/ddff7cd0b1220bc68a58

define(['d3'], function () {

  'use strict';

  //============================================================
  // Public Variables with Default Settings
   //------------------------------------------------------------
  var width = null;
  var height = null;
  var margin = {
    top: 5,
    right: 5,
    bottom: 5,
    left: 5
  }
  var timeScale = d3.time.scale()
     .domain([new Date('2012-01-02'), new Date('2013-01-01')])
     .clamp(true);
  var formatDate = d3.time.format('%b %d');
  var startingValue = new Date('2012-09-20');

  function slider(selection) {

    selection.each(function(data) {

      console.log(timeScale);
      timeScale.range([0, width + margin.left + margin.right]);
      console.log(timeScale);

      var brush = d3.svg.brush()
        .x(timeScale)
        .extent([startingValue, startingValue]);


      var container = d3.select(this).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append("g")
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');



      container.append('g')
        .attr('class', 'x axis')
        // put in middle of screen
        .attr('transform', 'translate(0,' + height / 2 + ')')
        // inroduce axis
        .call(d3.svg.axis()
        .scale(timeScale)
          .orient('bottom')
          .tickFormat(function(d) {
            return formatDate(d);
          })
        .tickSize(0)
        .tickPadding(12)
        .tickValues([timeScale.domain()[0], timeScale.domain()[1]]))
        .select('.domain')
        .select(function() {
          return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr('class', 'halo');

      var slider = container.append('g')
        .attr('class', 'slider')
        .call(brush);

      slider.selectAll('.extent,.resize')
        .remove();

      slider.select('.background')
        .attr('height', height);

      var handle = slider.append('g')
        .attr('class', 'handle');

      handle.append('path')
        .attr('transform', 'translate(0,' + height / 2 + ')')
        .attr('d', 'M 0 -20 V 20');

      handle.append('text')
        .text(startingValue)
        .attr('transform', 'translate(' + (-18) + ' ,' + (height / 2 - 25) + ")");

      slider
        .call(brush.event);

      brush.on("brush", brushed);  

      function brushed() {
        var value = brush.extent()[0];

        if (d3.event.sourceEvent) { // not a programmatic event
          value = timeScale.invert(d3.mouse(this)[0]);
          brush.extent([value, value]);
        }

        handle.attr("transform", "translate(" + timeScale(value) + ",0)");
        handle.select('text').text(formatDate(value));
      }


    });
  }


  //============================================================
  // Expose Public Variables
  //------------------------------------------------------------
  slider.margin = function(_) {
      if (!arguments.length) return margin;
      margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
      margin.right    = typeof _.right    != 'undefined' ? _.right    : margin.right;
      margin.bottom    = typeof _.bottom    != 'undefined' ? _.bottom    : margin.bottom;
      margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
      return slider;
  };

  slider.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      return slider;
  };

  slider.height = function(_) {
      if (!arguments.length) return height;
      height = _;
      return slider;
  };

  slider.startingValue = function(_) {
      if (!arguments.length) return startingValue;
      startingValue =  _;
      return slider;
  };

  slider.formatDate = function(_) {
      if (!arguments.length) return formatDate;
      formatDate = _;
      return slider;
  };

  slider.timeScale = function(_) {
      if (!arguments.length) return timeScale;
      timeScale = _;
      return slider;
  };


  return slider;



});