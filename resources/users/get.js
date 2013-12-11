if (!me || me.id !== this.id) {
  hide('username');
  hide('email');
  hide('role');
  if (this.username){
    hide('id');    
  }
}


