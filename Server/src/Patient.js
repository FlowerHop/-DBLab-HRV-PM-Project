let AliveServiceManager = require ('./HRVlib/AliveService');
(function () {
	class Patient {
		constructor (id) {
            this.id = id;
            this.aliveService = new AliveServiceManager ();
		}

		inputBioSignals (bioSignals) {
			for (var i = 0; i < bioSignals.length; i++) {
				this.aliveService.run (bioSignals[i]);
			}
		}

		getParameters () {
			return this.aliveService.getParameters ();
		}
	}



	module.exports = Patient;
})();