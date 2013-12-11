'use strict';
angular.module('yh.node')
  .config(['$stateProvider', 'yh', function($stateProvider, yh){
    $stateProvider.state('node.newest', {
      url: '',
      templateUrl: yh.path('node/views/list.html'),
      resolve: { 
        params: function(){
          return {
            sortType: 'newest',
            query: {
              parentId: null,
              $sort:{ postedTime: -1 },
              $limit: 5
            }
          };
        }
      },
      controller: 'listCtrl'      
    });
  }]);