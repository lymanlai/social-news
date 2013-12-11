'use strict';
angular.module('yh.node')
  .config(['$stateProvider', 'yh', function($stateProvider, yh){
    $stateProvider.state('node.upest', {
      url: '/upest',
      templateUrl: yh.path('node/views/list.html'),
      resolve: { 
        params: function(){
          return {
            sortType: 'upest',
            query: {
              parentId: null,
              $limit: 5, 
              $sort:{ voteUpCount: -1 }
            }
          };
        }
      },
      controller: 'listCtrl'
    });
  }]);