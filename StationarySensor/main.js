'use strict';

var serialport = require('serialport');
var WebSocket = require('ws');

var serialportNum = process.argv[2];
var id = process.argv[3];
var option = process.argv[4];

var wsA = void 0;
var wsB = void 0;

var serial = new serialport('/dev/rfcomm' + serialportNum, { baudrate: 9600 });
serial.on('open', function (err) {
  if (err) {
    console.log(err);
    return;
  }
});

switch (option) {
  case 'A':
    initWS(wsA, 'A');
    break;
  case 'B':
    initWS(wsB, 'B');
    break;
  case 'Both':
    initWS(wsA, 'A');
    initWS(wsB, 'B');
    break;
}

function initWS(ws, num) {
  ws = new WebSocket('ws://140.115.51.30:1338', {
    perMessageDeflate: false
  });

  ws.on('open', function () {
    console.log('connection');
    ws.send('id/' + id + ':' + num);
  });

  ws.on('message', function (message) {
    if (message == 'ok') {
      console.log('start transform');
      serial.on('data', function (data) {
        ws.send(data);
      });
    }
  });

  ws.on('close', function () {
    console.log('close');
  });
}