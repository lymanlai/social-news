'use strict';
angular.module('yh.user')
  .config(['$stateProvider', 'yh', function($stateProvider, yh) {
    $stateProvider.state('signup', {
      url: '/signup',
      access: 'anon',
      templateUrl: yh.path('user/views/signup.html'),
      controller: ['$scope', '$state', 'yhAlert', 'yhUser', function($scope, $state, yhAlert, yhUser){
        var formKeys = ['username', 'displayName', 'password' ];
        
        $scope.submit = function(){
          var data = yh.getFormData(formKeys,$scope);
      
          yhUser.signup(data, function(user, err) {    
            if (err) {
              $scope.form.username.$dirty = true;
              $scope.form.username.$pristine = false;
              $scope.form.username.$setValidity('unique', false);              
            } else {                
              yhAlert.push('login', {type:'success', msg: 'Sign Up successed! Please login now'} );
              $state.transitionTo('login');
            }
          });
        };
      }]
    });
  }]);