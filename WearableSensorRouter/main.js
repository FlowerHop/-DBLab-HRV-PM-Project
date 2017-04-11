'use strict';

const SerialPort = require ('serialport');
const WebSocket = require ('ws');

const xbee_api = require ('xbee-api');
const C = xbee_api.constants;
const COM_NUM = "/dev/cu.usbserial-A403MPU4"; // mac usb
// const COM_NUM = "/dev/ttyUSB0" // Linux usb
const BAUDRATE = 9600;

const xbeeAPI = new xbee_api.XBeeAPI ({
  api_mode: 1
});

// const serverURL = "ws://140.115.51.30:1338";
const serverURL = "ws://localhost:1338";

const IN_PLACE = process.argv[2];
let isStart = false;

let ws = new WebSocket (serverURL, { perMessageDeflate: false });

const serialport = new SerialPort (COM_NUM, {
    baudrate: BAUDRATE, 
    parser: xbeeAPI.rawParser ()
});

serialport.on ("open", () => {
    let frame_obj = {
      type: C.FRAME_TYPE.AT_COMMAND,
      command: "NI",
      commandParameter: []
    };
});

xbeeAPI.on ("frame_object", (frame) => {
  console.log (">>", frame);
    
    let rssi = frame.rssi;
    let gatewayTimestamp = new Date ().getTime ();
    let signal = packageAnalyzer (frame.data);
  
  let bioWatchSignal = {
    roomID: IN_PLACE,
    wearableSensorID: signal.wearableSensorID,
    index: signal.index,
    hr: signal.pulse,
    rssi: rssi,
    gatewayTimestamp: gatewayTimestamp
  };

  // if (isStart) {
  ws.send (bioWatchSignal);
  // }
});

function packageAnalyzer (data) {
  let wearableSensorID = data.toString ('utf-8', 0, 2);
  let index = data.readUIntBE (2, 5);
  let pulse = data.readUIntBE (7, 1);
  
  return {
    wearableSensorID: wearableSensorID, 
    pulse: pulse,
    index: index
  };
};

function handleInit (message) {
  if (message == 'ok') {
    ws.removeEventListener ('message', handleInit);
    ws.on ('message', atMode);
  }
}

function atMode (cmd) {
  if (cmd == 'start') {
    console.log ('receive start');
    isStart = true;
  } else if (cmd == 'stop') {
    console.log ('receive stop');
    isStart = false;
  }
}

ws.on ('open', () => {
  console.log ('connection');
  ws.send ('roomID/' + IN_PLACE);
});

ws.on ('message', handleInit);

ws.on ('close', () => {
  console.log ('close');
});

