var self = this;
var debug = Debug('yh:nodes:post');
debug(" \n=================");

cancelIf( !me, "You must be logged in", 401);

if( this.score ) {
    cancel("You do not have permission to set score", 401);
}

this.authorId = me.id;
this.authorDisplayName = me.displayName;

this.voteUpCount = 0;
this.votedownCount = 0;
this.score = 0;
this.commentCount = 0;
this.postedTime = new Date().getTime();

if( this.parentId ){
  debug("this is a child, need to update parent %s item's comment count ", this.parentId);
  var data = {
    commentCount: {$inc:1}
  };
  dpd.nodes.put(this.parentId, data, function(parentNode, err){
    cancelIf( err, 'Error while trying to update parent node', 500);
    debug('update parentNode \nparentNode: %j \nerr: %j', parentNode, err);
    self.parentNode = parentNode;
    debug('final result: %j', self);
  });
}else{
  var metaQuery = {id:'c1b6fbb488dca8e8', key:'nodesCount'};
  var metaData = { value: {$inc:1} };
  dpd.systemmeta.put(metaQuery, metaData, function(meta, err){
    debug( 'meta %j', meta);
    debug( 'err %j', err);
    cancelIf( err, 'Error while trying to update nodes count', 500);
  });
  debug("new post only, do nothing else!");
  debug('final result: %j', self);
}

