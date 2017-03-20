'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AliveServiceManager = require('./HRVlib/AliveService');
(function () {
	var Patient = function () {
		function Patient(id) {
			_classCallCheck(this, Patient);

			this.id = id;
			this.aliveService = new AliveServiceManager();
			this.parameters = this.aliveService.getParameters();
		}

		_createClass(Patient, [{
			key: 'inputBioSignals',
			value: function inputBioSignals(bioSignals) {
				var mBytesBuffer = new Int8Array(bioSignals);
				this.aliveService.run(mBytesBuffer);
			}
		}, {
			key: 'getParameters',
			value: function getParameters() {
				return this.aliveService.getParameters();
			}
		}, {
			key: 'getCSV',
			value: function getCSV() {}
		}, {
			key: 'writeCSV',
			value: function writeCSV() {}
		}]);

		return Patient;
	}();

	module.exports = Patient;
})();