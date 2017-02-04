var mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

var Schema = mongoose.Schema;

var Channel = new Schema({
  name      : { type: String, required: true, unique: true },
  publicID  : { type: String, required: true, unique: true },
  isLogged  : { type: Boolean, default: false },
  isPrivate : { type: Boolean, default: false },

  password       : { type: String },
  passwordAdmin : { type: String, required: true }
});

Channel.methods.addChannel = function(name, logged, private, password, passwordAdmin, next) {
  var newChannel = new Channel();

  newChannel.name = this.name.toLowerCase();
  if (this.logged)
    newChannel.logged = this.logged;

  if (this.private) {
    newChannel.private = this.private;

    bcrypt.hash(this.password, saltRounds).then(function(hash) {
      newChannel.password = hash;
    });
  }

  bcrypt.hash(this.passwordAdmin, saltRounds).then(function(hash) {
    newChannel.passwordAdmin = hash;
  });

  newChannel.save(function(err) {
    if (err)
      return next(err);

    return next(null, newChannel);
  });
}

Channel.methods.validatePassword = function(_password) {
  console.log(this.name, this.isLogged);
  if (this.password != undefined) {
    if (bcrypt.compareSync(_password, this.password))
      return 1;
  }
  else if (bcrypt.compareSync(_password, this.passwordAdmin))
    return 2;
  else
    return 0;
}

var ChannelModel = mongoose.model('channels', Channel);

module.exports = ChannelModel;
