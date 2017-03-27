let Patient = require ('./Patient');

(function () {
  class StationarySensor {
  	constructor (id, patient) {
      this.id = id;
      this.ws;
      this.patient = patient;
      this.isStart = false;
  		// this.wss = new Array (2);
  		// this.patients = [arguments[1] ? new Patient (arguments[1].id, arguments[1].name) : arguments[0], 
  			               // arguments[2] ? new Patient (arguments[2].id, arguments[2].name) : arguments[1]];
  	    // future: when server restarts, newing a Patient should be after checking past record if exists
  	}
    
    // initWS (wsA, wsB) { // init when this.wss[index] === undefined
    //     for (let i = 0; i < this.wss.length; i++) {
    //     	if (!this.wss[i] && arguments[i]) {
    //             this.wss[i] = arguments[i];
    //             this.wss[i].on ('message', (message) => {
    //               // console.log ('Port :' + ((i == 0) ? 'A' : 'B') + ': ' + message);
    //               // input signals
    //               this.patients[i].inputBioSignals (message);
    //             });

    //             this.wss[i].on ('close', () => {
    //             	this.wss[i] = undefined;
    //             });
    //     	}
    //     }
    // }

    initWS (ws) {
      if (!this.ws) {
        this.ws = ws;
      }

      this.ws.on ('message', (message) => {
        if (this.patient) {
          this.patient.inputBioSignals (message)        
        }
      });

      this.ws.on ('close', () => {
        this.ws = undefined;
        this.isStart = false;
      });
    }

    start () {
      if (this.ws) {
        if (this.isStart) {
          // console.log ('It has been activated.');
        } else {
          this.isStart = true;
          this.ws.send ('start');
        }
      }
    }

    stop () {
      if (this.ws) {
        if (!this.isStart) {
          // console.log ('It has been shut down.');
        } else {
          this.isStart = false;
          this.ws.send ('stop');
        }
      }
    }


    // getParameters () {
    //     let parameters = [];

    //     this.patients.forEach ((patient) => {
    //       parameters.push ({
    //         id: patient.id, 
    //         name: patient.name,
    //         parameters: patient.getParameters ()
    //       });  
    //     });

    //     return parameters;
    // }
  }

  module.exports = StationarySensor;
})();