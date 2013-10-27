var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
//-----Router and Route Handlers

var serveFile = function(response, absPath){
	console.log("serving file at ", absPath);
	fs.readFile(absPath, function(err, data) {
		if (err) {
			console.log("ERROR LOGGED: ", err);
			serveError(response, 500);
		} else {
			response.writeHead(
				200,
				{"Content-Type": mime.lookup(path.basename(absPath))});
			response.end(data);	
		}
	})
};

var serveError = function(response, errorCode){
  var message;
  if (errorCode === 404){
    message = 'Error 404: resource not found.';
  } else if (errorCode === 500){
    message = 'Error 500: there was a problem serving the requested file.';
  } else {
    message = 'Error: there was a problem.';    
  }
  response.writeHead(errorCode, {"Content-Type": "text/plain"});
  response.write(message);
	response.end();
}

var router = function(request, response){
	var url = request.url;
	console.log(url);
	if (url === "/"){
		serveFile(response, "public/index.html");
	} else {
	  fs.exists((url), function(err, data){
			if (err) {
				serveError(response, 404);
			} else {
				serveFile(response, ("public" + url));
			} // end inner if/else
	  }); // end outer fs.exists callback
	} // end outer if/else
} // end router function

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