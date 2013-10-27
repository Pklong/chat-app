var socketio = require('socket.io');
var _ = require('lodash');
var guestnumber = 1;
var nicknames = {};
var namesUsed = [];
var currentRooms = {};

var assignGuestName = function(socket, io) {
  var guestName = "Guest" + guestnumber;
  guestnumber += 1;
  nicknames[socket.id] = guestName;
}

var joinRoom = function(socket, io, room) {
  console.log("JOINING ROOM ", room);
  socket.join(room);
  currentRooms[socket.id] = room;
  io.sockets.in(room).emit('message', {
    text: (nicknames[socket.id] + " has joined " + room + "."),
    room: room
  });
}

var handleMessages = function(socket, io) {
  socket.on('message', function (data) {
		console.log("server received message: ", data.text);
		console.log("data looks like this: ", data);
	  io.sockets.in(data.room).emit('message', {
	    text: (nicknames[socket.id] + ":" + data.text),
	    room: data.room
	  })
	});
}

var handleDisconnection = function(socket, io) {
  socket.on('disconnect', function() {
    var nameIndex = namesUsed.indexOf(nicknames[socket.id]);
    delete namesUsed[nameIndex];
    var leavingRoom = currentRooms[socket.id];
    io.sockets.in(leavingRoom).emit('message', {
      text: (nicknames[socket.id] + " is leaving" + leavingRoom + "."),
      room: leavingRoom
    })
    delete nicknames[socket.id];
    delete currentRooms[socket.id];
    // io.sockets.emit('roomList', getRoomData(io));
  })
}

var handleNameChangeRequests = function(socket, io) {
  socket.on('nicknameChangeRequest', function(name) {
    if (name.indexOf('Guest') === 0) {
      socket.emit('nicknameChangeResult', {
        success: false,
        message: 'Names cannot begin with "Guest".'
      });
    } else if (namesUsed.indexOf(name) > -1){
      socket.emit('nicknameChangeResult', {
        success: false,
        message: 'That name is taken.'
      });
    } else {
      var room = currentRooms[socket.id];
      var previousName = nicknames[socket.id];
      var previousNameIndex = namesUsed.indexOf(previousName);
      namesUsed.push(name);
      nicknames[socket.id] = name;
      delete namesUsed[previousNameIndex];
      io.sockets.in(room).emit('nicknameChangeResult', {
        success: true,
        text: (previousName + " is now known as " + name + "."),
        name: name
      });
      io.sockets.emit('roomList', getRoomData(io));
    }
  })
}

var handleRoomChangeRequests = function(socket, io){
  socket.on('roomChangeRequest', function(room) {
    var oldRoom = currentRooms[socket.id];
    socket.leave(oldRoom);
    joinRoom(socket, io, room);
    io.sockets.emit('roomList', getRoomData(io));
  })
}

var getRoomData = function(io){
  var roomHash = io.sockets.manager.rooms;
  var roomData = {};
  _.each(_.keys(roomHash), function(key){
    console.log("looking for users in room ", key);
    var socketIDs = roomHash[key];
    console.log("these are their ids: ", socketIDs);
    var usernames = _.map(socketIDs, function(id){
      return nicknames[id];
    });
    console.log("these are their usernames", usernames);
    console.log("this is the nicknames hash: ", nicknames);
    roomData[key] = usernames;
  });
  return roomData;
}

var socketIOListen = function(server){
	var io = socketio.listen(server);
	
	io.sockets.on('connection', function(socket){
		console.log("received connection from: ", socket.id);
    assignGuestName(socket, io);
    joinRoom(socket, io, "lobby");
    handleMessages(socket, io);
    handleNameChangeRequests(socket, io);
    handleRoomChangeRequests(socket, io);
    handleDisconnection(socket, io);
    io.sockets.emit('roomList', getRoomData(io));
	});
}


exports.socketIOListen = socketIOListen;