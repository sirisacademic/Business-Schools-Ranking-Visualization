'use strict';

angular.module('businessSchoolsApp')
  .directive('parallel', function () {
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

        var data = [];
        scope.$watch('data', function() {
          console.log(scope.data);
          data = scope.data;
          // data = [data[0], data[1], data[2]]
          draw();
        })

        // Given a data object and a year (column) retrieves its value according to one metric (default is Current rank)
        function getValue(d, year) {
          return (!(year in d.data)) ? 101 : d.data[year]['Current rank']
        }

        var margin = { top: 30, right: 10, bottom: 10, left: 10 },
            width = 960 - margin.left - margin.right,
            height = 420 - margin.top - margin.bottom;
              


        var tooltip = d3.select("#tooltip")
            .style("visibility", "hidden")
            .style("background-color", "#ffffff");

        var x = d3.scale.ordinal().rangePoints([0, width], 1),
            y = {},
            dragging = {};

        var color = d3.scale.linear()
            .domain([101, 1])
            .range(["white", "#7BBF6A"]);

        var line = d3.svg.line()          
                  .interpolate("monotone"),
            axisLeft = d3.svg.axis()
                    .orient("left")
                    .ticks(8),
            axisRight = d3.svg.axis()
                    .orient("right")
                    .ticks(8),
            axis = d3.svg.axis()
                    .orient("left")
                    .ticks(0),
            background,
            foreground;

        var svg = d3.select(element[0]).append("svg")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
          .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');        

        var filtered, 
            countries, 
            selectedCountry = "All",
            sortedKeys = [],
            dimensions;

        d3.selection.prototype.moveToFront = function() {
            return this.each(function(){
            this.parentNode.appendChild(this);
          });
        };


        // d3.csv("shanghai_ranking.csv", function(data) {
        function draw() {

          // Extract the list of dimensions and create a scale for each.
          dimensions = d3.range(1999,2015);
          x.domain(dimensions);
          dimensions.forEach(function(d) {
            y[d] = d3.scale.linear()        
                .domain([1, 101])
                .range([0, height]);
          })
            

          // data.sort(function(a,b) {
          //     return a["2013"] - b["2013"];
          //   });

          
          countries = d3.keys(d3.set(data.map(function(d) {
            return d.country;
          })));

          console.log(countries)

          d3.select("#countriesCombo")
            .on( "change", function(d) {
              selectedCountry = $("#countriesCombo").find('option:selected').val();
              if (getActiveDimensions().length > 0)
                brush();
              else
                filterByCountry(d);
            })
            .selectAll("option")
            .data(countries.sort())
            .enter()
            .append("option")
              .attr("value", function(d) { return d;})
              .text(function(d) { return d;})     

          var nElements = data.length,
              strokeWidth = height / nElements,
              color = d3.scale.category20();

          strokeWidth = height / nElements;

          d3.selectAll("table")
            .style("width", (width - 33) + "px")
            .style("padding-left", "55px")

          // sortedKeys = d3.keys(data[0]).sort(function(a,b) {
          //   a = (a == "University") ? 100 : a;
          //   b = (b == "University") ? 100 : b;
          //   a = (a == "Country") ? 1000 : a;
          //   b = (b == "") ? 1000 : b;

          //   return a-b;
          // });
          sortedKeys = d3.keys(data[0]);

          d3.selectAll("thead tr").selectAll("th")
            .data(sortedKeys)
            .enter()
            .append("th")
            .attr("class", function(d, i) {
              if (d != "University")
                return "centeredTd";
              else
                return null;
            })
            .style("background-color", "#eeeeee")
              .text(function(d) { return d; })

          // Add grey background lines for context.
          background = svg.append("svg:g")
              .attr("class", "background")
            .selectAll("path")
              .data(data)
            .enter().append("svg:path")
              .attr("d", path);

          // Add blue foreground lines for focus.
          foreground = svg.append("svg:g")
              .attr("class", "foreground")
            .selectAll("path")
              .data(data)
            .enter().append("svg:path")
              .attr("d", path)
              .attr("stroke-width", strokeWidth)
              .attr("stroke", function(d) {
                return color(d);
              })
            .on("mouseover", function(d) {
                  tooltip.html("<font size='2'>" + d["name"] + "</font>");
                  tooltip.style("visibility", "visible");
                  d3.select(this).style("stroke", "red");
                  var sel = d3.select(this);
                  sel.moveToFront();

                  // console.log(d)

                  var circles = d3.selectAll(".circleText")
                    .attr("display", true)
                    .attr("transform", function(p){              
                      return "translate("+x(p)+"," + y[p](getValue(d, p)) + ")"
                    })

                  circles.selectAll("text")
                    .text(function(p) {
                      return (d[p] == 101) ? "-" : getValue(d, p) + ""
                    })
              })
              .on("mousemove", function(){
                // d3.event must be used to retrieve pageY and pageX. While this is not needed in Chrome, it is needed in Firefox
                tooltip.style("top", (d3.event.pageY - 20)+"px").style("left",(d3.event.pageX )+"px");        
              })
              .on("mouseout", function(){
                  tooltip.style("visibility", "hidden");
                  d3.select(this).style("stroke", "steelblue");
                 d3.selectAll(".circleText")
                      .attr("display", "none")
                });

          // Add a group element for each dimension.
          var g = svg.selectAll(".dimension")
              .data(dimensions)
            .enter().append("svg:g")
              .attr("class", "dimension")
              .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
              // .call(d3.behavior.drag()
              //   .on("dragstart", function(d) {
              //     dragging[d] = this.__origin__ = x(d);
              //     background.attr("visibility", "hidden");
              //   })
              //   .on("drag", function(d) {
              //     dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
              //     foreground.attr("d", path)
              //               .attr("stroke-width", strokeWidth);
              //     dimensions.sort(function(a, b) { return position(a) - position(b); });
              //     x.domain(dimensions);
              //     g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
              //   })
              //   .on("dragend", function(d) {
              //     delete this.__origin__;
              //     delete dragging[d];
              //     transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
              //     transition(foreground)
              //         .attr("d", path)
              //         .attr("stroke-width", strokeWidth);
              //     background
              //         .attr("d", path)
              //         .attr("stroke-width", strokeWidth)
              //         .transition()
              //         .delay(500)
              //         .duration(0)
              //         .attr("visibility", null);
              //   }));

          // Add an axis and title.
          g.append("svg:g")
              .attr("class", "axis")
              .each(function(d, i) {
                if (i == (dimensions.length - 1))
                  return d3.select(this).call(axisRight.scale(y[d]));
                else if (i == 0) 
                  d3.select(this).call(axisLeft.scale(y[d])); 
                else
                  d3.select(this).call(axis.scale(y[d])); 
              })
            .append("svg:text")
              .attr("text-anchor", "middle")
              .attr("y", -9)
              .text(String);

          // Add and store a brush for each axis.
          g.append("svg:g")
              .attr("class", "brush")
              .each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
            .selectAll("rect")
              .attr("x", -8)
              .attr("width", 16);

          var circleElements = svg.selectAll("g circleText")
              .data(dimensions)
              .enter()
              .append("g")
                .attr("class", "circleText")
                .attr("display", "none")
                .attr("transform", function(d){return "translate("+x(d)+",80)"})

          circleElements    
              .append("circle")
                // .style("shape-rendering", "crispEdges")
                .attr("r", 8)
                .attr("stroke","red")
                .attr("fill", "white");        
              
          circleElements.append("text")
                .attr("text-anchor", "middle")
                .attr("font-size", "9px")
                .style("dominant-baseline", "central")
                .text("89")

            manageFilteredElements();
        };

        function position(d) {
          var v = dragging[d];
          return v == null ? x(d) : v;
        }

        function transition(g) {
          return g.transition().duration(500);
        }

        // Returns the path for a given data point.
        function path(d) {
          return line(dimensions.map(function(p) { return [position(p), y[p](getValue(d, p))]; }));          
        }

        function filterByCountry() {  
          console.log("******** filterByCountry");
          var currentlyVisible = foreground.filter(function() {
            console.log(d3.select(this).style("display"))
            return d3.select(this).style("display") != "none";
          });

          console.dir(currentlyVisible)

          foreground.style("display", function(d) {
            return currentlyVisible.every(function(p, i) {  
              if (selectedCountry == "All")
                return true;
              else
                return d["country"].localeCompare(selectedCountry) == 0;
                // return d["country"] == selectedCountry ?????? NOT WORKING!!!????!!???
            }) ? null : "none";
          });

          manageFilteredElements();
        }

        function getActiveDimensions() {
          return dimensions.filter(function(p) { return !y[p].brush.empty(); })
        }

        // Handles a brush event, toggling the display of foreground lines.
        function brush() {
          console.log("******** BRUSH");
          var actives = getActiveDimensions(),
              extents = actives.map(function(p) { return y[p].brush.extent(); });

            
          foreground.style("display", function(d) {    
            return actives.every(function(p, i) {      
              var bool =  extents[i][0] <= getValue(d, p) && getValue(d, p) <= extents[i][1];
              bool = bool && (selectedCountry == "All" || d["country"].localeCompare(selectedCountry) == 0);
            
              return bool;
            }) ? null : "none";
          });

          if (actives.length == 0 && selectedCountry != "All")
            filterByCountry();
          else
            manageFilteredElements();
        }

        function manageFilteredElements() {
          // Get filtered elements
          filtered = foreground.filter(function() {
            return d3.select(this).style("display") != "none";
          });
          // console.log("filtered")
          //console.log(filtered.length)

          //dataTable.fnClearTable();
          if (filtered.length > 0) {
            // convert the array of objects into an array of arrays
            var r = [];
            filtered.data().forEach(function(d, i) {
              var array = [];
              for (i = 0; i<sortedKeys.length; i++)
                array.push(d[sortedKeys[i]])
              
              r.push(array);

            });

           //$('#results').dataTable().fnAddData(activeRows);
            d3.select("#numResults")
              .text(r.length + " institutions match the criteria");
            setTable(r);
          } else {
            d3.select("tbody").selectAll("tr").remove();  
            d3.select("#numResults")
              .text("");
          }
        }

        function setTable(activeRows) { 
          d3.select("tbody").selectAll("tr").remove();

          var rows = d3.select("tbody").selectAll("tr")
            .data(activeRows)
            .enter()
            .append("tr")
            .style("background-color", function(d,i) {
              return (i%2 == 0) ? "white" : "#F0F0F0";
            });

          // console.log(rows)

          rows.selectAll("td")
            .data(function(d, i) { return d; })
            .enter()
            .append("td")
            .attr("class", function(d, i) {
              return (i > 1) ? "centeredTd" : null;
            })
            .style("background-color", function(d, i) {  return color(d); })
            .text(function(d, i) {
              return (d == "101") ? "-" : d;
            })
        }

      }
    };
  });