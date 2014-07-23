var http = require('http'),
  static = require('node-static'),
  file = new static.Server('./public');

var httpServer = http.createServer(function (request, response) {
  request.addListener('end', function () {
    file.serve(request, response);
  }).resume();
});

httpServer.listen(3000);

var createChatServer = require('./chat_server.js');
createChatServer(httpServer);
