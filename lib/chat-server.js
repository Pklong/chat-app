var socketio = require('socket.io');
var guestnumber = 1;
var nicknames = {};
var namesUsed = [];

var assignGuesName = function(socket, io) {
  var guestName = "Guest" + guestnumber;
  guestnumber += 1;
  nicknames[socket.id] = guestName;
  io.sockets.emit('message', { text: (guestName + " has joined.")});
}

var handleMessages = function(socket, io) {
  socket.on('message', function (data) {
		console.log("server received message: ", data.text);
		console.log("data looks like this: ", data);
		if(data.text.indexOf("/nick") === 0){
		  //TODO: handle commands
		} else {
      io.sockets.emit('message', {
        text: (nicknames[socket.id] + ":" + data.text)
      });
		}
	});
}

var handleDisconnection = function(socket, io) {
  socket.on('disconnect', function() {
    var nameIndex = namesUsed.indexOf(nicknames[socket.id]);
    delete namesUsed[nameIndex];
    io.sockets.emit('message', {
      text: (nicknames[socket.id] + " is leaving the room.")
    })
    delete nicknames[socket.id];
  })
}

var handleNameChangeRequests = function(socket) {
  socket.on('nicknameChangeRequest', function(name) {
    if (name.indexOf('Guest') === 0) {
      socket.emit('nicknameChangeResult', {
        success: false,
        message: 'Names cannot begin with "Guest".'
      });
    } else if (namesUsed.indexOf(name) === -1){
      socket.emit('nicknameChangeResult', {
        success: false,
        message: 'That name is taken.'
      });
    } else {
      var previousName = nickNames[socket.id];
      var previousNameIndex = namesUsed.indexOf(previousName);
      namesUsed.push(name);
      nickNames[socket.id] = name;
      delete namesUsed[previousNameIndex];
      io.sockets.emit('nicknameChangeResult', {
        success: true,
        name: name
      })
    }
  })
}

var socketIOListen = function(server){
	var io = socketio.listen(server);
	
	io.sockets.on('connection', function(socket){
		console.log("received connection from: ", socket.remoteAddress);
    assignGuesName(socket, io);
    handleMessages(socket, io);
    handleNameChangeRequests(socket, io);
    handleDisconnection(socket, io);
	});
}


exports.socketIOListen = socketIOListen;