var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

//-----Router

//-----Route Handlers
//TODO: write route handlers

var serveFile = function(response, absPath){
	console.log("serving file at ", absPath);
	fs.readFile(absPath, function(err, data) {
		if (err) {
			console.log(err);
			serve404(response);
		} else {
			response.writeHead(
				200,
				{"content-type": mime.lookup(path.basename(absPath))});
			response.end(data);	
		}
	})
};


var serve404 = function(response){
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
};

var router = function(request, response){
	var url = request.url;
	console.log(url);
	if (url === "/"){
		serveFile(response, "public/index.html");
	} else if (fs.exists(url, function(err, data){
		if (err) {
			serve404(response);
		} else {
			serveFile(response, url);
		}
	}));
}

//-----The Static Server
http.createServer(function (request, response) {
	router(request, response);
}).listen(8080);

console.log('Server running at http://127.0.0.1:8080/');