var express = require('express');
var http = require('http');


var app = express();

// Create an HTTP service.
var server = http.createServer(app).listen(80, function(){
	var host = server.address().address;
	var port = server.address().port;

	console.log('Started server listening at http://%s:%s', host, port);
});


app.get('*', function (req, res) {
	res.sendFile( __dirname + '/index.html');
});
