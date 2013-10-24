var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

//-----Router

//-----Route Handlers
//TODO: write route handlers

var serveRoot = function(response){
	
};

var serveFile(response, url){
	
};


var serve404(response){
	
};

var router = function(request, response){
	var url = request.url;
	
	if (url === "/"){
		serveRoot(response);
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
	//TODO: pass to router.
}).listen(8080);

console.log('Server running at http://127.0.0.1.:8080/');