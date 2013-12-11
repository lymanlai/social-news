'use strict';
angular.module('yahaApp', [ 
    'ui.state','ui.bootstrap',  //vendors
    'ui.keypress', 
    'yh.user', 
    'yh.setting', 
    'yh.node', 
    'yh'
  ])
  .config(['$stateProvider', '$routeProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', 'yh',function ($stateProvider, $routeProvider, $urlRouterProvider, $locationProvider, $httpProvider, yh) {
    $httpProvider.defaults.useXDomain = true;
    $httpProvider.defaults.headers.common.withCredentials = true;
    
    $urlRouterProvider
      .when('/','homeNotLogin')
      .otherwise('/404');

    $stateProvider
      .state('404', {
        url: '/404',
        templateUrl: yh.path('404.html')
      })
      .state('403', {
        url: '/403',
        templateUrl: yh.path('403.html')
      })
      .state('home',{
        url: '',
        // templateUrl: yh.path('home.html'),
        controller: ['$state', 'yhUser', function($state, yhUser){
          if( !yhUser.isLoggedIn() ){     
            $state.transitionTo('homeNotLogin');
            return false;
          }
          $state.transitionTo('node.newest');
        }]
      })
      .state('homeNotLogin', {
        url: '/public',
        access: 'anon',
        templateUrl: yh.path('node/views/intro.html')
      });
  }])
  .run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;    
  }]);