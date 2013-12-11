'use strict';
angular.module('yh.node')
  .config(['$stateProvider', 'yh', function($stateProvider, yh){
    $stateProvider.state('node.hotest.itemDetail', {
      url: '/:itemId',
      views: {
        '@node':{
          templateUrl: yh.path('node/views/itemDetail.html'),
          controller: 'itemDetailCtrl',
          resolve: { 
            params: function(){
              return {
                query: {
                  $limit: 5
                }
              };
            }
          }
        }
      }
    });
  }]);