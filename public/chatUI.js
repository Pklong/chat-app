const Chat = require('./chat')

function ChatUI (socket) {
  this.chat = new Chat(socket)
  this.form = document.querySelector('form')
  this.msgList = document.querySelector('ul')
  this.input = document.querySelector('input')
  this.submitHandler()
  this.messageHandler()
}

ChatUI.prototype.getInput = function () {
  return this.input.value
}

ChatUI.prototype.sendMsg = function () {
  this.chat.sendMessage(this.getInput())
}

ChatUI.prototype.addMsg = function (msg) {
  const newMessage = document.createElement('li')
  newMessage.textContent = msg
  this.msgList.appendChild(newMessage)
}

ChatUI.prototype.submitHandler = function () {
  this.form.addEventListener('submit', (e) => {
    e.preventDefault()
    this.sendMsg()
    this.input.value = ''
  })
}

ChatUI.prototype.messageHandler = function () {
  this.chat.socket.on('message', (msg) => {
    this.addMsg(msg)
  })
}

module.exports = ChatUI
