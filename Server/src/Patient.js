let AliveServiceManager = require ('./HRVlib/AliveService');
(function () {
	class Patient {
		constructor (id, name) {
            this.id = id;
            this.name = name;
            this.aliveService = new AliveServiceManager ();
            this.parameters = this.aliveService.getParameters ();
		}

		inputBioSignals (bioSignals) {
			var mBytesBuffer = new Int8Array (bioSignals);
			this.aliveService.run (mBytesBuffer);
		}

		getParameters () {
			return this.aliveService.getParameters ();
		}

		getCSV () {

		}

		writeCSV () {

		}
	}
	module.exports = Patient;
})();