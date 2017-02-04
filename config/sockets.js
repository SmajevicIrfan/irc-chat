var socketio = require('socket.io');

module.exports = function(io) {
  // List of active users in every room
  var usersInRoom = {};

  var _socket, userId;
  var _room;

  var chatApp = function() {
    this.update = function(msg) {
      _socket.emit('update', msg);
    }

    this.join = function(room, newUserID, username, isAdmin) {
      userId = newUserID;
      _room = room;

      if (!usersInRoom[room])
        usersInRoom[room] = {};

      usersInRoom[room][userId] = username;

      _socket.join(room);

      _socket.emit('update', "You have successfully joined the chat room '" + room + "'.");
      if (isAdmin)
        _socket.broadcast.in(room).emit('update', "Admin " + username + " has joined the chat room.");
      else
        _socket.broadcast.in(room).emit('update', username + " has joined the chat room.");

      var activeUsers = new Array;
      for(var user in usersInRoom[room]) {
          activeUsers.push(usersInRoom[room][user]);
      }

      _socket.broadcast.in(room).emit('new-user', username);
      _socket.emit('connected', activeUsers);
    };
  };

  io.sockets.on('connection', function (socket) {
    var socketId = socket.id;
    _socket = socket;

    socket.on('message-sent', function(room, msg) {
      io.in(room).emit('message-received', usersInRoom[room][userId], room, msg);
    });

    socket.on('disconnect', function() {
      socket.broadcast.in(_room).emit('update', usersInRoom[_room][userId] + " has left the chat room.");
      socket.emit('update', "You have been disconnected! Please refresh.");

      io.sockets.emit('user-left', usersInRoom[_room][userId]);

      delete usersInRoom[_room][userId];
    });
  });

  return chatApp;
}
