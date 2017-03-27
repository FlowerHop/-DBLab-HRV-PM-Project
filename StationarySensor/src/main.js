const serialport = require ('serialport');
const WebSocket = require ('ws');

let serialportNum = process.argv[2];
let id = process.argv[3];

let ws;
let isStart = false;
// let serial = new serialport ('/dev/ttyACM' + serialportNum, {baudrate: 9600});
let serial = new serialport ('/dev/cu.usbmodem1421', {baudRate: 9600});

serial.on ('open', (err) => {
  if (err) {
    console.log (err);
    return;
  }
}); 

ws = new WebSocket ('ws://localhost:1338', {
  perMessageDeflate: false
});

ws.on ('open', () => {
  console.log ('connection');
  ws.send ('id/' + id);
});

ws.on ('message', handleInit);

function handleInit (message) {
  // console.log ('handleInit: ' + message);
  if (message == 'ok') {
    ws.removeEventListener ('message', handleInit);
    ws.on ('message', atMode);
  }
}; 

function atMode (cmd) {
  if (cmd == 'start') {
    // console.log ('receive start');
    isStart = true;
  } else if (cmd == 'stop') {
    // console.log ('receive stop');
    isStart = false;
  }
}


serial.on ('data', (data) => {
  if (isStart) {
    let d = data.toString ('utf-8');
    let results = d.match (/(\[[^\[|^\]]+\])/g);
    let packet = [];
    
    for (let i in results) {
      let result = results[i].match (/\[([^\[|^\]]+)\]/)[1];
      if (result !== 'e') {
        packet.push ((result - 3300/10000)/10);
      }
    } 

    if (packet.length != 0) {
      ws.send (packet);
    }
  }
});

ws.on ('close', function () {
  console.log ('close');
});





