let Patient = require ('./Patient');

(function () {
  class StationarySensor {
  	constructor () {
  		this.wss = new Array (2);
  		this.patients = [arguments[0] ? new Patient (arguments[0]) : arguments[0], 
  			               arguments[1] ? new Patient (arguments[1]) : arguments[1]];
  	    // future: when server restarts, newing a Patient should be after checking past record if exists
  	}
    
    initWS (wsA, wsB) { // init when this.wss[index] === undefined
        for (let i = 0; i < this.wss.length; i++) {
        	if (!this.wss[i] && arguments[i]) {
                this.wss[i] = arguments[i];
                this.wss[i].on ('message', (message) => {
                  console.log ('Port :' + ((i == 0) ? 'A' : 'B') + ': ' + message);
                  // input signals
                  this.patients[i].inputBioSignals (message);
                });

                this.wss[i].on ('close', () => {
                	this.wss[i] = undefined;
                });
        	}
        }
    }

    getParameters () {
        let parameters = "";
        if (this.patients[0]) {
          parameters += this.patients[0].getParameters ();
        } 

        if (this.patients[1]) {
          parameters += this.patients[1].getParameters ();
        }

        return parameters;
    }
  }

  module.exports = StationarySensor;
})();