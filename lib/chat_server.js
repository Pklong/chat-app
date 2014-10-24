var socketio = require('socket.io'),
  _ = require('lodash');

var nicknames = {};
var namesUsed = [];
var currentRoom = {};

var nextGuestName = (function () {
  var guestNumber = 1;
  return function () {
    guestNumber += 1;
    return "Guest" + guestNumber;
  };
}());

var joinRoom = function (socket, io, room) {
  console.log(nicknames[socket.id] + " JOINING ROOM ", room);

  socket.join(room);
  currentRoom[socket.id] = room;

  io.to(room).emit('message', {
    nickname: nicknames[socket.id],
    text: "joined " + room,
    room: room
  });
};

var handleMessages = function (socket, io) {
  socket.on('message', function (data) {
    console.log('message: ', currentRoom[socket.io]);

    io.to(currentRoom[socket.id]).emit('message', {
      nickname: nicknames[socket.id],
      text: data.text,
      room: data.room
    });
  });
};

var handleDisconnection = function (socket, io) {
  socket.on('disconnect', function () {
    var nameIndex = namesUsed.indexOf(nicknames[socket.id]);
    delete namesUsed[nameIndex];
    var leavingRoom = currentRoom[socket.id];

    io.to(leavingRoom).emit('message', {
      text: (nicknames[socket.id] + " is leaving" + leavingRoom + "."),
      room: leavingRoom
    });

    delete nicknames[socket.id];
    delete currentRoom[socket.id];
  });
};

var handleNameChangeRequests = function (socket, io) {
  socket.on('nicknameChangeRequest', function (name) {
    if (name.indexOf('Guest') === 0) {
      socket.emit('nicknameChangeResult', {
        success: false,
        message: 'Names cannot begin with "Guest".'
      });
    } else if (namesUsed.indexOf(name) > -1) {
      socket.emit('nicknameChangeResult', {
        success: false,
        message: 'That name is taken.'
      });
    } else {
      var room = currentRoom[socket.id];
      var previousName = nicknames[socket.id];
      var previousNameIndex = namesUsed.indexOf(previousName);
      namesUsed.push(name);
      nicknames[socket.id] = name;
      delete namesUsed[previousNameIndex];
      io.to(room).emit('nicknameChangeResult', {
        success: true,
        previous: previousName,
        name: name
      });
      io.sockets.emit('roomList', getRoomData(io));
    }
  });
};

var handleRoomChangeRequests = function (socket, io) {
  socket.on('roomChangeRequest', function (room) {
    var oldRoom = currentRoom[socket.id];
    socket.leave(oldRoom);
    joinRoom(socket, io, room);
    io.sockets.emit('roomList', getRoomData(io));
  });
};

var getRoomData = function (io) {
  console.log(io.sockets.connected);
  var roomHash = io.sockets.adapter.rooms;
  var roomData = {};
  for(var room in roomHash) {
    // dont include default rooms of sockets with themselves
    if(io.sockets.connected[room]) continue;

    roomData[room] = [];
    for(var socket in roomHash[room]) {
      roomData[room].push(nicknames[socket]);
    }
  }
  return roomData;
};


var createChatServer = function (server) {
  var io = socketio.listen(server);

  io.sockets.on('connection', function (socket) {
    nicknames[socket.id] = nextGuestName();
    joinRoom(socket, io, "lobby");

    handleMessages(socket, io);
    handleNameChangeRequests(socket, io);
    handleRoomChangeRequests(socket, io);
    handleDisconnection(socket, io);
    io.sockets.emit('roomList', getRoomData(io));
  });
};

module.exports = createChatServer;
