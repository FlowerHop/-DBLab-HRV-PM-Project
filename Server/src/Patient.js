let AliveServiceManager = require ('./HRVlib/AliveService');
(function () {
	class Patient {
		constructor (id, name) {
            this.id = id;
            this.name = name;
            this.aliveService = new AliveServiceManager ();
		}

		inputBioSignals (bioSignals) {
			console.log (typeof bioSignals);
			console.log (bioSignals);
			for (var i = 0; i < bioSignals.length; i++) {
				this.aliveService.run (bioSignals[i]);
			}
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