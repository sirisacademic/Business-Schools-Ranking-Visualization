'use strict';

var module = angular
  .module('businessSchoolsApp', [
    'sirislab.siris-tableview',
    'sirislab.siris-stringUtils',
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
            return $http.get('data/global_mba_ranking.json').then(function(response) {
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
