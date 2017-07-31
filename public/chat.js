function Chat (socket) {
  this.socket = socket
}

Chat.prototype.sendMessage = function (msg) {
  this.socket.emit('message', msg)
}

module.exports = Chat
