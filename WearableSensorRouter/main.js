'use strict';

var SerialPort = require('serialport');
var WebSocket = require('ws');

var xbee_api = require('xbee-api');
var C = xbee_api.constants;
var COM_NUM = "/dev/cu.usbserial-A403MPU4"; // mac usb
// const COM_NUM = "/dev/ttyUSB0" // Linux usb
var BAUDRATE = 9600;

var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 1
});

// const serverURL = "ws://140.115.51.30:1338";
var serverURL = "ws://localhost:1338";

var IN_PLACE = process.argv[2];
var isStart = false;

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
    inPlace: IN_PLACE,
    wearableSensorID: signal.wearableSensorID,
    index: signal.index,
    pulse: signal.pulse,
    rssi: rssi,
    gatewayTimestamp: gatewayTimestamp
  };

  if (isStart) {
    ws.send(bioWatchSignal);
  }
});

function packageAnalyzer(data) {
  var wearableSensorID = data.toString('utf-8', 0, 2);
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

// var writeToCSV = (bioWatchSignal) => {
// 	csvStream.write  ({
// 	  inPlace: bioWatchSignal.inPlace,
// 	  wearableSensorID: bioWatchSignal.wearableSensorID,
// 	  index: bioWatchSignal.index,
// 	  pulse: bioWatchSignal.pulse,
// 	  rssi: bioWatchSignal.rssi,
// 	  gatewayTimestamp: bioWatchSignal.gatewayTimestamp,
// 	  gatewayDateAndTime: new Date (bioWatchSignal.gatewayTimestamp)
// 	});
// }