"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  var Room = function () {
    function Room(id) {
      _classCallCheck(this, Room);

      this.id = id;
      this.wearableSensors = [];
      this.rssiMap = {};
      this.ws;
      this.moveInWC = false;
      this.wearableSensorInWC;
    }

    _createClass(Room, [{
      key: "scan",
      value: function scan(wearableSensor, rssi) {
        if (wearableSensor.room == null) {
          // wearableSensor is not in any place
          this.wearableSensors.push(wearableSensor);
          this.rssiMap[wearableSensor.id] = rssi;
          wearableSensor.room = this;
          return true;
        } else if (wearableSensor.room != this) {
          // place changing algorithm
          var room = wearableSensor.room;
          if (room.rssiMap[wearableSensor.id] > rssi) {
            // change
            room.wearableSensorMoveOutList(wearableSensor);
            this.wearableSensors.push(wearableSensor);
            this.rssiMap[wearableSensor.id] = rssi;
            wearableSensor.room = this;
            return true;
          }
          return false;
        } else {
          // update rssi
          this.rssiMap[wearableSensor.id] = rssi;
          return true;
        }
      }
    }, {
      key: "wearableSensorMoveOutList",
      value: function wearableSensorMoveOutList(wearableSensor) {
        for (var i in this.wearableSensors) {
          if (wearableSensor == this.wearableSensors[i]) {
            this.wearableSensors.splice(i, 1);
            delete this.rssiMap[wearableSensor.id];
            break;
          }
        }
      }
    }, {
      key: "scanMove",
      value: function scanMove(moveInWC) {
        if (!this.moveInWC && moveInWC) {
          this.moveInWC = true; // coming
          var wearableSensorInWC = void 0;
          var minRSSI = 500;

          this.wearableSensors.forEach(function (wearableSensor) {
            rssi = rssiMap[wearableSensor.id];
            if (rssi < minRSSI) {
              minRSSI = rssi;
              wearableSensorInWC = wearableSensor;
            }
          });

          if (wearableSensorInWC) {
            if (this.wearableSensorInWC) {
              this.wearableSensorInWC.inWC = false; // move out the bigger rssi one
            }

            this.wearableSensorInWC = wearableSensorInWC;
            this.wearableSensorInWC.inWC = true;
          }
        } else if (this.moveInWC && !moveInWC) {
          this.moveInWC = false; // left
          this.wearableSensorInWC.inWC = false;
          this.wearableSensorInWC = undefined;
        }
      }
    }]);

    return Room;
  }();

  module.exports = Room;
})();