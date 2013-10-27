var http = require('http');
var router = require('./router.js').router;

//-----The Static Server
var httpServer = http.createServer(function (request, response) {
	router(request, response);
});

var port = 8080;

httpServer.listen(port);

console.log('Server running at http://localhost:' + port + '/');

//-----Piggyback the socketIOServer on the HTTP server
var socketIOListen = require('./lib/chat-server.js').socketIOListen;

socketIOListen(httpServer);