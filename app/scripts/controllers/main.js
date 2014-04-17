'use strict';

angular.module('businessSchoolsApp')
  .controller('MainCtrl', function ($scope, data) {
    $scope.data = data;
    // Extract the list of scope.dimensions and create a scale for each.
    $scope.dimensions = d3.range(1999,2015);

    d3.selectAll("li")
      .on("click", function(d) {
        console.log(this)
        console.log(d)
      })
  });
