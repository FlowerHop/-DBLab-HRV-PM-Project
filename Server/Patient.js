"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AliveServiceManager = require('./HRVlib/AliveService');
(function () {
  var Patient = function () {
    function Patient(id) {
      _classCallCheck(this, Patient);

      this.id = id;
      this.hr = "---";
      // this.aliveService = new AliveServiceManager ();
    }

    _createClass(Patient, [{
      key: "inputECGSamples",
      value: function inputECGSamples(ecgSamples) {
        var mBytesBuffer = new Int8Array(ecgSamples);

        if (!this.aliveService) {
          this.aliveService = new AliveServiceManager();
        }

        this.aliveService.run(mBytesBuffer);
      }
    }, {
      key: "inputHR",
      value: function inputHR(hr) {
        this.hr = hr;
      }
    }, {
      key: "getStatus",
      value: function getStatus() {
        if (this.aliveService) {
          var hrv = this.aliveService.getHRV();
          var meanRR = 0;
          var status = 0;

          if (hrv.getMeanRR() != 0) {
            meanRR = 1000 * 60. / hrv.getMeanRR();
          }

          if (hrv.getRRs().length < 32) {
            status = -1;
          } else if (meanRR < 50) {
            status = 1; // 心跳過緩(Bradycardia)
          } else if (meanRR > 100) {
            status = 1; // 心跳過速(Tachycardia)
          } else if (hrv.isArr(32)) {
            status = 2; // 心律不整(Irregular rhythm)
          } else {
            status = 0; // 心律正常(Regular rhythm)
          }

          return status;
        } else return -1;
      }
    }, {
      key: "getRawECGSamples",
      value: function getRawECGSamples() {
        if (this.aliveService) {
          var hrv = this.aliveService.getHRV();
          return hrv.rawECGSamples;
        }
        return [];
      }
    }, {
      key: "getHR",
      value: function getHR() {
        if (this.aliveService) {
          var hrv = this.aliveService.getHRV();
          return hrv.HR;
        }

        return this.hr;
      }
    }, {
      key: "getParameters",
      value: function getParameters() {
        if (this.aliveService) {
          var hrv = this.aliveService.getHRV();

          var meanRR = 0;

          if (hrv.getMeanRR() != 0) {
            meanRR = 1000 * 60. / hrv.getMeanRR();
          }

          var parameters = {
            meanRR: parseInt(meanRR * 100 + 0.5) / 100.,
            RMSSD: parseInt(hrv.getRMSSD() * 100 + 0.5) / 100.,
            SDNN: parseInt(hrv.getSDNN() * 100 + 0.5) / 100.,
            NN50: hrv.getNN50(),
            pNN50: parseInt(hrv.getpNN50() * 10000 + 0.5) / 100.,
            TP: hrv.getTP(),
            LF: hrv.getLF(),
            HF: hrv.getHF(),
            ratio: 0
          };

          if (parameters.HF != 0) {
            parameters.ratio = parameters.LF / parameters.HF;
          }

          return parameters;
        }

        return {};
      }
    }, {
      key: "getCSV",
      value: function getCSV() {}
    }, {
      key: "writeCSV",
      value: function writeCSV() {}
    }]);

    return Patient;
  }();

  module.exports = Patient;
})();