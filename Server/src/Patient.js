let AliveServiceManager = require ('./HRVlib/AliveService');
(function () {
	class Patient {
		constructor (id) {
      this.id = id;
      this.hr = "---";
      // this.aliveService = new AliveServiceManager ();
		}

		inputECGSamples (ecgSamples) {
			let mBytesBuffer = new Int8Array (ecgSamples);

      if (!this.aliveService) {
        this.aliveService = new AliveServiceManager ();
      }

			this.aliveService.run (mBytesBuffer);
		}

    inputHR (hr) {  
      this.hr = hr;
    }
        
    getStatus () {
      if (this.aliveService) {
        let hrv = this.aliveService.getHRV ();
        let meanRR = 0;
        let status = 0;

        if (hrv.getMeanRR () != 0) {
          meanRR = (1000*60.)/hrv.getMeanRR ();
        }

        if (hrv.getRRs ().length < 32) {
          status = -1;
        } else if (meanRR < 50) {
          status = 1; // 心跳過緩(Bradycardia)
        } else if (meanRR > 100) {
          status = 1; // 心跳過速(Tachycardia)
        } else if (hrv.isArr (32)) {
          status = 2; // 心律不整(Irregular rhythm)
        } else {
          status = 0; // 心律正常(Regular rhythm)
        }

        return status;
      } else return -1;
    }
        
    getRawECGSamples () {
      if (this.aliveService) {
        let hrv = this.aliveService.getHRV ();
        return hrv.rawECGSamples;  
      }
      return [];
    }

    getHR () {
      if (this.aliveService) {
        let hrv = this.aliveService.getHRV ();
        return hrv.HR;
      }
      
      return this.hr;
    }

		getParameters () {
      if (this.aliveService) {
        let hrv = this.aliveService.getHRV ();

        let meanRR = 0;
              
        if (hrv.getMeanRR () != 0) {
          meanRR = (1000*60.)/hrv.getMeanRR ();
        }  

        let parameters = {
          meanRR: parseInt (meanRR*100+0.5)/(100.),
          RMSSD: parseInt (hrv.getRMSSD ()*100+0.5)/(100.),
          SDNN: parseInt (hrv.getSDNN ()*100+0.5)/(100.),
          NN50: hrv.getNN50 (),
          pNN50: (parseInt (hrv.getpNN50()*10000+0.5)/100.),
          TP: hrv.getTP (),
          LF: hrv.getLF (),
          HF: hrv.getHF (),
          ratio: 0
        };  

        if (parameters.HF != 0) {
          parameters.ratio = parameters.LF/parameters.HF;
        }  

        return parameters;
      } 

      return {};
			
		}

		getCSV () {

		}

		writeCSV () {

		}
	}
	module.exports = Patient;
})();