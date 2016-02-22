var express = require('express');
var http = require('http');
var path = require("path");


var app = express();
app.use(express.static('.')); // set public all the files in the folder

// Create an HTTP service.
var server = http.createServer(app).listen(8080, function(){
	var host = server.address().address;
	var port = server.address().port;

	console.log('Started server listening at http://%s:%s', host, port);
});


// anything that is not a static file (since main folder is public) will receive index.html
app.get('*', function (req, res) { 
	res.sendFile(path.join(__dirname+'/index.html'));
});
