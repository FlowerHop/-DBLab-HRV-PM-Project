const serialport = require ('serialport');
const WebSocket = require ('ws');

let serialportNum = process.argv[2];
let id = process.argv[3];
let option = process.argv[4];

let wsA;
let wsB;

let serial = new serialport ('/dev/ttyACM' + serialportNum, {baudrate: 9600});

serial.on ('open', (err) => {
  if (err) {
    console.log (err);
    return;
  }
}); 

switch (option) {
  case 'A':
    initWS (wsA, 'A');
    break;
  case 'B':
    initWS (wsB, 'B');
    break;
  case 'Both':    
    initWS (wsA, 'A');
    initWS (wsB, 'B');
    break;
}

function initWS (ws, num) {
  ws = new WebSocket ('ws://140.115.51.30:1338', {
    perMessageDeflate: false
  });

  ws.on ('open', () => {
    console.log ('connection');
    ws.send ('id/' + id + ':' + num);
  });

  ws.on ('message', (message) => {
    if (message == 'ok') {
      console.log ('start transform');
      serial.on ('data', (data) => {
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
      });
    }
  });

  ws.on ('close', function () {
    console.log ('close');
  });
}




