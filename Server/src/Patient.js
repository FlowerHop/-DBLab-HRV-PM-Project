let AliveServiceManager = require ('./HRVlib/AliveService');
(function () {
	class Patient {
		constructor (id) {
            this.id = id;
            this.aliveService = new AliveServiceManager ();
		}

		inputBioSignals (bioSignals) {
			var mBytesBuffer = new Int8Array (bioSignals);
			this.aliveService.run (mBytesBuffer);
		}

		getParameters () {
			let hrv = this.aliveService.getHRV ();

			let meanRR = 0;
            
            if (hrv.getMeanRR () != 0) {
              meanRR = (1000*60.)/hrv.getMeanRR ();
            }

			let parameters = {
              rawECGSamples: hrv.rawECGSamples,
              RRs: hrv.getRRs (),
              meanRR: parseInt(meanRR*100+0.5)/(100.),
              RMSSD: parseInt(hrv.getRMSSD ()*100+0.5)/(100.),
              SDNN: parseInt(hrv.getSDNN ()*100+0.5)/(100.),
              NN50: hrv.getNN50(),
              pNN50: (parseInt(hrv.getpNN50()*10000+0.5)/100.),
              TP: hrv.getTP (),
              LF: hrv.getLF (),
              HF: hrv.getHF ()
			};

            if (hrv.getRRs ().length < 32) {
              parameters.isArr = "偵測中";
			} else if (meanRR < 50) {
              parameters.isArr = "心跳過緩(Bradycardia)";
			} else if (meanRR > 100) {
              parameters.isArr = "心跳過速(Tachycardia)";
			} else if (hrv.isArr (32)) {
              parameters.isArr = "心律不整(Irregular rhythm)";
			} else {
              parameters.isArr = "心律正常(Regular rhythm)";
			}

			return parameters;
		}

		getCSV () {

		}

		writeCSV () {

		}
	}
	module.exports = Patient;
})();