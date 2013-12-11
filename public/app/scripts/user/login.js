'use strict';
angular.module('yh.user')
  .config(['$stateProvider', 'yh', function($stateProvider, yh) {
    $stateProvider.state('login', {
      url: '/login',
      templateUrl: yh.path('user/views/login.html'),
      controller: ['$scope', '$state', 'yhAlert', 'yhUser', function($scope,$state, yhAlert, yhUser){
        var isLogin = yhUser.isLoggedIn();
        if( isLogin ){
          yhUser.restoreStateOrToHome();
        }
        
        $scope.alerts = yhAlert.pull('login');

        $scope.closeAlert = function(index) {
          $scope.alerts.splice(index, 1);
        };
                
        $scope.submit = function(){
          $scope.alerts = [];
          var data = {
            username: $scope.username,
            password: $scope.password
          };

          yhUser.login(data,function(user, err){
            if(err){
              $scope.alerts.push({type:'error', msg: 'Email or Password was incorrect.'});
            }else{           
              yhUser.restoreStateOrToHome();
            }
            // $scope.$apply();
          });
        };
      }]
    });
  }]);