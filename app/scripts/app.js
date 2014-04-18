'use strict';

var module = angular
  .module('businessSchoolsApp', [
    'ngResource',
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          data: ['$http', function($http) {
            return $http.get('data/global.json').then(function(response) {
              // console.log(response.data)
              return response.data;
            })
          }
          ]
        }
      })
    .otherwise({
      redirectTo: '/'
    });
  });
