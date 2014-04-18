'use strict';

angular.module('businessSchoolsApp')
  .controller('MainCtrl', function ($scope, $compile, data) {
    $scope.data = data;
    // Extract the list of scope.dimensions and create a scale for each.
    $scope.dimensions = d3.range(1999,2015);

    $scope.margin = { top: 30, right: 10, bottom: 10, left: 10 };
    $scope.width = 960 - $scope.margin.left - $scope.margin.right;
    $scope.height = 420 - $scope.margin.top - $scope.margin.bottom;
      
    d3.select('#tabbedpane')
      .style("width", $scope.width - $scope.margin.left - $scope.margin.right - 30 + "px")
      .style("margin-left", $scope.margin.left + 10 + "px");

    d3.selectAll("li")
      .on("click", function(d) {
        var selected = d3.select(this);
        d3.select(".active")
            .classed("active", false)
        d3.select(this)
          .classed("active", true)
        
        d3.select("#wrapper").remove();
        d3.select("#vis")
              .append("div")
                .attr("id", "wrapper");

        switch (selected.text()) {
          case 'Weighted salary (US$)':
            console.log("Weighted selected");
            $scope.metric = selected.text();
            $('#wrapper').append($compile("<linechart />")($scope));            
            break;

          case 'Ranking Evolution':
            console.log("Ranking evolution")                        

            $('#wrapper').append($compile("<tableview />")($scope));
            // d3.selectAll("#vis")              
            //   .append("div")
            //   .append($compile("<tableview />")($scope));
            $scope.$apply(); 
        }
        // if (selected.text() == 'Weighted salary (US$)') {
        //   console.log("Weighted selected");
        //   d3.selectAll("#vis").select("div").remove();
        // }
      })
  });
