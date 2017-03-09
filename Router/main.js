'use strict';

var serialport = require('serialport');
var WebSocket = require('ws');

var port = new serial('/dev/rfcomm', { baudrate: 9600 });

var ws = new WebSocket('ws://140.115.51.30:1338', {
  perMessageDeflate: false
});

port.on('open', function (err) {
  if (err) {
    console.log(err);
    return;
  }
});

ws.on('open', function () {
  console.log('connection');
  ws.send('id/' + process.argv[2]);
});

ws.on('message', function (message) {
  if (message == 'ok') {
    console.log('start transform');
    port.on('data', function (data) {
      ws.send(data);
    });
  }
});

ws.on('close', function () {
  console.log('close');
});