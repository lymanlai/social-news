'use strict';
angular.module('yh.user')
  .config(['$stateProvider', 'yh', function($stateProvider, yh) {
    $stateProvider.state('lostpassword', {
      url: '/lostpassword',
      access: 'anon',
      templateUrl: yh.path('user/views/lostpassword.html')
    });
  }]);