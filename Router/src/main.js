const serialport = require ('serialport');
const WebSocket = require ('ws');

let port = new serial ('/dev/rfcomm', {baudrate: 9600});

const ws = new WebSocket ('ws://140.115.51.30:1338', {
  perMessageDeflate: false
});

port.on ('open', (err) => {
  if (err) {
    console.log (err);
    return;
  }
}); 

ws.on ('open', () => {
  console.log ('connection');
  ws.send ('id/' + process.argv[2]);
});

ws.on ('message', (message) => {
  if (message == 'ok') {
    console.log ('start transform');
    port.on ('data', function (data) {
      ws.send (data);
    });
  }
});

ws.on ('close', function () {
  console.log ('close');
});
