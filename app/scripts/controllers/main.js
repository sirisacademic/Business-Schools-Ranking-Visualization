'use strict';

angular.module('businessSchoolsApp')
  .controller('MainCtrl', function ($scope, $compile, data) {    
    data.forEach(function(d) {
      d.filter_country = true;
      d.filter_brush = true;
      d.filter_name = true;
    })

    // Extract the list of scope.dimensions and create a scale for each.
    $scope.dimensions = d3.range(2000,2015);

    // Set proper margins, width and height
    $scope.margin = { top: 30, right: 0, bottom: 10, left: 0 };
    $scope.width = 960 - $scope.margin.left - $scope.margin.right;
    $scope.height = 420 - $scope.margin.top - $scope.margin.bottom;
    $scope.rankingMetric = 'Current rank'; // the metric to use in the rankings

    // elements are sorted according their position in the ranking in 2014. If they are not on 2014's ranking, they are sorted according their sum of ranks along the rest of the years
    data.sort(function(a, b) {
      var aValue, bValue;
      if (a.data['2014'] == undefined && b.data['2014'] == undefined) {
        aValue = bValue = 0;
        $scope.dimensions.forEach(function(d) {
          aValue += (a.data[d] == undefined) ? 1000 : a.data[d][$scope.rankingMetric];
          bValue += (b.data[d] == undefined) ? 1000 : b.data[d][$scope.rankingMetric];
        })
      } else {
        aValue = (a.data['2014'] == undefined) ? 101 : a.data['2014'][$scope.rankingMetric];
        bValue = (b.data['2014'] == undefined) ? 101 : b.data['2014'][$scope.rankingMetric];
      }
      return aValue - bValue;
    })    
    
    // saving the loaded data into the scope so the directives can draw it
    $scope.data = data;
    console.log(data);

    // extending selections with the ability to be moved in front of the rest
    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };
        

    $scope.tooltip = d3.select("#tooltip")
            .style("visibility", "hidden")
            .style("background-color", "#ffffff");
      
    // d3.select('#tabbedpane')
    //   .style("width", $scope.width - $scope.margin.left - $scope.margin.right - 30 + "px")
    //   .style("margin-left", $scope.margin.left + 10 + "px");

    d3.select("#clearBrushesBtn")
      .on("click", function(d) {
        console.log("Click!!!")
        try {
          $scope.clearBrushes();
        } catch(err) {                    
        } 
      });

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
