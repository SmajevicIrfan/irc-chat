var socketio = require('socket.io');

module.exports = function(io) {
  // List of active users in every room
  var usersInRoom = {};

  var chatApp = function(socketId) {
    _socket = io.sockets.connected[socketId];

    this.update = function(msg) {
      _socket.emit('update', msg);
    }

    this.join = function(room, username, isAdmin) {
      if (!usersInRoom[room])
        usersInRoom[room] = {};

      usersInRoom[room][socketId] = username;

      _socket.join(room);

      _socket.emit('update', "You have successfully joined the chat room '" + room + "'.");
      if (isAdmin)
        _socket.broadcast.in(room).emit('update', "Admin " + username + " has joined the chat room.");
      else
        _socket.broadcast.in(room).emit('update', username + " has joined the chat room.");

      var activeUsers = new Array;
      for(var socket in usersInRoom[room]) {
          activeUsers.push(usersInRoom[room][socket]);
      }

      _socket.broadcast.in(room).emit('new-user', username);
      _socket.emit('connected', activeUsers);
    };
  };

  io.sockets.on('connection', function (socket) {
    var socketId = socket.id;

    socket.on('message-sent', function(room, msg) {
      io.in(room).emit('message-received', usersInRoom[room][socketId], room, msg);
    });

    socket.on('disconnect', function() {
      var rooms = socket.rooms;
      if (rooms == undefined)
        return ;

      var p = true;
      for(var room in rooms) {
        if (p) {
          p = false;
          continue;
        }
        
        socket.broadcast.in(room).emit('update', usersInRoom[room][socketId] + " has left the chat room.");

        io.sockets.emit('user-left', usersInRoom[room][socketId]);

        delete usersInRoom[room][socketId];
      }
    });
  });

  return chatApp;
}
