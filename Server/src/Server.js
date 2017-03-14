const express = require ('express');
const http = require ('http');
const bodyParser = require ('body-parser');
const queryString = require ('querystring');
const request = require ('request');

const app = express ();
const server = http.createServer (app);
const WebSocket = require ('ws');
const wss = new WebSocket.Server ({ server });
const AliveServiceManager = require ('./HRVlib/AliveService');
let StationarySensor = require ('./StationarySensor');
let routers = {};
let patients = {};
let stationarySensors = {}; 

wss.on ('connection', (ws) => {
  console.log ('connection');
  
  ws.on ('message', (message) => { 
    if (!message.match) {
      return;
    } 	
  	let pattern = /id\/([\w|:]+)/;
  	let match = message.match (pattern);
  	match = match ? match[1] : undefined;

  	if (match !== undefined) {
  	 match = match.match (/([^:]+):([^:]+)/);
  	  if (match) {
        let id = match[1];
        let port = match[2];
        console.log ('Receive a stationary sensor (' +  id + ') port (' + port + ')');
        
        ws.send ('ok');         
        let stationarySensor = stationarySensors[id];
        if (stationarySensor) {
        	switch (port) {
               case 'A':
                 stationarySensor.initWS (ws, undefined);
                 break;
               case 'B':
                 stationarySensor.initWS (undefined, ws);
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

app.get ('/newStationarySensor/:id', (req, res) => {
  let id = req.params.id;
  stationarySensors[id] = new StationarySensor (id, { id: '1', name: 'Max'}, { id: '2', name: 'William'});
  stationarySensors[id].patients.forEach ((patient) => {
    patients[patient.id] = patient;
  });
  console.log ('new StationarySensor: ' + id);
  res.end ();
});

app.get ('/getParameters/:id', (req, res) => {
  // for (let k in patients) {
  //   let patient = patients[k];
  //   if (patient.id == req.params.id) {
  //     res.send (JSON.stringify (patient.getParameters ()));
  //     return;
  //   } 
  // }
  if (stationarySensors[id]) {
    res.send (JSON.stringify (stationarySensors[id].getParameters ()))
  }
});

app.get ('/getStationarySensorIDs', (req, res) => {
  let ids = [];
  stationarySensors.forEach ((stationarySensor) => {
    ids.push (stationarySensor.id);
  });
  res.send (JSON.stringify (ids));
});

app.get ('/getStationarySensors', (req, res) => {
  res.send (JSON.stringify (stationarySensors));
})

app.get ('/getPatients', (req, res) => {
  res.send (JSON.stringify (patients));
});

server.listen (app.get ('port'), () => {
  console.log ('Ready on port: ' + app.get ('port'));
});