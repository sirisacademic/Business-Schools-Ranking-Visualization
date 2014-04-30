'use strict';

angular.module('businessSchoolsApp')
  .directive('tableview', function () {
    return {
      templateUrl: 'views/tabletemplate.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        console.log("tableview created")
        var activeRows = [];

        scope.$watch('activeRows', function() {
          activeRows = scope.activeRows;          
          
          if (activeRows.length > 0) {                                  
            draw();            
          } else {
            d3.select("tbody").selectAll("tr").remove();
            d3.select("#numResults").text("");
          }
          // data = [data[0], data[1], data[2]]          
        })

        d3.select("#tablediv")
          .attr("height", 300 + "px")

        d3.selectAll("thead tr").selectAll("th")
            .data(['Name', 'Country'].concat(scope.dimensions))
            .enter()
            .append("th")
            // .attr("class", function(d, i) {
            //   if (d != "Name")
            //     return "centeredTd";
            //   else
            //     return null;
            // })         
            .style("background-color", "#eeeeee")
              .text(function(d) { return d; })

        var color = d3.scale.linear()
            .domain([101, 1])
            .range(["white", "#7BBF6A"]);

        d3.select('#tablediv')
          // .style("width", scope.width - scope.margin.left - scope.margin.right  + "px");
          .style("width", scope.width - scope.margin.left - scope.margin.right - 55 + "px")
          .style("margin-left", scope.margin.left + 28 + "px"); 

        function draw() {
          d3.select("tbody").selectAll("tr").remove();

          var rows = d3.select("tbody").selectAll("tr")
            .data(activeRows)
            .enter()
            .append("tr");
            // .style("background-color", function(d,i) {
            //   return (i%2 == 0) ? "white" : "#F0F0F0";
            // });

          // console.log(rows)

          rows.selectAll("td")
            .data(function(d, i) { 
            var array = [d.name, d.country];
              scope.dimensions.forEach(function(p) {
                if (d.data[p] == undefined)
                  array.push(0);
                else
                  array.push(d.data[p]['Current rank'])  
              })                  
              
              return array; 
            })
            .enter()
            .append("td")
            .attr("class", function(d, i) {
              return (i > 1) ? "centeredTd" : null;
            })
            .style("font", function(d, i) {
              if (i == scope.dimensions.length + 1)
                return "italic bold";
            })
            .style("background-color", function(d, i) {  
              return (d == 0) ? color(101) : color(d); 
            })
            .text(function(d, i) {
              return (d == 0) ? "-" : d;
            });
        }
      }
    };
  });
