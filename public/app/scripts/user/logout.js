'use strict';
angular.module('yh.user')
  .config(['$stateProvider', 'yh', function($stateProvider, yh) {
    $stateProvider.state('logout', {
      url: '/logout',
      access: 'user',
      templateUrl: yh.path('user/views/logout.html'),
      controller: ['$scope', '$state', '$timeout', 'yhAlert', 'yhUser', function($scope, $state, $timeout, yhAlert, yhUser){
        $scope.logoutProgress = {
          type: 'success',
          value: 5
        };
        $scope.alerts = [
          {type:'success', msg: 'In progress, please wait!'}
        ];

        $scope.closeAlert = function(index) {
          $scope.alerts.splice(index, 1);
        };

        var totalSeconds = 100;
        var currentSeconds = 0;
        var doTimeOut = function(){   
          $scope.alerts = [
            {type:'success', msg: 'Loggout success, redirecting!'}
            // {type:'success', msg: 'Loggout success, redirect to home in '+(totalSeconds - currentSeconds)/10 +' seconds!'}
          ];
          $scope.logoutProgress = {
            type: 'success',
            value: 100*(currentSeconds/totalSeconds)
          };

          if( currentSeconds === totalSeconds ){
            yhUser.restoreStateOrToHome();
            $scope.$apply();
          }else{
            currentSeconds++;
            $timeout(doTimeOut, 10);
          }
        };

        yhUser.logout(function(){
          doTimeOut();
        });
      }]
    });
  }]);