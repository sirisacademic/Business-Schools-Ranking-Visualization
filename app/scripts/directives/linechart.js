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

        scope.highlightLineChart = function(hoveredElelemnt) {
          // var ho = foreground.selectAll()
          //   .data([hoveredElelemnt], function(d) { return d.name; });

          // console.log(ho)
          var lines = svg.selectAll(".linepath");
          console.log(lines)
          var selectedElement = lines.filter(function(d) {
            return d.name == hoveredElelemnt.name;
          })

          console.log(selectedElement)
          
          highlightLine(selectedElement.node());
        }

        scope.unHighlightLineChart = function() {
          d3.selectAll(".linepath")
            .style("stroke", "#87907D")
            .style("stroke-width", 1)
            .style('opacity', 0.6);
        }

        var tooltip = d3.select("#tooltip");

        var margin = {top: 20, right: 80, bottom: 20, left: 80},
            width = scope.width - margin.left - margin.right,
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
          // var max = d3.max(data, function(d) {
          //     return d3.max(d3.values(d.data).map(function(p) {    
          //       return (p[scope.metric] == undefined) ? 0 : p[scope.metric];
          //     }));
          //   });

          // var min = d3.min(data, function(d) {
          //     return d3.min(d3.values(d.data).map(function(p) {    
          //       return (p[scope.metric] == undefined) ? 0 : p[scope.metric];
          //     }));
          //   });
          // y.domain([min, max]);

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
            .interpolate("monotone");

        function path(d) {
          return line(d.values);          
        }

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
          // .append("text")
          //   .attr("transform", "rotate(-90)")
          //   .attr("y", 6)
          //   .attr("dy", ".71em")
          //   .style("text-anchor", "end")
          //   .text("# tweets");

        if (data.length > 0) {
          setYAxis();
          draw();
        }

        function draw() {
          svg.select(".y")
            .transition()
            .duration(500)
            .call(yAxis);

          var lines = svg.selectAll(".linepath")
            .data(data, function(d) { return d.name });  

          lines.enter()
              .append("path")
              .datum(function(d) {
                var values = [];
                scope.dimensions.forEach(function(p) {
                  if (d.data[p] != undefined && d.data[p][scope.metric] != undefined)
                    values.push(d.data[p][scope.metric]);
                  else
                    values.push(0);
                })
                d['values'] = values;
                // console.log(d)
                return d;
              })
              .attr("class", "linepath")
              .attr("d", path)
              .style("opacity", 0)
              .on("mouseover", function(d) {                
                scope.highlightParallel(d);
                
                tooltip.html("<font size='2'>" + d["name"] + "</font>");
                tooltip.style("visibility", "visible");
                highlightLine(this);    
              })
              .on("mousemove", function(){
                tooltip.style("top", (d3.event.pageY - 20)+"px").style("left",(d3.event.pageX )+"px");        
              })
              .on("mouseout", function(d) {
                tooltip.style("visibility", "hidden");
                d3.select(this)
                  .style("stroke-width", 1)
                  .style('opacity', 0.6);

                scope.unHighlightParallel(); 
              })
              .transition()
                .duration(500)
                .style('opacity', 0.6);

          lines.exit()
            .transition()
            .duration(500)
            .style("opacity", 0)
            .remove();

          console.log(lines.exit());
        }

        function highlightLine(svgElement) {
          d3.select(svgElement)
              .style("stroke", "green")
              .style("stroke-width", 2)
              .style('opacity', 1);
        }

        // function addLine(lineData) {
        //   svg.select(".y")
        //     .transition()
        //     .duration(500)
        //     .call(yAxis);

        //   svg.selectAll(".linepath")
        //     .transition()
        //       .duration(500)
        //       .attr("d", line)

        //   svg.append("path")
        //       .datum(lineData)
        //       .attr("class", "linepath")
        //       .attr("d", line)
        //       .style("stroke", function() {
        //         return color(Math.round(Math.random()*20));
        //       })
        //       .on("mouseover", function(d) {
        //         var currentThis = this;
        //         svg.selectAll(".line")
        //           .style("opacity", function(d) {
        //             console.log(currentThis)
        //             console.log(currentThis)
        //             if (currentThis != this)
        //               return 0,5;
        //             else
        //               return 1;
        //           })

        //       });
        // }

      }
  }
});
