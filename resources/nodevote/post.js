var debug = Debug('yh:nodevote:post');

if ( !me ) {
  cancel("You must be logged in", 401);
}

var self = this;
this.authorId = me.id;

var nodeId = this.nodeId;
var type = this.type;

var oppositeVoteType = {
  up: 'down',
  down: 'up'
};
oppositeVoteType = oppositeVoteType[type];

var nodesVoteCountData = {
  up: { voteUpCount:{$inc: 1} },
  down: { voteDownCount:{$inc: 1} }
};
nodesVoteCountData = nodesVoteCountData[type];

var nodesOppositeVoteCountData = {
  up: { voteUpCount:{$inc: 1}, voteDownCount:{$inc: -1} },
  down: { voteUpCount:{$inc: -1}, voteDownCount:{$inc: 1} }
};
nodesOppositeVoteCountData = nodesOppositeVoteCountData[type];

//unknow vote action
cancelIf( oppositeVoteType === undefined, 'You use an unknown vote action!', 403);

debug('job start===========================');
//query the same vote
var data = {
  nodeId: nodeId,
  type: type,
  authorId: me.id
};
dpd.nodevote.get(data,function(result,err){ 
  if( err ){
    throw err;
  }
  debug('====query the same vote \ndata: %j \nresult: %j \nerr: %j', data, result, err);
  //already vote
  cancelIf( result.length !== 0, 'You have vote ' + this.type + ' this node!', 403);

  //query opposite vote
  data = {
    nodeId: nodeId,
    type: oppositeVoteType,
    authorId: me.id
  };
  debug('====query opposite vote', data);
  dpd.nodevote.get(data,function(result,err){
    if( err ){
      throw err;
    }

    if( result.length !== 0 ){
      //have opposite vote, remove it
      data = result[0];
      dpd.nodevote.del(data, function(result, err){
        if( err ){
          throw err;
        }
            
        debug('====have oppsite vote remove it', data, result, err);
        //update nodes data
        dpd.nodes.put(nodeId, nodesOppositeVoteCountData, function(result, err){
          if( err ){
            throw err;
          }

          debug('====update node data', nodesOppositeVoteCountData, result, err);
          cancelIf( err, "Error while trying to update node vote count", 400);
          self.opposite = true;
          self.node = result;
        });
      });
    }else{
    //do not have oppsite vote
      dpd.nodes.put(nodeId, nodesVoteCountData, function(result, err){
        if( err ){
          throw err;
        }

        debug('====do not have oppsite vote, just add new record', nodesVoteCountData, result, err);
        cancelIf( err, "Error while trying to update node vote count", 400);
        self.node = result;
      });
    }
  });
});