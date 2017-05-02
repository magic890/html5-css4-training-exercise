(function(){

'use strict';

var H5C4App = angular.module('H5C4App', [
    'ngRoute',
    'H5C4Controllers',
    'H5C4Services',
    'H5C4Directives'
]);

H5C4App
    .constant("BACKEND", {
        "URL": "http://xxx.goodotcom.com/api/"
    })
    .config(function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/todo', {
                templateUrl: 'template/todo/todo.html',
                controller: 'TodoCtrl'
            })
            .when('/dashboard', {
                templateUrl: 'template/dashboard/dashboard.html',
                controller: 'DashboardCtrl'
            })
            .when('/login', {
                templateUrl: 'template/user/login.html',
                controller: 'UserCtrl'
            })
            .otherwise("/todo");

        //$locationProvider.html5Mode(true);
    });

})();
