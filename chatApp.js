var express = require('express');
var router = express.Router();

var Channels = require('./config/channel-client');

function generateHash(len) {
  var symbols = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  var hash = '';

  for (var i = 0; i < len; i++) {
    var symIndex = Math.floor(Math.random() * symbols.length);
    hash += symbols.charAt(symIndex);
  }

  return hash;
}

module.exports = function(io) {
  var sockets = require('./config/sockets')(io);

  /**
   * Redirect to General chatroom
   */
  router.get('/', function(req, res, next) {
    res.redirect('chat/general');
  });

  /**
   * Connection to specific chatroom
   */
  router.get('/:id', function(req, res, next) {
    Channels.findOne({ 'publicID': req.params.id }, 'name isPrivate', function(err, chatRoom) {
      if (err) {
        console.error(err);
        next(err);
      }

      if (chatRoom == null) {
        var error = new Error('Chatroom Not Found');
        error.status = 404;
        next(error);
      }
      else
        res.render('chatroom', { 'title': chatRoom.name, 'isPrivate': chatRoom.isPrivate });
    });
  });

  /**
   * Logging in user
   */
  router.post('/:id', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    var socketId = req.cookies.io;
    var chatApp = new sockets(socketId);

    Channels.findOne({ 'publicID': req.params.id }, function(err, chatRoom) {
      if (err) {
        console.error(err);
        next(err);
      }

      if (chatRoom == null) {
        var error = new Error('Chatroom Not Found');
        error.status = 404;
        next(error);
      }
      else {
        if (chatRoom.isPrivate) {
          var validation = chatRoom.validatePassword(password);

          if (!validation) {
            // Handle this
            res.status(401).send("You can't enter").render(error);
          }
          else {
            if (validation === 2) {
              // Admin
              chatApp.update('You authenticated as an admin.');
              chatApp.join(req.params.id, username, true);
            }
            else {
              // Normal User
              chatApp.join(req.params.id, username, false);
            }
          }
        }
        else {
          if (password != '') {
            if (chatRoom.validatePassword(password) === 2) {
              // Admin
              chatApp.update('You authenticated as an admin.');
              chatApp.join(req.params.id, username, true);
            }
            else {
              // Failed to join as admin
              chatApp.update('You have failed to authenticate as an admin.');
              chatApp.join(req.params.id, username, false);
            }
          }
          else {
            // Normal User
            chatApp.join(req.params.id, username, false);
          }
        }
      }

      res.status(200).send("OK");
    });
  });

  return {
    router: router
  };
}
