'use strict';

angular.module('businessSchoolsApp')
  .controller('MainCtrl', function ($scope, data) {
    console.log(data)
    $scope.data = data
  });
