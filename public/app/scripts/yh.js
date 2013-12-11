'use strict';
var API = 'http://api.yaha.me:2403/';
angular.module('yh',['ui.bootstrap'])
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.responseInterceptors.push('onCompleteInterceptor');
  }])
  .factory('loadingService', function() {
    var service = {
      requestCount: 0,
      isLoading: function() {
        return service.requestCount > 0;
      }
    };
    return service;
  })
  .factory('onStartInterceptor', ['loadingService', '$rootScope', function(loadingService, $rootScope) {
    return function (data) {      
      loadingService.requestCount++;
      $rootScope.loading = true;
      return data;
    };
  }])
  .factory('onCompleteInterceptor', ['loadingService', '$rootScope', function(loadingService, $rootScope) {
    return function(promise) {
      var decrementRequestCount = function(response) {
        loadingService.requestCount--;
        if( loadingService.requestCount < 1 ){
          loadingService.requestCount = 0;
          $rootScope.loading = false;
        }
        return response;
      };
      return promise.then(decrementRequestCount, decrementRequestCount);
    };
  }])
  .factory('yhCache', [function(){
    var self = {
      checkExpired: function(){
        var key = '_last';
        var expiredTime = 1000*60*10;//10 minutes
        var now = (new Date()).getTime();
        var last = localStorage.getItem( key );
        if( !last ){
          last = now;
          localStorage.setItem( key, last );
        }
        if( (now - last) > expiredTime ){
          self.clear();     
          localStorage.setItem( key, now );     
        }
      },
      set: function(key, value){
        self.checkExpired();
        if (typeof value === 'undefined'){
          value = null;
        } 
        value = JSON.stringify(value);
        localStorage.setItem( key, value );

        return true;
      },
      get: function(key){
        self.checkExpired();
        var item = localStorage.getItem(key);
        item = JSON.parse( item );
        return item;
      },
      remove: function(key, isPrefix){
        self.checkExpired();
        if( !isPrefix ){
          localStorage.removeItem( key );
          return true;
        }
        var prefix = key;
        var prefixLength = prefix.length;

        for (key in localStorage) {
          if (key.substr(0,prefixLength) === prefix) {
            localStorage.removeItem( key );
          }
        }
        return true;
      },
      clear: function(){
        var prefix = '_';
        var prefixLength = prefix.length;
        var key;
        
        for (key in localStorage) {
          if (key.substr(0,prefixLength) !== prefix) {
            localStorage.removeItem( key );
          }
        }
      },
      removeAll: function(){
        localStorage.clear();
      }
    };

    return {
      set: self.set, 
      get: self.get,
      remove: self.remove,
      clear: self.clear
    };
  }])
  .constant('yh', {    
    api: function(url, jsonParams){
      url = API + url;
      if( jsonParams ){
        url = url + '?' + JSON.stringify(jsonParams);
      }
      return url;
    },
    avatarUploadUrl: API + 'avatar',
    avatarUrl: function(userId){
      return 'http://avatar.yaha.me/' + userId;
    },
    path: function(path){
      return 'scripts/' + path;
    },
    getFormData: function(formKeys, $scope){
      var data = {};
      angular.forEach(formKeys, function(value){
        data[value] = $scope[value];
      });
      return data;
    }
  })  
  .factory('yhAlert', function () {
    var alerts = {};
    return {
        pull: function(type){
            var alert = [];
            if( alerts[type] ){
                alert = alerts[type];
                alerts[type] = [];
            }
            return alert;
        },
        push: function(type, alertObj){
            if( !alerts[type] ){
                alerts[type] = [];
            }
            alerts[type].push(alertObj);
        }
    };
  })
  .factory('yhDialog', ['$dialog', function( $dialog ){
    return function(title, message){
      var buttons = [{result:'ok', label: 'OK', cssClass: 'btn-primary'}];
      var yhDialog = $dialog.messageBox(title, message, buttons);
      yhDialog.open();
    };
  }])
  .directive('yhUnique', ['$http', '$injector', function ($http, $injector) {
    var yh;
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        elem.bind('keyup', function () {
          var username = attrs.yhUnique;
          yh = yh || $injector.get('yh');
          $http.get( yh.api('users?username=' + username) ).
            success(function(results){
              ctrl.$setValidity('unique', results.length === 0 );
            });
        });
      }
    };
  }])
  .directive('yhFocus', function() {
    return function(scope, element, attrs) {
       scope.$watch(attrs.yhFocus, 
         function (newValue) {
            if( newValue ){
              element[0].focus();
            }
            scope[attrs.yhFocus] = false;
         });
    };
  })
  .directive('yhMatch', [function () {
      return {
          require: 'ngModel',
          link: function (scope, elem, attrs, ctrl) {
            var me = attrs.ngModel;
            var matchTo = attrs.yhMatch;

            scope.$watch( matchTo, function(){
              ctrl.$setValidity('match', scope[me] === scope[matchTo] );
            });
            scope.$watch( me, function(){
              ctrl.$setValidity('match', scope[me] === scope[matchTo] );
            });
          }
      };
  }])
  .directive('yhNowYear', function() {
    return {
      restrict: 'E',
      replace: true,
      template: '<span>{{now}}</span>',
      link: function(scope) {
        scope.now = (new Date()).getFullYear();
      }
    };
  })
  .run(['$rootScope', 'yh', 'onStartInterceptor', '$http', function($rootScope, yh, onStartInterceptor, $http){
    $rootScope.isDirty = function(field){
      return field.$dirty && field.$invalid;
    };

    $rootScope.isError = function(field, type){
      return field.$dirty && field.$error[type];
    };

    $rootScope.avatarUrl = yh.avatarUrl;

    $http.defaults.transformRequest.push(onStartInterceptor);
  }]);