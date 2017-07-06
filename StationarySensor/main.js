'use strict';

var serialport = require('serialport');
var WebSocket = require('ws');

var serialportNum = process.argv[2];
var id = process.argv[3];

var ws = void 0;
var isStart = false;
// let serial = new serialport ('/dev/ttyACM' + serialportNum, {baudrate: 9600});
var serial = new serialport('/dev/cu.usbmodem1421', { baudRate: 9600 });

serial.on('open', function (err) {
  if (err) {
    console.log(err);
    return;
  }
});

ws = new WebSocket('ws://140.115.51.30:1338', {
  // ws = new WebSocket ('ws://localhost:1338', {
  perMessageDeflate: false
});

ws.on('open', function () {
  console.log('connection');
  ws.send('stationarySensorID/' + id);
});

ws.on('message', handleInit);

function handleInit(message) {
  // console.log ('handleInit: ' + message);
  if (message == 'ok') {
    ws.removeEventListener('message', handleInit);
    ws.on('message', atMode);
  }
};

function atMode(cmd) {
  if (cmd == 'start') {
    console.log('receive start');
    isStart = true;
  } else if (cmd == 'stop') {
    console.log('receive stop');
    isStart = false;
  }
}

serial.on('data', function (data) {
  if (isStart) {
    var d = data.toString('utf-8');
    var results = d.match(/(\[[^\[|^\]]+\])/g);
    var packet = [];

    for (var i in results) {
      var result = results[i].match(/\[([^\[|^\]]+)\]/)[1];
      if (result !== 'e') {
        packet.push((result - 3300 / 10000) / 10);
      }
    }

    if (packet.length != 0) {
      ws.send(packet);
    }
  }
});

ws.on('close', function () {
  console.log('close');
});