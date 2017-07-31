const express = require('express')
const app = express()
const http = require('http').Server(app)
const path = require('path')
const chat = require('./chatServer')(http)

const PORT = 8000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

const sockets = []

chat.on('connection', (socket) => {
  console.log('connected')
  sockets.push(socket)
  socket.on('message', (data) => {
    console.log(`message: ${data}`)
    sockets.forEach(s => s.emit('message', data))
  })
})

http.listen(PORT, () => {
  console.log(`listening on ${PORT}`)
})
