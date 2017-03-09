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

wss.on ('connection', (ws) => {
  console.log ('connection');
  try {
  	ws.on ('message', (message) => {  	
  		var pattern = /id\/(\w+)/;
  		var match = message.match (pattern);
  		var id = match ? match[1] : undefined;

  		if (id !== undefined) {
  		  routers[id] = ws;
  	    console.log ('Receive a router: ' +  message);
  		  ws.send ('ok');	

  		  ws.on ('message', (message) => {
  	       console.log ('Receive from ' + id + ' : ' + message);
  		  });
  		} 
  	});

  	ws.on ('close', () => {
  		for (var i in routers) {
  			if (routers[i] == ws) {
  				ws.send ('close');
  	            console.log (i + ' close');
  				delete routers[i];
  				return;
  			}
  		}
  	});

  	ws.on ('error', (error) => {
  		throw new Error (error);
  	});
  } catch (err) {
    console.log (err);
  }  
});

app.set ('port', process.env.PORT || 1338);
app.use (bodyParser.json ());
app.use ('/', express.static ('public'));



// Additional middleware which will set headers that we need on each request.
app.use ((req, res, next) => {
  // Set permissive CORS header - this allows this server to be used only as
  // an API server in conjunction with something like webpack-dev-server.
  res.setHeader ('Access-Control-Allow-Origin', '*');

  // Disable caching so we'll always get the latest comments.
  res.setHeader ('Cache-Control', 'no-cache');
  next ();
});

app.get ('/helloWorld', (req, res) => {
  res.send ("HelloWorld");
  res.end ();
});

server.listen (app.get ('port'), () => {
  console.log ('Ready on port: ' + app.get ('port'));
});