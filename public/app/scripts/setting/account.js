'use strict';
angular.module('yh.setting')
  .config(['$stateProvider', 'yh', function($stateProvider, yh){
    $stateProvider.state('setting.account', {
      url: '',
      access: 'user',
      templateUrl: yh.path('setting/views/account.html'),
      controller: ['$scope', 'yhUser', 'yhDialog', function($scope, yhUser, yhDialog){
        $scope.formData = yhUser.getMe();

        // $scope.formData.changePassword = true;
        // $scope.formData.currentPassword = 'laijinyue';
        // $scope.newPassword = 'laijinyue';
        // $scope.verifyPassword = 'laijinyue';

        $scope.submit = function(){
          $scope.formData.newPassword = $scope.newPassword;
          yhUser.changePassword($scope.formData, function(result, err) {    
            if( err ){
              yhDialog('Error', err.message);
            }else{
              $scope.formData.changePassword = false;
              $scope.newPassword = '';
              $scope.verifyPassword = '';
            }
          });
        };
      }]
    });
  }]);