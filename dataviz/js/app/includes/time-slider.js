// Adapted from zanarmstrong’s block #ddff7cd0b1220bc68a58
// http://bl.ocks.org/zanarmstrong/ddff7cd0b1220bc68a58

define(['d3'], function () {
  'use strict';

  // Public Variables with Default Settings
  var width = null;
  var height = null;
  var margin = {
    top: 20,
    right: 50,
    bottom: 20,
    left: 50
  }
  var timeScale = d3.time.scale()
     .domain([new Date('2012-01-02'), new Date('2013-01-01')])
     .clamp(true);
  var formatDate = d3.time.format('%b %d');
  var formatYear = d3.time.format('%Y');
  var dateValue = new Date('2012-09-20');
  var dispatch = d3.dispatch('brushed');


  function timeSlider(selection) {

    selection.each(function(data) {
      width = width - margin.left - margin.right;
      height = height - margin.bottom - margin.top;
      timeScale.range([0, width]);

      var brush = d3.svg.brush()
        .x(timeScale)
        .extent([dateValue, dateValue])
        .on('brush', function(){
          var value = brush.extent()[0];

          if (d3.event.sourceEvent) { // not a programmatic event
            value = timeScale.invert(d3.mouse(this)[0]);
            brush.extent([value, value]);
            dispatch.brushed(formatDate(value));
          }

          handle.attr("transform", "translate(" + timeScale(value) + ",0)");
          handle.select('text').text(formatDate(value));
        })

      var container = d3.select(this).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
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
              return formatYear(d);
            })
          .tickSize(0)
          .tickPadding(12)
          .tickValues(timeScale.domain()))
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
        .text(formatDate(dateValue))
        .attr('transform', 'translate(' + (-18) + ' ,' + (height / 2 - 25) + ")");

      slider.call(brush.event);
    });
  }



  // Expose Public Variables

  timeSlider.margin = function(_) {
      if (!arguments.length) return margin;
      margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
      margin.right    = typeof _.right    != 'undefined' ? _.right    : margin.right;
      margin.bottom    = typeof _.bottom    != 'undefined' ? _.bottom    : margin.bottom;
      margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
      return timeSlider;
  };

  timeSlider.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      return timeSlider;
  };

  timeSlider.height = function(_) {
      if (!arguments.length) return height;
      height = _;
      return timeSlider;
  };

  timeSlider.dateValue = function(_) {
      if (!arguments.length) return dateValue;
      dateValue =  new Date (_);
      return timeSlider;
  };

  timeSlider.formatDate = function(_) {
      if (!arguments.length) return formatDate;
      formatDate = _;
      return timeSlider;
  };

  timeSlider.timeScale = function(_) {
      if (!arguments.length) return timeScale;
      timeScale = _;
      return timeSlider;
  };


  d3.rebind(timeSlider, dispatch, 'on');

  return timeSlider;



});
