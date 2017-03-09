'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var queryString = require('querystring');
var request = require('request');

var app = express();
var server = http.createServer(app);
var WebSocket = require('ws');
var wss = new WebSocket.Server({ server: server });
var AliveServiceManager = require('./HRVlib/AliveService');
var routers = {};
var patients = {};

wss.on('connection', function (ws) {
  console.log('connection');

  ws.on('message', function (message) {
    if (!message.match) {
      return;
    }
    var pattern = /id\/(\w+)/;
    var match = message.match(pattern);

    var id = match ? match[1] : 'undefined';

    if (id !== 'undefined') {
      routers[id] = ws;
      console.log('Receive a router: ' + message);
      ws.send('ok');
      var service = new AliveServiceManager();
      ws.on('message', function (message) {
        console.log(typeof message === 'undefined' ? 'undefined' : _typeof(message));
        if (message instanceof ArrayBuffer) {
          var mBytesBuffer = new Int8Array(message);
          for (var i = 0; i < mBytesBuffer.length; i++) {
            service.run(mBytesBuffer[i]);
          }
        }
      });
    }
  });

  ws.on('close', function () {
    for (var i in routers) {
      if (routers[i] == ws) {
        console.log(i + ' close');
        delete routers[i];
        return;
      }
    }
  });
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