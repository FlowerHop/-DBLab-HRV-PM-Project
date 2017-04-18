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
var Room = require('./Room');
var WearableSensor = require('./WearableSensor');

var patients = {};
var stationarySensors = {};
var wearableSensors = {};
var rooms = {};

var monitor = {};
var wear = {};

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
var wearableSensorsRef = database.ref('wearableSensors/');
var roomsRef = database.ref('rooms/');
var wearRef = database.ref('wear/');

stationarySensorsRef.on('value', function (snapShot) {
  snapShot.val().forEach(function (stationarySensor) {
    if (!stationarySensors[stationarySensor.id]) {
      stationarySensors[stationarySensor.id] = new StationarySensor(stationarySensor.id);
    }
  });
});

patientsRef.on('value', function (snapShot) {
  // patientIDs = [];
  // snapShot.val ().forEach ((patient) => {
  //   patientIDs.push (patient.id);
  // });

  // patientIDs.forEach ((patientID, index) => {
  //   if (!patients[patientID]) {
  //     patients[patientID] = new Patient (patientID);
  //     patients[patientID].name = snapShot.val ()[index].name;
  //     patients[patientID].gender = snapShot.val ()[index].gender;
  //     patients[patientID].age = snapShot.val ()[index].age;
  //   }
  // });

  snapShot.val().forEach(function (patient) {
    if (!patients[patient.id]) {
      patients[patient.id] = new Patient(patient.id);
      patients[patient.id].name = patient.name;
      patients[patient.id].gender = patient.gender;
      patients[patient.id].age = patient.age;
    }
  });
});

monitorRef.on('value', function (snapShot) {
  monitor = snapShot.val();
  for (var k in monitor) {
    stationarySensors[k].patient = patients[monitor[k]];
  }
});

wearableSensorsRef.on('value', function (snapShot) {
  snapShot.val().forEach(function (wearableSensor) {
    if (!wearableSensors[wearableSensor.id]) {
      wearableSensors[wearableSensor.id] = new WearableSensor(wearableSensor.id);
    }
  });
});

roomsRef.on('value', function (snapShot) {
  snapShot.val().forEach(function (room) {
    if (!rooms[room.id]) {
      rooms[room.id] = new Room(room.id);
    }
  });
});

wearRef.on('value', function (snapShot) {
  wear = snapShot.val();
  for (var k in wear) {
    wearableSensors[k].patient = patients[wear[k]];
  }
});

wss.on('connection', function (ws) {
  console.log('connection');

  ws.on('message', function (message) {
    if (!message.match) {
      return;
    }
    var stationarySensorPattern = /stationarySensorID\/([\w|:|-]+)/;
    var roomPattern = /roomID\/([\w|:|-]+)/;

    var stationarySensorMatch = message.match(stationarySensorPattern);
    var roomMatch = message.match(roomPattern);

    stationarySensorMatch = stationarySensorMatch ? stationarySensorMatch[1] : undefined;
    roomMatch = roomMatch ? roomMatch[1] : undefined;

    if (stationarySensorMatch !== undefined) {
      var id = stationarySensorMatch;
      console.log('Receive a stationary sensor (' + id + ')');

      ws.send('ok');
      var stationarySensor = stationarySensors[id];
      if (stationarySensor) {
        stationarySensor.initWS(ws);
      }
    } else if (roomMatch !== undefined) {
      var _id = roomMatch;
      console.log('Receive a room (' + _id + ')');

      ws.send('ok');
      var room = rooms[_id];

      ws.on('message', function (message) {
        message = JSON.parse(message);
        // console.log (message);
        var moveInWC = message.moveInWC;
        if (message.wearableSensorID) {
          console.log(message);
          var wearableSensorID = message.wearableSensorID;
          var hr = message.hr;
          var rssi = message.rssi;

          if (wearableSensors[wearableSensorID]) {
            room.scanMove(moveInWC);
            if (room.scan(wearableSensors[wearableSensorID], rssi)) {
              wearableSensors[wearableSensorID].patient.inputHR(hr);
            }
          }
        } else {
          room.scanMove(moveInWC);
        }
      });
    }
  });
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

app.get('/test/scannedWearableSensor/:roomID/:wearableSensorID/:rssi/:hr/', function (req, res) {
  var roomID = req.params.roomID;
  var wearableSensorID = req.params.wearableSensorID;
  var rssi = req.params.rssi;
  var hr = req.params.hr;

  if (rooms[roomID].scan(wearableSensors[wearableSensorID], rssi)) {
    if (wearableSensors[wearableSensorID].patient) {
      wearableSensors[wearableSensorID].patient.inputHR(hr);
    }
  }

  res.send("roomID: " + roomID + ", wearableSensorID: " + wearableSensorID + ", hr: " + hr);
});

app.get('/getPatientsAtRoom/:roomID', function (req, res) {
  var roomID = req.params.roomID;
  var wearableSensors = rooms[roomID].wearableSensors;
  var patients = [];

  wearableSensors.forEach(function (wearableSensor) {
    var patient = wearableSensor.patient;
    if (patient) {
      patients.push({
        id: patient.id,
        name: patient.name,
        gender: patient.gender,
        age: patient.age,
        hr: patient.hr
      });
    }
  });

  res.send(JSON.stringify(patients));
});

app.get('/getRoomIDs', function (req, res) {
  var roomIDs = [];
  for (var k in rooms) {
    roomIDs.push(k);
  }
  res.send(JSON.stringify(roomIDs));
});

app.get('/getWearableSensorIDs', function (req, res) {
  var wearableSensorIDs = [];
  for (var k in wearableSensors) {
    wearableSensorIDs.push(k);
  }
  res.send(JSON.stringify(wearableSensorIDs));
});

app.get('/getIsInWC/:wearableSensorID', function (req, res) {
  var wearableSensorID = req.params.wearableSensorID;
  res.send(JSON.stringify(wearableSensors[wearableSensorID].inWC));
});

app.get('/getWear', function (req, res) {
  res.send(JSON.stringify(wear));
});

app.post('/updateWear', function (req, res) {
  var newWear = req.body;

  database.ref('wear/').update(newWear);
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

// app.post ('/removeStationarySensor/', (req, res) => {
//   let stationarySensorID = req.body.stationarySensorID;
//   stationarySensorIDs.forEach ((elem, index) => {
//     if (stationarySensorID == elem.id) {
//       stationarySensorIDs.splice (index, 1);
//       delete monitor[stationarySensorID];
//       database.ref ('stationarySensors/').set (stationarySensorIDs);
//       database.ref ('monitor/').set (monitor);
//       res.send ();
//       return;
//     }
//   });
// });

app.get('/newStationarySensor/:id', function (req, res) {
  var id = req.params.id;
  stationarySensors[id] = new StationarySensor(id, { id: '1', name: 'Max' }, { id: '2', name: 'William' });
  stationarySensors[id].patients.forEach(function (patient) {
    patients[patient.id] = patient;
  });
  console.log('new StationarySensor: ' + id);
  res.end();
});

app.get('/getStationarySensorIDs', function (req, res) {
  // let ids = [];
  // stationarySensors.forEach ((stationarySensor) => {
  //   ids.push (stationarySensor.id);
  // });
  var stationarySensorIDs = [];
  for (var k in stationarySensors) {
    stationarySensorIDs.push(k);
  }
  res.send(JSON.stringify(stationarySensorIDs));
});

app.get('/getMonitor', function (req, res) {
  res.send(JSON.stringify(monitor));
});

app.get('/getPatientIDs', function (req, res) {
  var patientIDs = [];
  for (var k in patients) {
    patientIDs.push(k);
  }
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