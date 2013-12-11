'use strict';
angular.module('yh.node')
  .config(['$stateProvider', 'yh', function($stateProvider, yh){
    $stateProvider.state('node.my', {
      url: '/my',
      access: 'user',
      templateUrl: yh.path('node/views/list.html'),
      resolve: { 
        params: ['$rootScope', function($rootScope){
          var authorId = '';
          if( $rootScope.me && $rootScope.me.id ){
            authorId = $rootScope.me.id;
          }

          return {
            sortType: 'newest',
            query: {
              parentId: null,
              authorId: authorId,
              $sort:{ postedTime: -1 },
              $limit: 100000000
            }
          };
        }]
      },
      controller: 'listCtrl'      
    });
  }]);