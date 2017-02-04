var express = require('express');
var router = express.Router();

var socketio = require('socket.io');
var Cookies = require('cookies');

var Channels = require('../config/channel-client');

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
  /**
   * Socket Routing
   */
  var usersInRoom = {};
  var roomsOfUser = {};

  var chatApp = function (socket) {
    var socketId = socket.id;

    // getting user_id if existent
    var cookie = socket.handshake.headers.cookie;
    var match = cookie.match(/\buser_id=([a-zA-Z0-9]{32})/);
    var userId = match ? match[1] : null;

    function update(where, msg) {
      where.emit('update', msg);
    }

    function update(msg) {
      socket.emit('update', msg);
    }

    function join(room, newUserID, username, isAdmin) {
      userId = newUserID;

      if (!usersInRoom[room])
        usersInRoom[room] = {};

      usersInRoom[room][userId] = username;

      update("You have successfully joined the chat room '" + room + "'.");
      update(socket.broadcast.in(room), (isAdmin? "Admin ":"") + username + " has joined the chat room.")

      // TODO send users of room to new user
      socket.broadcast.in(room).emit('new-user', username);
    };

    function join(room, username, isAdmin) {
      if (!usersInRoom[room])
        usersInRoom[room] = {};

      usersInRoom[room][userId] = username;

      update("You have successfully joined the chat room '" + room + "'.");
      update(socket.broadcast.in(room), (isAdmin? "Admin ":"") + username + " has joined the chat room.")

      // TODO send users of room to new user
      socket.broadcast.in(room).emit('new-user', username);
    }

    socket.on('message-sent', function(room, msg) {
      io.in(room).emit('message-received', usersInRoom[room][userId], room, msg);
    });
  }

  io.sockets.on('connection', function chatApp(socket) {
    var socketId = socket.id;

    // getting user_id if existent
    var cookie = socket.handshake.headers.cookie;
    var match = cookie.match(/\buser_id=([a-zA-Z0-9]{32})/);
    var userId = match ? match[1] : null;

    function update(where, msg) {
      where.emit('update', msg);
    }

    function update(msg) {
      socket.emit('update', msg);
    }

    function join(room, newUserID, username, isAdmin) {
      userId = newUserID;

      if (!usersInRoom[room])
        usersInRoom[room] = {};

      usersInRoom[room][userId] = username;

      update("You have successfully joined the chat room '" + room + "'.");
      update(socket.broadcast.in(room), (isAdmin? "Admin ":"") + username + " has joined the chat room.")

      // TODO send users of room to new user
      socket.broadcast.in(room).emit('new-user', username);
    };

    function join(room, username, isAdmin) {
      if (!usersInRoom[room])
        usersInRoom[room] = {};

      usersInRoom[room][userId] = username;

      update("You have successfully joined the chat room '" + room + "'.");
      update(socket.broadcast.in(room), (isAdmin? "Admin ":"") + username + " has joined the chat room.")

      // TODO send users of room to new user
      socket.broadcast.in(room).emit('new-user', username);
    }

    socket.on('message-sent', function(room, msg) {
      io.in(room).emit('message-received', usersInRoom[room][userId], room, msg);
    });
  });

  /*var chat = io.on('connection', function(socket) {
    var socketId = socket.id;
    //var clientIp = socket.request.connection.remoteAddress;

    var cookie = socket.handshake.headers.cookie;
    var match = cookie.match(/\buser_id=([a-zA-Z0-9]{32})/);
    var userId = match ? match[1] : null;

    console.log(userId);

    //DEBUG
    //console.log('New connection from ' + clientIp);
    //console.log(socketId);

    update = function(where, message) {
      if (where)
        where.emit('update', message);
      else
        socket.emit('update', message);
    }

    join = function(room, userID, username) {
      //DEBUG
      //console.log(clientIp + " is now known as " + username);

      if (!people[userID]) {
        people[userID] = [];
        people[userID].push(username);
      }

      people[userID].push(room);
      userId = userID;
      for (var i = 1; i < people[userID].length; i++)
        socket.join(userId[i]);

      update(socket, "You have successfully joined the chat room '" + room + "'.");
      //socket.emit('connected', people[room]);
      var active = [];
      for (var user in people)
        if (user.hasOwnProperty(room))
          active.push(user[room]);
      socket.emit('connected', active);

      update(socket.broadcast.in(room), username + " has joined the chat room.")
      socket.broadcast.in(room).emit('new-user', username);
    }

    socket.on('message-sent', function(room, msg) {
      //DEBUG
      //console.log('User ' + clientIp + ' said: ' + msg);

      io.in(room).emit('message-received', people[userId][0], room, msg);
    });

    // Purposefully leave a room
    socket.on('leave', function(room) {
      socket.broadcast.in(room).emit('update', people[userId][room] + " has left the chat room.");
      io.sockets.emit('user-left', people[userId][room]);

      delete people[userId][room];
    });
  });*/

  /**
   * URL Routing
   */

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
    var userId = req.cookies.user_id;

    /*var match = cookie.match(/\buser_id=([a-zA-Z0-9]{32})/);  //parse cookie header
    var userId = match ? match[1] : null;*/

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
      else {
        if (userId && people[userId])
          res.render('chatroom', { 'title': chatRoom.name, 'isPrivate': chatRoom.isPrivate, 'isLoggedIn': true,
                                   'username': people[userId][0] });
        else
          res.render('chatroom', { 'title': chatRoom.name, 'isPrivate': chatRoom.isPrivate, 'isLoggedIn': false });
      }
    });
  });

  /**
   * Logging in user
   */
  router.post('/:id', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

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
        var userID = generateHash(32);

        if (chatRoom.isPrivate) {
          var validation = chatRoom.validatePassword(password);

          if (!validation) {
            // Handle this
            res.status(401).send("You can't enter").render(error);
          }
          else {
            if (validation === 2) {
              // Admin
              chatApp.update(null, 'You authenticated as an admin.');
              chatApp.join(req.params.id, userID, username, true);
            }
            else {
              chatApp.join(req.params.id, userID, username, false);
            }
          }
        }
        else {
          if (password != '') {
            if (chat.validatePassword(password) === 2) {
              // Admin
              chatApp.update(null, 'You authenticated as an admin.');
              chatApp.join(req.params.id, userID, username, true);
            }
            else {
              // Failed to join as admin
              chatApp.update(null, 'You have failed to authenticate as an admin.');
              chatApp.join(req.params.id, userID, username, false);
            }
          }
          else {
            chatApp.join(req.params.id, userID, username, false);
          }
        }
      }

      res.status(200).send(userID);
    });
  });

  return router;
}
