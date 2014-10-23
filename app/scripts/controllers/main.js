'use strict';

angular.module('businessSchoolsApp')
  .controller('MainCtrl', function ($scope, $compile, data, $StringUtils) {    
    //setup some global constants
    $scope.$root.TABLE_COLUMN_NAME = "name";
    $scope.$root.TABLE_COLUMN_COUNTRY = "country";
    $scope.$root.TABLE_COLUMN_2000 = "2000";
    $scope.$root.TABLE_COLUMN_2001 = "2001";
    $scope.$root.TABLE_COLUMN_2002 = "2002";
    $scope.$root.TABLE_COLUMN_2003 = "2003";
    $scope.$root.TABLE_COLUMN_2004 = "2004";
    $scope.$root.TABLE_COLUMN_2005 = "2005";
    $scope.$root.TABLE_COLUMN_2006 = "2006";
    $scope.$root.TABLE_COLUMN_2007 = "2007";
    $scope.$root.TABLE_COLUMN_2008 = "2008";
    $scope.$root.TABLE_COLUMN_2009 = "2009";
    $scope.$root.TABLE_COLUMN_2010 = "2010";
    $scope.$root.TABLE_COLUMN_2011 = "2011";
    $scope.$root.TABLE_COLUMN_2012 = "2012";
    $scope.$root.TABLE_COLUMN_2013 = "2013";
    $scope.$root.TABLE_COLUMN_2014 = "2014";


    $scope.$root.COLUMN_PROPERTIES = new ColumnsProperties();   
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_NAME,1,20, "left"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_COUNTRY,0,undefined, "left"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_2000,1,undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_2001,1,undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_2002,1,undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_2003,1,undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_2004,1,undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_2005,1,undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_2006,1,undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_2007,1,undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_2008,1,undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_2009,1,undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_2010,1,undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_2011,1,undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_2012,1,undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_2013,1,undefined, "center"));
    $scope.$root.COLUMN_PROPERTIES.addColumnProperties(new ColumnProperties($scope.$root.TABLE_COLUMN_2014,1,undefined, "center"));


    // Extract the list of scope.dimensions and create a scale for each.
    $scope.dimensions = d3.range(2000,2015);
    var yearData;

    // console.dir(data);

    data.forEach(function(d) {
      d.filter_country = true;
      d.filter_brush = true;
      d.filter_name = true;

      // console.dir(d)
      // $scope.dimensions.forEach(function(p) {
      //   if (p in d.data) {
      //     yearData = d.data[p];
      //     // research_doctorate_criteria (20) = FT research rank (10) + Faculty with doctorates (5) + FT doctoral rank (5)
      //     yearData['research_doctorate_criteria'] = yearData['FT research rank'] + yearData['Faculty with doctorates (%)'] + yearData['FT doctoral rank'];
      //     // international_criteria (20) = International mobility (6) + International faculty (4) + International students (4) + International experience index (3) + International board (2) + Languages (1)
      //     yearData['international_criteria'] = yearData['International mobility index'] + yearData['International faculty (%)'] + yearData['International students (%)'] + yearData['International experience index'] + yearData['International board (%)'] + yearData['Languages'];
      //   }
      // })
    })

    $scope.avgs = {};
    // d3.max(d3.values(d.data).map(function(p) {    
    //                                           return (p['Weighted salary (US$)'] == undefined) ? 0 : p['Weighted salary (US$)'];
    //                                         })

    $scope.maxs = {};
    $scope.maxs['Weighted salary (US$)']      = getMaxValueFromMetric('Weighted salary (US$)');
    $scope.maxs['Salary percentage increase'] = getMaxValueFromMetric('Salary percentage increase');
    $scope.maxs['International faculty (%)']  = getMaxValueFromMetric('International faculty (%)');
    $scope.maxs['International students (%)'] = getMaxValueFromMetric('International students (%)');
    $scope.maxs['Women faculty (%)']          = getMaxValueFromMetric('Women faculty (%)');
    $scope.maxs['Women students (%)']         = getMaxValueFromMetric('Women students (%)');

    function getMaxValueFromMetric(metric) {
      return d3.max(data, function(d) {
          return d3.max(d3.values(d.data).map(function(p) {    
            return (p[metric] == undefined) ? 0 : p[metric];
          }));
        });
    }

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
        // console.log("Click!!!")
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

        // console.log(selected)
        $scope.metric = selected.attr("value");
        switch ($scope.metric) {
          case 'Weighted salary (US$)':
            // console.log("Weighted selected");
            $('#wrapper').append($compile("<linechart />")($scope));            
            break;

          case 'Ranking Evolution':
            console.log("Ranking evolution")                        
            $('#wrapper').append($compile("<tableview table_data='table_data' margin='margin' columns-properties='$root.COLUMN_PROPERTIES'></tableview>")($scope));
            // d3.selectAll("#vis")              
            //   .append("div")
            //   .append($compile("<tableview />")($scope));
            $scope.$apply(); 
            break;
          default:
            $('#wrapper').append($compile("<linechart />")($scope));
            break;
        }
        // if (selected.text() == 'Weighted salary (US$)') {
        //   console.log("Weighted selected");
        //   d3.selectAll("#vis").select("div").remove();
        // }
      })
  });
