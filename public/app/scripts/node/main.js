'use strict';
angular.module('yh.node', ['ui.state', 'yh'])
  .config(['$stateProvider', 'yh', function($stateProvider, yh){
    $stateProvider.state('node', {
      url: '/node',
      abstract: true,      
      templateUrl: yh.path('node/views/main.html')
    });
  }])
  .filter('coolNumber', function(){
    return function(input) {
      if( input === undefined ){
        input = 0;
      }
      var out = input;

      function m(n,d){
        var x=(''+n).length,
            p=Math.pow;
        
        d=p(10,d);
        x-=x%3;
        return Math.round(n*d/p(10,x))/d+' kMGTPE'[x/3];
      }

      out = m(input,1);
      
      return out;
    };
  })
  .factory('nodeVoteService', ['yhDialog', '$http', 'yh', 'yhCache', function(yhDialog, $http, yh, yhCache){
    return function(nodeItem, type){
      var nodeId = nodeItem.id;
      var data = {
        nodeId: nodeId,
        type: type
      };

      $http.post( yh.api('nodevote'), data ).
        success(function(result){
          yhCache.remove( 'node:', true );
          nodeItem.voteDownCount = result.node.voteDownCount;
          nodeItem.voteUpCount = result.node.voteUpCount;
        }).
        error(function(data){
          var title = 'Error while vote the node';
          var message = data.message;
          yhDialog(title, message);
        });
    };
  }])
  .controller('listCtrl', ['$scope', 'params', 'nodeVoteService', '$http', 'yh', 'yhCache', function($scope, params, nodeVoteService, $http, yh, yhCache){    
    var Ctrl = {
      GetNodesList: function(query){
        var cacheKey = 'node:' + JSON.stringify(query);
        var items = yhCache.get( cacheKey );
        if( items ){
          $scope.items = items;
        }else{
          $http.get( yh.api( 'nodes', query ) ).
            success(function(items){
              yhCache.set( cacheKey, items );
              $scope.items = items;
            });
        }
      },
      GetNodesCount: function(cb){
        var data = {
          key: 'nodesCount'
        };
        var cacheKey = 'node:system-meta:nodesCount';
        var nodesCount = yhCache.get( cacheKey );

        if( nodesCount ){
          params.numPages = Math.ceil( nodesCount / params.query['$limit'] );
          params.currentPage = 1;
          
          Ctrl.SetupPager();            
          cb(params.query);
        }else{
          $http.get( yh.api( 'system-meta', data ) ).
            success(function(result){
              var nodesCount = result[0].value;

              yhCache.set( cacheKey, nodesCount);

              params.numPages = Math.ceil( nodesCount / params.query['$limit'] );
              params.currentPage = 1;
              
              Ctrl.SetupPager();            
              cb(params.query);
            });
        }
      },
      SetupPager: function(){
        $scope.numPages = params.numPages;
        $scope.currentPage = params.currentPage;
      },
      ChangePage: function(currentPage){
        params.query['$skip'] = (currentPage - 1) * params.query['$limit'];
        params.currentPage = currentPage;
        Ctrl.GetNodesList(params.query);
      },
      DoVote: function( nodeItem, type ){
        nodeVoteService( nodeItem, type, $scope);
      }
    };

    $scope.sortType = params.sortType;

    $scope.changePage = Ctrl.ChangePage;
    $scope.doVote = Ctrl.DoVote;

    if( params.numPages ){
      Ctrl.SetupPager();
      Ctrl.GetNodesList( params.query );
    }else{
      Ctrl.GetNodesCount( Ctrl.GetNodesList );
    }
  }])
  .controller('itemDetailCtrl', ['$stateParams', 'params', '$scope', '$window', 'yhUser', '$location', 'nodeVoteService', '$http', 'yh', 'yhCache', function($stateParams, params, $scope, $window, yhUser, $location, nodeVoteService, $http, yh, yhCache){
    var Ctrl = {
      Init: function(){
        params.itemId = $stateParams.itemId;

        params.query.parentId = params.itemId;
        params.query['$sort'] = { postedTime: -1 };

        $scope.currentPage = 1;
        $scope.hasNextPage = false;
        $scope.formData = yhUser.getFormOldData( );

        $scope.getCommentList = Ctrl.GetCommentList;
        $scope.doVote = Ctrl.DoVote;
        $scope.goToComment = Ctrl.GoToComment;
        $scope.queryPrevPage = Ctrl.QueryPrevPage;
        $scope.queryNextPage = Ctrl.QueryNextPage;
        $scope.submit = Ctrl.Submit;
      },
      GetCommentList: function(){
        function success(commentItems){
          if( commentItems.length < params.query['$limit'] ){
            $scope.hasNextPage = false;
          }else{
            $scope.hasNextPage = true;
          }
          $scope.commentItems = commentItems;

          if( !$scope.items ){
            Ctrl.GetNodeItem();
          }
        }

        params.query['$skip'] = ($scope.currentPage - 1) * params.query['$limit'];
        var cacheKey = 'node:' + JSON.stringify(params.query);
        var commentItems = yhCache.get( cacheKey );
        
        if( commentItems ){
          success(commentItems);
        }else{
          $http.get( yh.api( 'nodes', params.query ) ).
            success(function(commentItems){
              yhCache.set( cacheKey, commentItems );
              success(commentItems);
            });
        }
      },
      GetNodeItem: function(){
        function success(item){
          $scope.items = [item];

          if( $location.hash() ){
            $scope.goToComment();
          }
        }
        
        var cacheKey = 'node:' + params.itemId;
        var item = yhCache.get( cacheKey );
        if( item ){
          success( item );
        }else{
          $http.get( yh.api( 'nodes/' + params.itemId ) ).
            success(function( item ){
              yhCache.set( cacheKey, item );
              success(item);
            });
        }
      },
      QueryNextPage: function(){
        if( $scope.hasNextPage === false ){
          return;
        }
        
        $scope.currentPage += 1;
        Ctrl.GetCommentList();
      },
      QueryPrevPage: function(){
        if( $scope.currentPage === 1 ){
          return;
        }
        $scope.currentPage -= 1;      
        Ctrl.GetCommentList();
      },
      DoVote: function( nodeItem, type ){
        nodeVoteService( nodeItem, type, $scope);
      },
      GoToComment: function(){
        $scope.makeCommentFocus = true;
      },
      Submit: function(){
        $scope.formData.parentId = params.itemId;

        if( !$scope.formData.title ){
          $scope.form.text.$invalid = true;
          $scope.form.text.$dirty = true;
          $scope.form.text.$error.required = true;
          return false;
        }
        
        $http.post( yh.api('nodes'), $scope.formData ).
          success(function(node) {
            yhCache.remove( 'node:', true );
            $scope.items = [node.parentNode];

            $scope.commentItems.push( node );            
            $scope.formData.title = '';

            $scope.form.text.$invalid = false;
            $scope.form.text.$dirty = false;
            $scope.form.text.$error.required = false;
          });
      }
    };

    Ctrl.Init();
    Ctrl.GetCommentList();
  }]);