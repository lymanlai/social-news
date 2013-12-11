'use strict';
angular.module('yh.node')
  .config(['$stateProvider', 'yh', function($stateProvider, yh){
    $stateProvider.state('node.add', {
      url: '/add',
      access: 'user',
      templateUrl: yh.path('node/views/add.html'),
      controller: ['$scope', 'yhUser', '$state', '$http', 'yh', 'yhCache', function($scope, yhUser, $state, $http, yh, yhCache ){
        $scope.formData = yhUser.getFormOldData( );
        
        $scope.submit = function(){
          if( !$scope.formData.title ){
            $scope.form.title.$invalid = true;
            $scope.form.title.$dirty = true;
            $scope.form.title.$error.required = true;
            return false;
          }

          $http.post( yh.api('nodes'), $scope.formData )
            .then(function(data){
              var node = data.data;
              yhCache.remove( 'node:', true );
              $state.transitionTo( 'node.newest.itemDetail', {itemId: node.id});
            });
        };
      }]
    });
  }]);