(function () {
  class WearableSensor {
    constructor (id, patient) {
      this.id = id;
      this.patient = patient;
      this.room = null;
      this.inWC = false;
    }

    woreBy () {
      return this.patient;
    }

    isIn () {
      return this.room;
    }
  }
  module.exports = WearableSensor;
})();