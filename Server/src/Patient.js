let AliveServiceManager = require ('./HRVlib/AliveService');
(function () {
	class Patient {
		constructor (id) {
            this.id = id;
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