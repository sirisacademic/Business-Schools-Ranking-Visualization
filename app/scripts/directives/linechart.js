'use strict';

angular.module('businessSchoolsApp')
  .directive('linechart', function () {
   return {
      //We restrict its use to an element
      //as usually  <bars-chart> is semantically
      //more understandable
      restrict: 'E',
      //this is important,
      //we don't want to overwrite our directive declaration
      //in the HTML mark-up
      replace: false, 
      // scope: { chartdata: '=' },
      // controller: 'KeywordsCtrl',
      link: function (scope, element, attrs) {
        var data = scope.activeRows;
        console.dir(data)
        var numLines = 0;

        scope.$watch('activeRows', function() {
          data = scope.activeRows;           
          if (data.length > 0) {                                              
            setYAxis();
            draw();    
          }
        })
        
        scope.addLine = function (values) {
          console.dir(values);
          var lines = d3.selectAll(".line");
          console.log("Lenght: " + lines.length)
          var arrivingMax = d3.max(values, function(d) { return d.value; });
          console.log("numLines: " + numLines)
          console.log(y.domain()[1] + " " + arrivingMax)
          var max = (numLines > 0) ? Math.max(y.domain()[1], arrivingMax) : arrivingMax;
          console.log("max: " + max)
          y.domain([0, max]);
          numLines++;
          addLine(values);
        }

        scope.removeLine = function () {
          var lines = d3.selectAll(".line");
          lines.each(function(d, i) {
            if (i == lines.length - 1) {
              this.remove()
              numLines--;
            }
          })          
          console.log("Queden " + numLines)
        }

        var margin = {top: 20, right: 80, bottom: 20, left: 80},
            width = 730 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

        // var parseDate = d3.time.format("%d-%b-%y").parse;

        var color = d3.scale.category20();

        var x = d3.scale.ordinal()
            .domain(scope.dimensions)
            .rangePoints([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);        

        function setYAxis() {
          y.domain([0, d3.max(data, function(d) {
              return d3.max(d3.values(d.data).map(function(p) {    
                return (p[scope.metric] == undefined) ? 0 : p[scope.metric];
              }));
            })]);

            console.log(y.domain());
        }

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function(d, i) { return x(scope.dimensions[i]); })
            .y(function(d) { return y(d); })
            .interpolate("basis");;

        // var zoom = d3.behavior.zoom()
        //     .on("zoom", draw);

        var svg = d3.select(element[0])
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("# tweets");

        if (data.length > 0) {
          setYAxis();
          draw();
        }

        function draw() {
          // svg.select(".x")
          //   .transition()
          //   .duration(500)
          //   .call(xAxis);
          console.log("DRAWWWWIIIIING")

          svg.select(".y")
            .transition()
            .duration(500)
            .call(yAxis);

          svg.selectAll(".line")
            .data(data)
            .enter()
              .append("path")
              .datum(function(d) {
                var values = [];
                scope.dimensions.forEach(function(p) {
                  if (d.data[p] != undefined && d.data[p][scope.metric] != undefined)
                    values.push(d.data[p][scope.metric]);
                  else
                    values.push(0);
                })

                console.log(values)
                return values;
              })
              .attr("class", "line")
              .attr("d", line);              
        }

        function addLine(lineData) {
          svg.select(".y")
            .transition()
            .duration(500)
            .call(yAxis);

          svg.selectAll(".line")
            .transition()
            .duration(500)
            .attr("d", line)

          svg.append("path")
              .datum(lineData)
              .attr("class", "line")
              .attr("d", line)
              .style("stroke", function() {
                return color(Math.round(Math.random()*20));
              })
              .on("mouseover", function(d) {
                var currentThis = this;
                svg.selectAll(".line")
                  .style("opacity", function(d) {
                    console.log(currentThis)
                    console.log(currentThis)
                    if (currentThis != this)
                      return 0,5;
                    else
                      return 1;
                  })

              });
        }

      }
  }
});
