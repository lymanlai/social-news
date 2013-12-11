if (!(me && me.id == this.id)) {
    cancel("This is not you", 403);
}
if (!internal) {
  protect('username');
  protect('password');
  protect('displayName');
  protect('role');
  protect('email');
  protect('id');
}