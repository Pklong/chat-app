var Chat = function(socket){
	this.socket = socket;
}

Chat.prototype.sendMessage = function(text){
	this.socket.emit('message', { text: text });
}

