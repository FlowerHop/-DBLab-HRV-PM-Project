'use strict';

var WebSocket = require('ws');

var ws = new WebSocket('ws://140.115.51.30:1338', {
  perMessageDeflate: false
});

var connected = false;

ws.on('open', function () {
  console.log('connection');
  ws.send({ id: process.argv[2] });
});

ws.on('message', function (message) {
  if (connected) {
    ws.send('raw data');
  }if (message == 'ok') {
    connected = true;
  }
});

ws.on('close', function () {
  console.log('close');
});