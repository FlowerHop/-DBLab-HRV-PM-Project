const serialport = require ('serialport');
const WebSocket = require ('ws');

let serialportNum = process.argv[2];
let id = process.argv[3];
let option = process.argv[4];

let wsA;
let wsB;

let serial = new serialport ('/dev/rfcomm' + serialportNum, {baudrate: 9600});
serial.on ('open', (err) => {
  if (err) {
    console.log (err);
    return;
  }
}); 

switch (option) {
  case 'A':
    init (wsA, 'A');
    break;
  case 'B':
    init (wsB, 'B');
    break;
  case 'Both':    
    init (wsA, 'A');
    init (wsB, 'B');
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
        ws.send (data);
      });
    }
  });

  ws.on ('close', function () {
    console.log ('close');
  });
}




