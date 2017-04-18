(function () {
  class Room {
    constructor (id) {
      this.id = id;
      this.wearableSensors = [];
      this.rssiMap = {};
      this.ws;
      this.moveInWC = false;
      this.wearableSensorInWC;
    }
    
    scan (wearableSensor, rssi) {
      if (wearableSensor.room == null) { // wearableSensor is not in any place
    	  this.wearableSensors.push (wearableSensor);
        this.rssiMap[wearableSensor.id] = rssi;
        wearableSensor.room = this;
        return true;
      } else if (wearableSensor.room != this) { // place changing algorithm
        let room = wearableSensor.room;
        if (room.rssiMap[wearableSensor.id] > rssi) { // change
          room.wearableSensorMoveOutList (wearableSensor);
          this.wearableSensors.push (wearableSensor);
          this.rssiMap[wearableSensor.id] = rssi;
          wearableSensor.room = this;
          return true;
        }
        return false;
      } else { // update rssi
    	  this.rssiMap[wearableSensor.id] = rssi;
        return true;
      }
    }

    wearableSensorMoveOutList (wearableSensor) {
      for (let i in this.wearableSensors) {
        if (wearableSensor == this.wearableSensors[i]) {
        	this.wearableSensors.splice (i, 1);
        	delete this.rssiMap[wearableSensor.id];
        	break;
        }
      }
    }

    scanMove (moveInWC) {
      if (!this.moveInWC && moveInWC) {
        this.moveInWC = true; // coming
        let wearableSensorInWC;
        let minRSSI = 500;

        this.wearableSensors.forEach ((wearableSensor) => {
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
  }

  

  module.exports = Room;
})();