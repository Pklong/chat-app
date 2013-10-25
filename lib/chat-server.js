var io = require('socket.io');

var socketIOListen = function(server){
	io.listen(server);
	
	io.sockets.on('connection', function(socket){
		socket.on('message', function (data) {
			console.log(data.text);
		});
	});
}


exports('socketIOListen') = socketIOListen;