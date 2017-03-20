'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Patient = require('./Patient');

(function () {
  var StationarySensor = function () {
    function StationarySensor(id, patient) {
      _classCallCheck(this, StationarySensor);

      this.id = id;
      this.ws;
      this.patient = patient;
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

    _createClass(StationarySensor, [{
      key: 'initWS',
      value: function initWS(ws) {
        var _this = this;

        if (!this.ws) {
          this.ws = ws;
        }

        this.ws.on('message', function (message) {
          if (_this.patient) {
            _this.patient.inputBioSignals(message);
          }
        });

        this.ws.on('close', function () {
          _this.ws = undefined;
        });
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

    }]);

    return StationarySensor;
  }();

  module.exports = StationarySensor;
})();