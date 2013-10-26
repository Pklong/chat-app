var socketio = require('socket.io');

var socketIOListen = function(server){
	var io = socketio.listen(server);
	
	io.sockets.on('connection', function(socket){
		console.log("received connection from: ", socket.remoteAddress);
		socket.on('message', function (data) {
			console.log("server received message: ", data.text);
			io.sockets.emit('message', data);
		});
	});
}


exports.socketIOListen = socketIOListen;