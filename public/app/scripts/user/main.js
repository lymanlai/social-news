'use strict';
angular.module('yh.user', ['ui.state', 'yh'])
  .config(['$httpProvider', function($httpProvider){  
    $httpProvider.responseInterceptors.push('userNotLoginHttpInterceptor');
  }])
  .factory('userNotLoginHttpInterceptor', ['$injector', '$rootScope', '$q', function($injector, $rootScope, $q) {
    var yhUser;

    function response401(response){
      if(response.status === 401) {
        yhUser = yhUser || $injector.get('yhUser');
        yhUser.clearClientSession();
        yhUser.loginThenBackToRequest( response.config.data );
      }
      return $q.reject(response);
    }

    function success(response) {
      switch( response.status ){
        case 0:
          response.data = {
            message: 'Seems your Internet Broken?'
          };
          return $q.reject(response);
        case 401:
          return response401(response);
        case 403:
          return $q.reject(response);
        default:
          return response;
      }
    }

    function error(response) {
      return $q.reject(response);
    }

    return function(promise) {
      return promise.then(success, error);
    };
  }])
  .factory('yhUser', ['$rootScope', 'yhCache', '$state', '$location', 'yhAlert', 'yhDialog', '$http', 'yh', function ($rootScope, yhCache, $state, $location, yhAlert, yhDialog, $http, yh) {
    var Permission = {
          placeHolder: ''
          , accessLevels: {
              public: 7, // 111
              anon:   1, // 001
              user:   6, // 110
              admin:  4  // 100
            }
          , userRoles: {
              public: 1, // 001
              user:   2, // 010
              admin:  4  // 100
            }
          , Init: function(){
              var role = 'public';

              if( yhCache.get('_role') ){
                role = yhCache.get('_role');
              }

              $rootScope.role = role;
            }
          , Can : function(accessLevel) {
              return Permission.accessLevels[accessLevel] & Permission.userRoles[$rootScope.role];
            }
          , Save: function(role){
              yhCache.set('_role', role);
              $rootScope.role = role;
            }
          , Remove: function(){
              yhCache.remove('_role');
              $rootScope.role = 'public';
            }
        }
      , User = {
          placeHolder: ''
          , Init: function(){
              $rootScope.me = yhCache.get('_me');
            }
          , Get: function(){
              return $rootScope.me;
            }
          , GetUid: function(){
              return $rootScope.me.id;
            }
          , Save: function( user ){
              yhCache.set('_me', user);
              $rootScope.me = user;
            }
          , Update: function(callback){
              if( callback === undefined ){
                callback = function(){};
              }

              $http.get( yh.api('users/me') ).
                success(function(data){
                  User.Save(data);
                  Permission.Save( data.role );
                  callback(data, false );
                }).
                error(function(data){
                  callback( data, true );
                });
            }
          , Remove: function(){
              yhCache.remove('_me');
              $rootScope.me = null;
            }
          , LoginThenBackToRequest: function(data){
              var stateName = $state.current.name;
              if( data ){
                saveFormOldData( stateName, data );
              }
              saveState($state.current, $state.params);
              yhAlert.push('login', {type:'error', msg: 'Your login session is experid! Please login again.'} );
              $state.transitionTo('login');
            }
          , ClearClientSession: function(){
              Sid.Remove();
              User.Remove();
              Permission.Remove();
            }
        }
      , Sid = {
          placeHolder: ''
          , Init: function(){
              var sid = yhCache.get('_sid');
              if( sid ){
                $http.defaults.headers.common['sid'] = sid;
              }
            }
          , Get: function(){
              return yhCache.get('_sid');
            }
          , Save: function(value){
              yhCache.set('_sid', value);
              $http.defaults.headers.common['sid'] = value;
            }
          , Remove: function(){
              delete $http.defaults.headers.common['sid'];
              yhCache.remove('_sid');
            }
        }
      ;

    var saveState = function(state, stateParams){
          if( state && state.name ){
            oldState = {
              name: state.name,
              stateParams: stateParams
            };
          }
        }
        , formOldDataHash = {}
        , saveFormOldData = function( stateName, data ){
          formOldDataHash[stateName] = data;
        }
        , oldState;

    $rootScope.hasPermission = Permission.Can;
    
    Permission.Init();
    User.Init();
    Sid.Init();   

    $rootScope.accessLevels = Permission.accessLevels;
    $rootScope.userRoles = Permission.userRoles;
    
    return {
        hasPermission: Permission.Can,
        isLoggedIn: function() {
            var role = $rootScope.role;
            return ( role === 'user' ) || ( role === 'admin' );
        },
        signup: function(data, callback) {
          $http.post( yh.api('users'), data ).
            then(function( data ){
              callback( data.data, data.status !== 200 );
            });
        },
        login: function(data, callback) {
          $http.post( yh.api('users/login'), data ).
            success(function(data, status){
              Sid.Save( data.id );              

              if( status === 200 ){
                User.Update(callback);
              }
            }).
            error(function(data){
              callback(data, true );
            });
        },
        changePassword: function(data, callback){
          var userId = $rootScope.me.id;
          data.id = userId;
          $http.post( yh.api('change-password'), data ).
            success(function(){
              User.Update(function(data, isErr){
                if( !isErr ){
                  yhDialog('Success', 'Change password success');
                }
              });
            }).
            then(function(data){
              callback( data.data, data.status !== 200 );
            });
        },
        update: function(data, callback){
          var userId = $rootScope.me.id;      
          $http.put( yh.api('users/'+userId), data ).
            success(function(){
              User.Update(function(data, isErr){
                if( !isErr ){
                  yhDialog( 'Success', 'Update success' );
                }
              });
            }).
            then(function(data){
              callback( data.data, data.status !== 200 );
            });
        },
        clearClientSession: User.ClearClientSession,
        logout: function(callback) {        
          $http.post( yh.api('users/logout') ).
            success(function(){
              User.ClearClientSession();              
            }).
            then(function(data){
              callback( data.data, data.status !== 200 );
            });
        },
        Sid: Sid.Get,
        getMe: User.Get,
        Uid: User.GetUid,
        initUserPermission: Permission.Init,
        saveState: saveState,
        restoreStateOrToHome: function(){
          if(oldState && oldState.name !== 'logout' ){
            $state.transitionTo(oldState.name, oldState.stateParams);
          }else{
            $state.transitionTo('home');
          }
          oldState = null;
        },
        loginThenBackToRequest: User.LoginThenBackToRequest,
        saveFormOldData: saveFormOldData,
        getFormOldData: function( ){
          var formOldData = null
            , stateName = $state.current.name;

          if( formOldDataHash[stateName] ){
            formOldData = formOldDataHash[stateName];
            formOldDataHash[stateName] = null;
          }

          return formOldData;
        },
        accessLevels: Permission.accessLevels,
        userRoles: Permission.userRoles
    };
  }])
  .run(['$rootScope', '$state', 'yhUser', 'yhAlert', '$timeout', function($rootScope, $state, yhUser, yhAlert, $timeout){
    $rootScope.$on('$stateChangeSuccess', function (event, next, nextParams, current, currentParams) {      
      if( next.name === 'logout' || next.name === 'login' ){
        if( current.name !== 'signup' 
            && current.name !== '403' 
            && current.name !== '404' 
            && current.name !== 'homeNotLogin' 
          ){
          yhUser.saveState(current, currentParams);
        }
        return false;
      }
      if ( next.access && !$rootScope.hasPermission(next.access) ) {
          if( yhUser.isLoggedIn() ){
            $state.transitionTo('403');
          }else{
            yhUser.saveState(next, nextParams);
            yhAlert.push('login', {type:'error', msg: 'Permission Deny! Please login first.'} );
            $timeout(function(){
              $state.transitionTo('login');
            });
          }
          return false;
      }
    });
  }]);