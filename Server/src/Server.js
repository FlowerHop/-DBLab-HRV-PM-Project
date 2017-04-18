const express = require ('express');
const http = require ('http');
const bodyParser = require ('body-parser');
const queryString = require ('querystring');
const request = require ('request');
const firebase = require ('firebase');

const app = express ();
const server = http.createServer (app);
const WebSocket = require ('ws');
const wss = new WebSocket.Server ({ server });
const AliveServiceManager = require ('./HRVlib/AliveService');
let StationarySensor = require ('./StationarySensor');
let Patient = require ('./Patient');
let Room = require ('./Room');
let WearableSensor = require ('./WearableSensor');

let patients = {};
let stationarySensors = {}; 
let wearableSensors = {};
let rooms = {};

let monitor = {};
let wear = {};

firebase.initializeApp({
  apiKey: "AIzaSyAepbb4RlwQQclrz4I2dZjlvgOFun_zO5M",
  authDomain: "healthcare-add09.firebaseapp.com",
  databaseURL: "https://healthcare-add09.firebaseio.com",
  storageBucket: "healthcare-add09.appspot.com",
  messagingSenderId: "898550084069"
});

let auth = firebase.auth ();
auth.signInWithEmailAndPassword ('l941166@hotmail.com', '55555555').catch (function (err) {
 console.log (err);
});

let database = firebase.database ();
let stationarySensorsRef = database.ref ('stationarySensors/');
let patientsRef = database.ref ('patients/');
let monitorRef = database.ref ('monitor/');
let wearableSensorsRef = database.ref ('wearableSensors/');
let roomsRef = database.ref ('rooms/');
let wearRef = database.ref ('wear/');

stationarySensorsRef.on ('value', (snapShot) => {
  snapShot.val ().forEach ((stationarySensor) => {
    if (!stationarySensors[stationarySensor.id]) {
      stationarySensors[stationarySensor.id] = new StationarySensor (stationarySensor.id);
    }
  });
});

patientsRef.on ('value', (snapShot) => {
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

  snapShot.val ().forEach ((patient) => {
    if (!patients[patient.id]) {
      patients[patient.id] = new Patient (patient.id);
      patients[patient.id].name = patient.name;
      patients[patient.id].gender = patient.gender;
      patients[patient.id].age = patient.age;
    }
  });
});

monitorRef.on ('value', (snapShot) => {
  monitor = snapShot.val ();
  for (let k in monitor) {
    stationarySensors[k].patient = patients[monitor[k]];
  }
});

wearableSensorsRef.on ('value', (snapShot) => {
  snapShot.val ().forEach ((wearableSensor) => {
    if (!wearableSensors[wearableSensor.id]) {
      wearableSensors[wearableSensor.id] = new WearableSensor (wearableSensor.id);
    }
  });
});

roomsRef.on ('value', (snapShot) => {
  snapShot.val ().forEach ((room) => {
    if (!rooms[room.id]) {
      rooms[room.id] = new Room (room.id);
    }
  });
});

wearRef.on ('value', (snapShot) => {
  wear = snapShot.val ();
  for (let k in wear) {
    wearableSensors[k].patient = patients[wear[k]];
  }
});


wss.on ('connection', (ws) => {
  console.log ('connection');
  
  ws.on ('message', (message) => { 
    if (!message.match) {
      return;
    } 	
  	let stationarySensorPattern = /stationarySensorID\/([\w|:|-]+)/;
    let roomPattern = /roomID\/([\w|:|-]+)/;

  	let stationarySensorMatch = message.match (stationarySensorPattern);
    let roomMatch = message.match (roomPattern);

  	stationarySensorMatch = stationarySensorMatch ? stationarySensorMatch[1] : undefined;
    roomMatch = roomMatch ? roomMatch[1] : undefined;

  	if (stationarySensorMatch !== undefined) {
      let id = stationarySensorMatch;
      console.log ('Receive a stationary sensor (' +  id + ')');
        
      ws.send ('ok');         
      let stationarySensor = stationarySensors[id];
      if (stationarySensor) {
        stationarySensor.initWS (ws);
      }
  	} else if (roomMatch !== undefined) {
      let id = roomMatch;
      console.log ('Receive a room (' +  id + ')');
        
      ws.send ('ok');         
      let room = rooms[id];
      
      ws.on ('message', (message) => {
        message = JSON.parse (message);
        console.log (message);
        if (message.wearableSensorID) {
          let wearableSensorID = message.wearableSensorID;
          let hr = message.hr;
          let rssi = message.rssi;
          let moveInWC = message.moveInWC;

          if (wearableSensors[wearableSensorID]) {
            room.scanMove (moveInWC);
            if (room.scan (wearableSensors[wearableSensorID], rssi)) {
              wearableSensors[wearableSensorID].patient.inputHR (pulse);
            }
          }
        } else {
          room.scanMove (moveInWC);
        }
      });
    }
  });
});

app.set ('port', process.env.PORT || 1338);
app.use (bodyParser.json ());
app.use ('/', express.static ('public'));

// Additional middleware which will set headers that we need on each request.
app.use ((req, res, next) => {
  // Set permissive CORS header - this allows this server to be used only as
  // an API server in conjunction with something like webpack-dev-server.
  res.setHeader ('Access-Control-Allow-Origin', '*');

  // Disable caching so we'll always get the latest comments.
  res.setHeader ('Cache-Control', 'no-cache');
  next ();
});

app.get ('/helloWorld', (req, res) => {
  res.send ("HelloWorld");
  res.end ();
});

app.get ('/test/scannedWearableSensor/:roomID/:wearableSensorID/:rssi/:hr/', (req, res) => {
  let roomID = req.params.roomID;
  let wearableSensorID = req.params.wearableSensorID;
  let rssi = req.params.rssi;
  let hr = req.params.hr;

  if (rooms[roomID].scan (wearableSensors[wearableSensorID], rssi)) {
    if (wearableSensors[wearableSensorID].patient) {
      wearableSensors[wearableSensorID].patient.inputHR (hr);
    }
  }

  res.send ("roomID: " + roomID 
    + ", wearableSensorID: " + wearableSensorID
    + ", hr: " + hr);
});

app.get ('/getPatientsAtRoom/:roomID', (req, res) => {
  let roomID = req.params.roomID;
  let wearableSensors = rooms[roomID].wearableSensors;
  let patients = [];

  wearableSensors.forEach ((wearableSensor) => {
    let patient = wearableSensor.patient;
    if (patient) {
      patients.push ({
        id: patient.id,
        name: patient.name,
        gender: patient.gender,
        age: patient.age,
        hr: patient.hr
      });
    }
  });

  res.send (JSON.stringify (patients));
});

app.get ('/getRoomIDs', (req, res) => {
  let roomIDs = [];
  for (let k in rooms) {
    roomIDs.push (k);
  }
  res.send (JSON.stringify (roomIDs));
});

app.get ('/getWearableSensorIDs', (req, res) => {
  let wearableSensorIDs = [];
  for (let k in wearableSensors) {
    wearableSensorIDs.push (k);
  }
  res.send (JSON.stringify (wearableSensorIDs));
});

app.get ('/getIsInWC/:wearableSensorID', (req, res) => {
  let wearableSensorID = req.params.wearableSensorID;
  res.send (JSON.stringify (wearableSensors[wearableSensorID].inWC));

});

app.get ('/getWear', (req, res) => {
  res.send (JSON.stringify (wear));
});

app.post ('/updateWear', (req, res) => {
  let newWear = req.body;

  database.ref ('wear/').update (newWear);
  res.send ();
});

app.get ('/getStationarySensorStatus/:stationarySensorID', (req, res) => {
  let stationarySensorID = req.params.stationarySensorID;
  res.send (stationarySensors[stationarySensorID].isStart);
});

app.get ('/updateStationarySensorStatus/:stationarySensorID/:status', (req ,res) => {
  let stationarySensorID = req.params.stationarySensorID;
  let status = (req.params.status == 'true');

  if (status) {
    stationarySensors[stationarySensorID].start ();
  } else {
    stationarySensors[stationarySensorID].stop ();
  }

  res.send ();
});

app.get ('/getParameters/:patientID', (req, res) => {
  let patientID = req.params.patientID;
  res.send (JSON.stringify (patients[patientID].getParameters ()));
});

app.get ('/getStatus/:patientID', (req, res) => {
  let patientID = req.params.patientID;
  res.send (new String (patients[patientID].getStatus ()));
});

app.get ('/getHR/:patientID', (req, res) => {
  let patientID = req.params.patientID;
  res.send (new String (patients[patientID].getHR ()));
});

app.get ('/getRawECGSamples/:patientID', (req, res) => {
  let patientID = req.params.patientID;
  res.send (JSON.stringify (patients[patientID].getRawECGSamples ()));
});

app.post ('/newStationarySensor/', (req, res) => {
  let stationarySensorID = req.body.stationarySensorID;
  database.ref ('stationarySensors/' + stationarySensorIDs.length).set ({
    id: stationarySensorID
  });

  let newMonitor = {};
  newMonitor[stationarySensorID] = '無';

  database.ref ('monitor/').update (newMonitor);
  // new stationarySensor
  res.send ();
});

app.post ('/updateMonitor/', (req, res) => {
  let newMonitor = req.body;

  // if change, stop it then update
  for (let k in newMonitor) {
    stationarySensors[k].stop ();
  }

  database.ref ('monitor/').update (newMonitor);
  res.send ();
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

app.get ('/newStationarySensor/:id', (req, res) => {
  let id = req.params.id;
  stationarySensors[id] = new StationarySensor (id, { id: '1', name: 'Max'}, { id: '2', name: 'William'});
  stationarySensors[id].patients.forEach ((patient) => {
    patients[patient.id] = patient;
  });
  console.log ('new StationarySensor: ' + id);
  res.end ();
});

app.get ('/getStationarySensorIDs', (req, res) => {
  // let ids = [];
  // stationarySensors.forEach ((stationarySensor) => {
  //   ids.push (stationarySensor.id);
  // });
  let stationarySensorIDs = [];
  for (let k in stationarySensors) {
    stationarySensorIDs.push (k);
  }
  res.send (JSON.stringify (stationarySensorIDs));
});

app.get ('/getMonitor', (req, res) => {
  res.send (JSON.stringify (monitor));
})

app.get ('/getPatientIDs', (req, res) => {
  let patientIDs = [];
  for (let k in patients) {
    patientIDs.push (k);
  }
  res.send (JSON.stringify (patientIDs));
});

app.get ('/getPatient/:patientID', (req, res) => {
  let patientID = req.params.patientID;
  let result = {
    name: patients[patientID].name,
    gender: patients[patientID].gender,
    age: patients[patientID].age
  };
  res.send (JSON.stringify (result));
});

server.listen (app.get ('port'), () => {
  console.log ('Ready on port: ' + app.get ('port'));
});