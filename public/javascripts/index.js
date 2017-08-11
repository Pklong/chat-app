document.addEventListener('DOMContentLoaded', () => {
  const socket = require('socket.io-client')()
  const ChatUI = require('./chatUI')
  const myChat = new ChatUI(socket)
  socket.on('nameResult', (result) => {
    let msg
    if (result.success) {
      msg = `Name changed to ${result.name}.`
    } else {
      msg = result.message
    }
    myChat.addMsg(msg)
  })

  socket.on('joinResult', (result) => {
    myChat.setRoom(result.room)
    myChat.addMsg('Room changed.')
  })

  socket.on('message', (message) => {
    myChat.addMsg(message.text)
  })

  socket.on('rooms', (rooms) => {
    myChat.roomList.innerHTML = ''
    rooms.forEach(room => myChat.addRoom(room))
    myChat.roomList.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', (e) => {
        myChat.chat.processCommand(`/join ${li.textContent}`)
        myChat.input.focus()
      })
    })
  })

  setInterval(() => {
    socket.emit('rooms')
  }, 1000)

  myChat.input.focus()
})
