'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AliveServiceManager = require('./HRVlib/AliveService');
(function () {
	var Patient = function () {
		function Patient(id, name) {
			_classCallCheck(this, Patient);

			this.id = id;
			this.name = name;
			this.aliveService = new AliveServiceManager();
		}

		_createClass(Patient, [{
			key: 'inputBioSignals',
			value: function inputBioSignals(bioSignals) {
				console.log(typeof bioSignals === 'undefined' ? 'undefined' : _typeof(bioSignals));
				console.log(bioSignals);
				for (var i = 0; i < bioSignals.length; i++) {
					this.aliveService.run(bioSignals[i]);
				}
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