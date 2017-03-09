const express = require ('express');
const http = require ('http');
const bodyParser = require ('body-parser');
const queryString = require ('querystring');
const request = require ('request');

const app = express ();
const server = http.createServer (app);
const WebSocket = require ('ws');
const wss = new WebSocket.Server ({ server });
let routers = {};
let patients = {};

wss.on ('connection', function (ws) {
  console.log ('connection');
  
  ws.on ('message', function (message) {  	
  	var pattern = /id\/(\w+)/;
  	var id = message.match (pattern);
  	if (id) {
  	  routers[id] = ws;
      console.log ('Receive a router: ' +  message);
  	  ws.send ('ok');	
  	}
  });

  ws.on ('close', function () {
  	for (var i in routers) {
  		if (routers[i] == ws) {
  			ws.send ('close');
  			delete routers[i];
  			return;
  		}
  	}
  });
  
});

app.set ('port', process.env.PORT || 1338);
app.use (bodyParser.json ());
app.use ('/', express.static ('public'));



// Additional middleware which will set headers that we need on each request.
app.use (function (req, res, next) {
  // Set permissive CORS header - this allows this server to be used only as
  // an API server in conjunction with something like webpack-dev-server.
  res.setHeader ('Access-Control-Allow-Origin', '*');

  // Disable caching so we'll always get the latest comments.
  res.setHeader ('Cache-Control', 'no-cache');
  next ();
});

app.get ('/helloWorld', function (req, res) {
  res.send ("HelloWorld");
  res.end ();
});

server.listen (app.get ('port'), function () {
  console.log ('Ready on port: ' + app.get ('port'));
});