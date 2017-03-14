'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Patient = require('./Patient');

(function () {
  var StationarySensor = function () {
    function StationarySensor() {
      _classCallCheck(this, StationarySensor);

      this.wss = new Array(2);
      this.patients = [arguments[0] ? new Patient(arguments[0].id, arguments[0].name) : arguments[0], arguments[1] ? new Patient(arguments[1].id, arguments[1].name) : arguments[1]];
      // future: when server restarts, newing a Patient should be after checking past record if exists
    }

    _createClass(StationarySensor, [{
      key: 'initWS',
      value: function initWS(wsA, wsB) {
        var _this = this,
            _arguments = arguments;

        var _loop = function _loop(i) {
          if (!_this.wss[i] && _arguments[i]) {
            _this.wss[i] = _arguments[i];
            _this.wss[i].on('message', function (message) {
              // console.log ('Port :' + ((i == 0) ? 'A' : 'B') + ': ' + message);
              // input signals
              _this.patients[i].inputBioSignals(message);
            });

            _this.wss[i].on('close', function () {
              _this.wss[i] = undefined;
            });
          }
        };

        // init when this.wss[index] === undefined
        for (var i = 0; i < this.wss.length; i++) {
          _loop(i);
        }
      }
    }, {
      key: 'getParameters',
      value: function getParameters() {
        var parameters = [];

        this.patients.forEach(function (patient) {
          parameters.push({
            id: patient.id,
            name: patient.name,
            parameters: patient.getParameters()
          });
        });

        return parameters;
      }
    }]);

    return StationarySensor;
  }();

  module.exports = StationarySensor;
})();