const express = require('express')
const app = express()
const path = require('path')

app.use(express.static('public'))

const PORT = +process.argv[2] || 1337

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`)
})
