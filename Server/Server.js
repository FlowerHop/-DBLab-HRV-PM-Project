'use strict';

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var queryString = require('querystring');
var request = require('request');
var firebase = require('firebase');

var app = express();
var server = http.createServer(app);
var WebSocket = require('ws');
var wss = new WebSocket.Server({ server: server });
var AliveServiceManager = require('./HRVlib/AliveService');
var StationarySensor = require('./StationarySensor');
var Patient = require('./Patient');

var patients = {};
var stationarySensors = {};

var stationarySensorIDs = [];
var patientIDs = [];
var monitor = {};

firebase.initializeApp({
  apiKey: "AIzaSyAepbb4RlwQQclrz4I2dZjlvgOFun_zO5M",
  authDomain: "healthcare-add09.firebaseapp.com",
  databaseURL: "https://healthcare-add09.firebaseio.com",
  storageBucket: "healthcare-add09.appspot.com",
  messagingSenderId: "898550084069"
});

var auth = firebase.auth();
auth.signInWithEmailAndPassword('l941166@hotmail.com', '55555555').catch(function (err) {
  console.log(err);
});

var database = firebase.database();
var stationarySensorsRef = database.ref('stationarySensors/');
var patientsRef = database.ref('patients/');
var monitorRef = database.ref('monitor/');

stationarySensorsRef.on('value', function (snapShot) {
  stationarySensorIDs = snapShot.val();
  stationarySensorIDs.forEach(function (stationarySensorID) {
    if (!stationarySensors[stationarySensorID.id]) {
      stationarySensors[stationarySensorID.id] = new StationarySensor(stationarySensorID.id);
    }
  });
});

patientsRef.on('value', function (snapShot) {
  patientIDs = [];
  snapShot.val().forEach(function (patient) {
    patientIDs.push(patient.id);
  });

  patientIDs.forEach(function (patientID, index) {
    if (!patients[patientID]) {
      patients[patientID] = new Patient(patientID);
      patients[patientID].name = snapShot.val()[index].name;
      patients[patientID].gender = snapShot.val()[index].gender;
      patients[patientID].age = snapShot.val()[index].age;
    }
  });
});

monitorRef.on('value', function (snapShot) {
  monitor = snapShot.val();
  for (var k in monitor) {
    stationarySensors[k].patient = patients[monitor[k]];
  }
});

wss.on('connection', function (ws) {
  console.log('connection');

  ws.on('message', function (message) {
    if (!message.match) {
      return;
    }
    console.log(message);
    var pattern = /id\/([\w|:|-]+)/;
    var match = message.match(pattern);
    match = match ? match[1] : undefined;
    console.log(match);
    if (match !== undefined) {
      // match = match.match (/([^:]+):([^:]+)/);
      // if (match) {
      var id = match;
      // let port = match[2];
      console.log('Receive a stationary sensor (' + id + ')');

      ws.send('ok');
      var stationarySensor = stationarySensors[id];
      if (stationarySensor) {
        // switch (port) {
        // case 'A':
        stationarySensor.initWS(ws);
        // break;
        // case 'B':
        // stationarySensor.initWS (undefined, ws);
        // break;
        // }
      }
      // }
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

app.get('/test/start/:stationarySensorID', function (req, res) {
  var stationarySensorID = req.params.stationarySensorID;
  stationarySensors[stationarySensorID].start();
  res.send();
});

app.get('/getStationarySensorStatus/:stationarySensorID', function (req, res) {
  var stationarySensorID = req.params.stationarySensorID;
  res.send(stationarySensors[stationarySensorID].isStart);
});

app.get('/updateStationarySensorStatus/:stationarySensorID/:status', function (req, res) {
  var stationarySensorID = req.params.stationarySensorID;
  var status = req.params.status == 'true';

  if (status) {
    stationarySensors[stationarySensorID].start();
  } else {
    stationarySensors[stationarySensorID].stop();
  }

  res.send();
});

app.get('/getParameters/:patientID', function (req, res) {
  var patientID = req.params.patientID;
  res.send(JSON.stringify(patients[patientID].getParameters()));
});

app.get('/getStatus/:patientID', function (req, res) {
  var patientID = req.params.patientID;
  res.send(new String(patients[patientID].getStatus()));
});

app.get('/getHR/:patientID', function (req, res) {
  var patientID = req.params.patientID;
  res.send(new String(patients[patientID].getHR()));
});

app.get('/getRawECGSamples/:patientID', function (req, res) {
  var patientID = req.params.patientID;
  res.send(JSON.stringify(patients[patientID].getRawECGSamples()));
});

app.post('/newStationarySensor/', function (req, res) {
  var stationarySensorID = req.body.stationarySensorID;
  database.ref('stationarySensors/' + stationarySensorIDs.length).set({
    id: stationarySensorID
  });

  var newMonitor = {};
  newMonitor[stationarySensorID] = '無';

  database.ref('monitor/').update(newMonitor);
  // new stationarySensor
  res.send();
});

app.post('/updateMonitor/', function (req, res) {
  var newMonitor = req.body;

  // if change, stop it then update
  for (var k in newMonitor) {
    stationarySensors[k].stop();
  }

  database.ref('monitor/').update(newMonitor);
  res.send();
});

app.post('/removeStationarySensor/', function (req, res) {
  var stationarySensorID = req.body.stationarySensorID;
  stationarySensorIDs.forEach(function (elem, index) {
    if (stationarySensorID == elem.id) {
      stationarySensorIDs.splice(index, 1);
      delete monitor[stationarySensorID];
      database.ref('stationarySensors/').set(stationarySensorIDs);
      database.ref('monitor/').set(monitor);
      res.send();
      return;
    }
  });
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

// app.get ('/getParameters/:id', (req, res) => {
//   // for (let k in patients) {
//   //   let patient = patients[k];
//   //   if (patient.id == req.params.id) {
//   //     res.send (JSON.stringify (patient.getParameters ()));
//   //     return;
//   //   } 
//   // }

//   // need to remove because stationarySensor don't care about parameter
//   let id = req.params.id;
//   if (stationarySensors[id]) {
//     res.send (JSON.stringify (stationarySensors[id].getParameters ()))
//   }
// });

app.get('/getStationarySensorIDs', function (req, res) {
  // let ids = [];
  // stationarySensors.forEach ((stationarySensor) => {
  //   ids.push (stationarySensor.id);
  // });
  res.send(JSON.stringify(stationarySensorIDs));
});

// app.get ('/getStationarySensors', (req, res) => {
//   res.send (JSON.stringify (stationarySensors));
// })

app.get('/getMonitor', function (req, res) {
  res.send(JSON.stringify(monitor));
});

// app.get ('/getPatients', (req, res) => {
//   res.send (JSON.stringify (patients));
// });

app.get('/getPatientIDs', function (req, res) {
  res.send(JSON.stringify(patientIDs));
});

app.get('/getPatient/:patientID', function (req, res) {
  var patientID = req.params.patientID;
  var result = {
    name: patients[patientID].name,
    gender: patients[patientID].gender,
    age: patients[patientID].age
  };
  res.send(JSON.stringify(result));
});

server.listen(app.get('port'), function () {
  console.log('Ready on port: ' + app.get('port'));
});