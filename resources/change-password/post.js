cancelIf( !me, 'You must be login first', 401);

cancelIf( body.id != me.id , 'This is not you', 401);

// if( body.currentPassword
//   && body.newPassword
// ){
//   var username = me.username;
//   var password = body.currentPassword;

//   dpd.users.login({
//       username: username
//     }, function(result, err) {
//     console.log(result,err);
//     console.log('-==============');
//   });
// }

if( body.newPassword ){
  dpd.users.put(me.id,{password:body.newPassword},function(result,err){
    console.log(result,err);
  });
}
