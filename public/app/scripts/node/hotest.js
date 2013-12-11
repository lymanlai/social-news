'use strict';
angular.module('yh.node')
  .config(['$stateProvider', 'yh', function($stateProvider, yh){
    $stateProvider.state('node.hotest', {
      url: '/hotest',
      templateUrl: yh.path('node/views/list.html'),
      resolve: { 
        params: function(){
          return {
            sortType: 'hotest',
            query: {
              parentId: null,
              $limit: 5, 
              $sort:{ commentCount: -1 }
            }
          };
        }
      },
      controller: 'listCtrl'
    });
  }]);