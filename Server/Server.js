'use strict';

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var queryString = require('querystring');
var request = require('request');

var app = express();
var server = http.createServer(app);
var WebSocket = require('ws');
var wss = new WebSocket.Server({ server: server });
var routers = {};
var patients = {};

wss.on('connection', function (ws) {
  console.log('connection');
  try {
    ws.on('message', function (message) {
      var pattern = /id\/(\w+)/;
      var match = message.match(pattern);
      var id = match ? match[1] : undefined;

      if (id) {
        routers[id] = ws;
        console.log('Receive a router: ' + message);
        ws.send('ok');

        ws.on('message', function (message) {
          console.log('Receive from ' + id + ' : ' + message);
        });
      }
    });

    ws.on('close', function () {
      for (var i in routers) {
        if (routers[i] == ws) {
          ws.send('close');
          console.log(i + ' close');
          delete routers[i];
          return;
        }
      }
    });
  } catch (err) {
    console.log(err);
  }
});

app.set('port', process.env.PORT || 1338);
app.use(bodyParser.json());
app.use('/', express.static('public'));

// Additional middleware which will set headers that we need on each request.
app.use(function (req, res, next) {
  // Set permissive CORS header - this allows this server to be used only as
  // an API server in conjunction with something like webpack-dev-server.
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Disable caching so we'll always get the latest comments.
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

app.get('/helloWorld', function (req, res) {
  res.send("HelloWorld");
  res.end();
});

server.listen(app.get('port'), function () {
  console.log('Ready on port: ' + app.get('port'));
});