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

let patients = {};
let stationarySensors = {}; 

let stationarySensorIDs = [];
let patientIDs = [];
let monitor = {};

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

stationarySensorsRef.on ('value', (snapShot) => {
  stationarySensorIDs = snapShot.val ();
  stationarySensorIDs.forEach ((stationarySensorID) => {
    if (!stationarySensors[stationarySensorID.id]) {
      stationarySensors[stationarySensorID.id] = new StationarySensor (stationarySensorID.id);
    }
  });
});

patientsRef.on ('value', (snapShot) => {
  patientIDs = [];
  snapShot.val ().forEach ((patient) => {
    patientIDs.push (patient.id);
  });

  patientIDs.forEach ((patientID, index) => {
    if (!patients[patientID]) {
      patients[patientID] = new Patient (patientID);
      patients[patientID].name = snapShot.val ()[index].name;
      patients[patientID].gender = snapShot.val ()[index].gender;
      patients[patientID].age = snapShot.val ()[index].age;
    }
  });
});

monitorRef.on ('value', (snapShot) => {
  monitor = snapShot.val ();
  for (var k in monitor) {
    stationarySensors[k].patient = patients[monitor[k]];
  }
});




wss.on ('connection', (ws) => {
  console.log ('connection');
  
  ws.on ('message', (message) => { 
    if (!message.match) {
      return;
    } 	
  	let pattern = /id\/([\w|:|-]+)/;
  	let match = message.match (pattern);
  	match = match ? match[1] : undefined;
  	if (match !== undefined) {
      let id = match;
      console.log ('Receive a stationary sensor (' +  id + ')');
        
      ws.send ('ok');         
      let stationarySensor = stationarySensors[id];
      if (stationarySensor) {
        stationarySensor.initWS (ws);
      }
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

app.get ('/test/start/:stationarySensorID', (req, res) => {
  let stationarySensorID = req.params.stationarySensorID;
  stationarySensors[stationarySensorID].start ();
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

app.post ('/removeStationarySensor/', (req, res) => {
  let stationarySensorID = req.body.stationarySensorID;
  stationarySensorIDs.forEach ((elem, index) => {
    if (stationarySensorID == elem.id) {
      stationarySensorIDs.splice (index, 1);
      delete monitor[stationarySensorID];
      database.ref ('stationarySensors/').set (stationarySensorIDs);
      database.ref ('monitor/').set (monitor);
      res.send ();
      return;
    }
  });
});

app.get ('/newStationarySensor/:id', (req, res) => {
  let id = req.params.id;
  stationarySensors[id] = new StationarySensor (id, { id: '1', name: 'Max'}, { id: '2', name: 'William'});
  stationarySensors[id].patients.forEach ((patient) => {
    patients[patient.id] = patient;
  });
  console.log ('new StationarySensor: ' + id);
  res.end ();
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

app.get ('/getStationarySensorIDs', (req, res) => {
  // let ids = [];
  // stationarySensors.forEach ((stationarySensor) => {
  //   ids.push (stationarySensor.id);
  // });
  res.send (JSON.stringify (stationarySensorIDs));
});

// app.get ('/getStationarySensors', (req, res) => {
//   res.send (JSON.stringify (stationarySensors));
// })

app.get ('/getMonitor', (req, res) => {
  res.send (JSON.stringify (monitor));
})

// app.get ('/getPatients', (req, res) => {
//   res.send (JSON.stringify (patients));
// });

app.get ('/getPatientIDs', (req, res) => {
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