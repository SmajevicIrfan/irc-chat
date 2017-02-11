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

Channel.methods.generateHash = function(password) {
  bcrypt.hash(password, saltRounds).then(function(hash) {
    this.password = hash;
  });
}

Channel.methods.validatePassword = function(_password) {
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
