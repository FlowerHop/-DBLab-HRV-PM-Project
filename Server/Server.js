'use strict';

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var queryString = require('querystring');
var request = require('request');

var app = express();
var server = http.createServer(app);
var WebSocket = require('ws');
var wss = new WebSocket.Server({ server: server });
var AliveServiceManager = require('./HRVlib/AliveService');
var StationarySensor = require('./StationarySensor');
var routers = {};
var patients = {};
var stationarySensors = {};

wss.on('connection', function (ws) {
  console.log('connection');

  ws.on('message', function (message) {
    if (!message.match) {
      return;
    }
    var pattern = /id\/([\w|:]+)/;
    var match = message.match(pattern);
    match = match ? match[1] : undefined;

    if (match !== undefined) {
      match = match.match(/([^:]+):([^:]+)/);
      if (match) {
        var id = match[1];
        var port = match[2];
        console.log('Receive a stationary sensor (' + id + ') port (' + port + ')');

        ws.send('ok');
        var stationarySensor = stationarySensors[id];
        if (stationarySensor) {
          switch (port) {
            case 'A':
              stationarySensor.initWS(ws, undefined);
              break;
            case 'B':
              stationarySensor.initWS(undefined, ws);
              break;
          }
        }
      }
      // // routers[id] = ws; new Stationary sensor
      // ws.send ('ok');
      //  let service = new AliveServiceManager ();
      // ws.on ('message', (message) => {
      //    for (let i = 0; i < message.length; i++) {
      //        service.run(message[i]);    
      //    }
      // });
    }
  });

  // ws.on ('close', () => {
  // 	for (var i in routers) {
  // 		if (routers[i] == ws) {
  //             console.log (i + ' close');
  // 			delete routers[i];
  // 			return;
  // 		}
  // 	}
  // });
});

app.set('port', process.env.PORT || 1338);
app.use(bodyParser.json());
app.use('/', express.static('public'));

// Additional middleware which will set headers that we need on each request.
app.use(function (req, res, next) {
  // Set permissive CORS header - this allows this server to be used only as
  // an API server in conjunction with something like webpack-dev-server.
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Disable caching so we'll always get the latest comments.
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

app.get('/helloWorld', function (req, res) {
  res.send("HelloWorld");
  res.end();
});

app.get('/newStationarySensor/:id', function (req, res) {
  var id = req.params.id;
  stationarySensors[id] = new StationarySensor(id, { id: '1', name: 'Max' }, { id: '2', name: 'William' });
  stationarySensors[id].patients.forEach(function (patient) {
    patients[patient.id] = patient;
  });
  console.log('new StationarySensor: ' + id);
  res.end();
});

app.get('/getParameters/:id', function (req, res) {
  // for (let k in patients) {
  //   let patient = patients[k];
  //   if (patient.id == req.params.id) {
  //     res.send (JSON.stringify (patient.getParameters ()));
  //     return;
  //   } 
  // }
  var id = req.params.id;
  if (stationarySensors[id]) {
    res.send(JSON.stringify(stationarySensors[id].getParameters()));
  }
});

app.get('/getStationarySensorIDs', function (req, res) {
  var ids = [];
  stationarySensors.forEach(function (stationarySensor) {
    ids.push(stationarySensor.id);
  });
  res.send(JSON.stringify(ids));
});

app.get('/getStationarySensors', function (req, res) {
  res.send(JSON.stringify(stationarySensors));
});

app.get('/getPatients', function (req, res) {
  res.send(JSON.stringify(patients));
});

server.listen(app.get('port'), function () {
  console.log('Ready on port: ' + app.get('port'));
});