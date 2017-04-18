'use strict';

var SerialPort = require('serialport');
var WebSocket = require('ws');
var RPIO = require('rpio');
var xbee_api = require('xbee-api');
var C = xbee_api.constants;
// const COM_NUM = "/dev/cu.usbserial-A403MPU4"; // mac usb
var COM_NUM = "/dev/ttyUSB0"; // Linux usb
var BAUDRATE = 9600;

var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 1
});

var serverURL = "ws://140.115.51.30:1338";
// const serverURL = "ws://localhost:1338";

var IN_PLACE = process.argv[2];
var isStart = false;

RPIO.open(11, RPIO.INPUT);
var isThere = false;

var ws = new WebSocket(serverURL, { perMessageDeflate: false });

var serialport = new SerialPort(COM_NUM, {
  baudrate: BAUDRATE,
  parser: xbeeAPI.rawParser()
});

serialport.on("open", function () {
  var frame_obj = {
    type: C.FRAME_TYPE.AT_COMMAND,
    command: "NI",
    commandParameter: []
  };
});

xbeeAPI.on("frame_object", function (frame) {
  console.log(">>", frame);

  var rssi = frame.rssi;
  var gatewayTimestamp = new Date().getTime();
  var signal = packageAnalyzer(frame.data);

  var bioWatchSignal = {
    roomID: IN_PLACE,
    wearableSensorID: signal.wearableSensorID,
    index: signal.index,
    hr: signal.pulse,
    rssi: rssi,
    gatewayTimestamp: gatewayTimestamp,
    moveInWC: isThere
  };

  ws.send(JSON.stringify(bioWatchSignal));
});

function packageAnalyzer(data) {
  var wearableSensorID = "WS-" + String.fromCharCode(new String(data.readUIntBE(1, 1)).charCodeAt(0) + 16 - 3);
  var index = data.readUIntBE(2, 5);
  var pulse = data.readUIntBE(7, 1);

  return {
    wearableSensorID: wearableSensorID,
    pulse: pulse,
    index: index
  };
};

function handleInit(message) {
  if (message == 'ok') {
    ws.removeEventListener('message', handleInit);
    ws.on('message', atMode);

    setInterval(function () {
      isThere = RPIO.read(11);
      ws.send(JSON.stringify({ moveInWC: isThere }));
    }, 20);
  }
}

function atMode(cmd) {
  if (cmd == 'start') {
    console.log('receive start');
    isStart = true;
  } else if (cmd == 'stop') {
    console.log('receive stop');
    isStart = false;
  }
}

ws.on('open', function () {
  console.log('connection');
  ws.send('roomID/' + IN_PLACE);
});

ws.on('message', handleInit);

ws.on('close', function () {
  console.log('close');
});