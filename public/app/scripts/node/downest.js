'use strict';
angular.module('yh.node')
  .config(['$stateProvider', 'yh', function($stateProvider, yh){
    $stateProvider.state('node.downest', {
      url: '/downest',
      templateUrl: yh.path('node/views/list.html'),
      resolve: { 
        params: function(){
          return {
            sortType: 'downest',
            query: {
              parentId: null,
              $limit: 5, 
              $sort:{ voteDownCount: -1 }
            }
          };
        }
      },
      controller: 'listCtrl'
    });
  }]);