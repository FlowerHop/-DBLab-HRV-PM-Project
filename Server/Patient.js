"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AliveServiceManager = require('./HRVlib/AliveService');
(function () {
											var Patient = function () {
																						function Patient(id) {
																																	_classCallCheck(this, Patient);

																																	this.id = id;
																																	this.aliveService = new AliveServiceManager();
																						}

																						_createClass(Patient, [{
																																	key: "inputBioSignals",
																																	value: function inputBioSignals(bioSignals) {
																																												var mBytesBuffer = new Int8Array(bioSignals);
																																												this.aliveService.run(mBytesBuffer);
																																	}
																						}, {
																																	key: "getParameters",
																																	value: function getParameters() {
																																												var hrv = this.aliveService.getHRV();

																																												var meanRR = 0;

																																												if (hrv.getMeanRR() != 0) {
																																																							meanRR = 1000 * 60. / hrv.getMeanRR();
																																												}

																																												var parameters = {
																																																							rawECGSamples: hrv.rawECGSamples,
																																																							RRs: hrv.getRRs(),
																																																							meanRR: parseInt(meanRR * 100 + 0.5) / 100.,
																																																							RMSSD: parseInt(hrv.getRMSSD() * 100 + 0.5) / 100.,
																																																							SDNN: parseInt(hrv.getSDNN() * 100 + 0.5) / 100.,
																																																							NN50: hrv.getNN50(),
																																																							pNN50: parseInt(hrv.getpNN50() * 10000 + 0.5) / 100.,
																																																							TP: hrv.getTP(),
																																																							LF: hrv.getLF(),
																																																							HF: hrv.getHF()
																																												};

																																												if (hrv.getRRs().length < 32) {
																																																							parameters.isArr = "偵測中";
																																												} else if (meanRR < 50) {
																																																							parameters.isArr = "心跳過緩(Bradycardia)";
																																												} else if (meanRR > 100) {
																																																							parameters.isArr = "心跳過速(Tachycardia)";
																																												} else if (hrv.isArr(32)) {
																																																							parameters.isArr = "心律不整(Irregular rhythm)";
																																												} else {
																																																							parameters.isArr = "心律正常(Regular rhythm)";
																																												}

																																												return parameters;
																																	}
																						}, {
																																	key: "getCSV",
																																	value: function getCSV() {}
																						}, {
																																	key: "writeCSV",
																																	value: function writeCSV() {}
																						}]);

																						return Patient;
											}();

											module.exports = Patient;
})();