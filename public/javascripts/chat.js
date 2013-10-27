var Chat = function(socket){
	this.socket = socket;
}

Chat.prototype.sendMessage = function(text){
	this.socket.emit('message', { text: text });
}

Chat.prototype.processCommand = function(command){
  commandArgs = command.split(' ');
  switch(commandArgs[0]) {
   case 'nick':
     var newName = commandArgs[1];
     this.socket.emit('nicknameChangeRequest', newName);
     console.log("logged nick as ", newName);
     break;
   default:
     this.socket.emit('message', { text: "unrecognized command" });
     break;
  }
}