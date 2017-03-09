const WebSocket = require ('ws');

const ws = new WebSocket ('ws://140.115.51.30:1338', {
  perMessageDeflate: false
});

let connected = false;
let timer;

ws.on ('open', function () {
  console.log ('connection');
  ws.send ('id/' + process.argv[2]);
});

ws.on ('message', function (message) {
  if (message == 'ok') {
    console.log ('start transform');
    connected = true;
    timer = setInterval (function () {
      ws.send ('rawData');
    }, 1000);
  }
});

ws.on ('close', function () {
  console.log ('close');
});
