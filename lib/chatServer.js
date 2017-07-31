const io = require('socket.io')

function createChatServer (server) {
  return io(server)
}

module.exports = createChatServer
