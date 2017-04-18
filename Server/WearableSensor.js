"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  var WearableSensor = function () {
    function WearableSensor(id, patient) {
      _classCallCheck(this, WearableSensor);

      this.id = id;
      this.patient = patient;
      this.room = null;
      this.inWC = false;
    }

    _createClass(WearableSensor, [{
      key: "woreBy",
      value: function woreBy() {
        return this.patient;
      }
    }, {
      key: "isIn",
      value: function isIn() {
        return this.room;
      }
    }]);

    return WearableSensor;
  }();

  module.exports = WearableSensor;
})();