let Patient = require ('./Patient');

(function () {
  class StationarySensor {
  	constructor (id, patient) {
      this.id = id;
      this.ws;
      this.patient = patient;
      this.isStart = false;
  	    // future: when server restarts, newing a Patient should be after checking past record if exists
  	}

    initWS (ws) {
      if (!this.ws) {
        this.ws = ws;
      }

      this.ws.on ('message', (message) => {
        if (this.patient) {
          this.patient.inputECGSamples (message)        
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
  }

  module.exports = StationarySensor;
})();