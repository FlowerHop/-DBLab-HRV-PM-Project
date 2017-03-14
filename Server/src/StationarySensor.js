let Patient = require ('./Patient');

(function () {
  class StationarySensor {
  	constructor (id) {
      this.id = id;
  		this.wss = new Array (2);
  		this.patients = [arguments[1] ? new Patient (arguments[1].id, arguments[1].name) : arguments[0], 
  			               arguments[2] ? new Patient (arguments[2].id, arguments[2].name) : arguments[1]];
  	    // future: when server restarts, newing a Patient should be after checking past record if exists
  	}
    
    initWS (wsA, wsB) { // init when this.wss[index] === undefined
        for (let i = 0; i < this.wss.length; i++) {
        	if (!this.wss[i] && arguments[i]) {
                this.wss[i] = arguments[i];
                this.wss[i].on ('message', (message) => {
                  // console.log ('Port :' + ((i == 0) ? 'A' : 'B') + ': ' + message);
                  // input signals
                  console.log (message);
                  this.patients[i].inputBioSignals (message);
                });

                this.wss[i].on ('close', () => {
                	this.wss[i] = undefined;
                });
        	}
        }
    }

    getParameters () {
        let parameters = [];

        this.patients.forEach ((patient) => {
          parameters.push ({
            id: patient.id, 
            name: patient.name,
            parameters: patient.getParameters ()
          });  
        });

        return parameters;
    }
  }

  module.exports = StationarySensor;
})();