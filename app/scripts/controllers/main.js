'use strict';

angular.module('businessSchoolsApp')
  .controller('MainCtrl', function ($scope, $compile, data) {
    $scope.data = data;
    console.log(data)

    data.forEach(function(d) {
      d.filter_country = true;
      d.filter_brush = true;
      d.filter_name = true;
    })
    
    // Extract the list of scope.dimensions and create a scale for each.
    $scope.dimensions = d3.range(1999,2015);

    $scope.margin = { top: 30, right: 0, bottom: 10, left: 0 };
    $scope.width = 960 - $scope.margin.left - $scope.margin.right;
    $scope.height = 420 - $scope.margin.top - $scope.margin.bottom;
    $scope.rankingMetric = 'Current rank'; // the metric to use in the rankings

    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };
        
    var tooltip = d3.select("#tooltip")
            .style("visibility", "hidden")
            .style("background-color", "#ffffff");
      
    // d3.select('#tabbedpane')
    //   .style("width", $scope.width - $scope.margin.left - $scope.margin.right - 30 + "px")
    //   .style("margin-left", $scope.margin.left + 10 + "px");

    var tabbedPane = d3.select("#tabbedpane")
    tabbedPane.selectAll("li")
      .on("click", function(d) {
        var selected = d3.select(this);
        tabbedPane.select(".active")
          .classed("active", false)
        d3.select(this)
          .classed("active", true)
        
        d3.select("#wrapper").remove();
        d3.select("#vis")
              .append("div")
                .attr("id", "wrapper");

        console.log(selected)
        switch (selected.attr("value")) {
          case 'Weighted salary (US$)':
            console.log("Weighted selected");
            $scope.metric = selected.attr("value");
            $('#wrapper').append($compile("<linechart />")($scope));            
            break;

          case 'Ranking Evolution':
            console.log("Ranking evolution")                        
            $('#wrapper').append($compile("<tableview />")($scope));
            // d3.selectAll("#vis")              
            //   .append("div")
            //   .append($compile("<tableview />")($scope));
            $scope.$apply(); 
            break;
          case 'Value for money ratio':
            $scope.metric = selected.attr("value");
            $('#wrapper').append($compile("<linechart />")($scope));
            break;
          case 'Women faculty (%)':
            $scope.metric = selected.attr("value");
            $('#wrapper').append($compile("<linechart />")($scope));
            break;
          case 'Women students (%)':
            $scope.metric = selected.attr("value");
            $('#wrapper').append($compile("<linechart />")($scope));
            break;
          case 'Employed at three months (%)':
            $scope.metric = selected.attr("value");
            $('#wrapper').append($compile("<linechart />")($scope));
            break;
          case 'Salary percentage increase':
            $scope.metric = selected.attr("value");
            $('#wrapper').append($compile("<linechart />")($scope));
            break;
        }
        // if (selected.text() == 'Weighted salary (US$)') {
        //   console.log("Weighted selected");
        //   d3.selectAll("#vis").select("div").remove();
        // }
      })
  });
