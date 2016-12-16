var people = {};

module.exports = function(server) {
  var io = require('socket.io')(server);

  var chat = io.on('connection', function(socket){
    var socketId = socket.id;
    //var clientIp = socket.request.connection.remoteAddress;

    //DEBUG
    //console.log('New connection from ' + clientIp);
    //console.log(socketId);

    socket.emit('new-person', people);

    socket.on('joined', function(username) {
      //DEBUG
      //console.log(clientIp + " is now known as " + username);

      people[socketId] = username;
      socket.emit('update', "You have successfully joined the chat room.");
      socket.broadcast.emit('update', username + " has joined the chat room.");

      io.sockets.emit('new-person', username);
    });

    socket.on('message-sent', function(msg) {
      //DEBUG
      //console.log('User ' + clientIp + ' said: ' + msg);

      io.sockets.emit('message-received', people[socketId], msg);
    });

    socket.on('disconnect', function(){
      //DEBUG
      //console.log('User ' + clientIp + ' diconnected');

      socket.broadcast.emit('update', people[socketId] + " has left the chat room.");
      delete people[socketId];
    });
  });

  return chat;
}
