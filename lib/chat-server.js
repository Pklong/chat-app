var socketio = require('socket.io');

var socketIOListen = function(server){
	var io = socketio.listen(server);
	
	io.sockets.on('connection', function(socket){
		socket.on('message', function (data) {
			console.log(data.text);
		});
	});
}


exports.socketIOListen = socketIOListen;