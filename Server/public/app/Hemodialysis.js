import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Grid from './lib/grid';
import CirFloatBufferManager from './lib/CirFloatBuffer';
import MainsFilterManager from './lib/MainsFilter';

let serverURL = "http://localhost:1338/";

class Hemodialysis extends Component {
    constructor (props) {
      super (props);
      this.state = {
        patientIDs: []
      };
      this.loadingDataFromServer = this.loadingDataFromServer.bind (this);
    }
   
    componentDidMount () {
      this.loadingDataFromServer ();
      this.loadingInterval = setInterval (this.loadingDataFromServer, 2000);
    }

    componentWillUnmount () {
      clearInterval (this.loadingInterval);
    }

    loadingDataFromServer () {
      fetch (serverURL + 'getPatientIDs/')
      .then ((response) => response.json ())
      .then ((response) => {
        this.setState ({patientIDs: response});
        
      })
      .catch ((err) => {
      	console.log (err);
      });	
    }

    render () {
      return (
      	<div>
      	  <div className="row">
      	    <div className="col-md-2"></div>
      	    <div className="col-md-8">
      	      {this.state.patientIDs.map ((patientID) => {
                return (
                  <ECGTable key={patientID} patientID={patientID}/>
                );
      	      })}
            </div>
      	    <div className="col-md-2"></div>
      	  </div>
      	</div>
      );
    }
}

class ECGGraph extends Component {
    constructor (props) {
      super (props);
      this.state = {

      };
    }
   
    componentDidMount () {
    }

    componentWillUnmount () {
    }

    render () {
      return (
        <div ref="ecgWindow" style={{position: 'relative'}}>
          <ECGGridlines/>
          <ECGTitle patientID={this.props.patientID}/>
          <ECGView patientID={this.props.patientID}/>
        </div>
      );
    }
}

class ECGGridlines extends Component {
    constructor (props) {
      super (props);
      this.state = {

      };
      this.resizeCanvas = this.resizeCanvas.bind (this);
      this.redraw = this.redraw.bind (this);
    }
   
    componentDidMount () {
      window.addEventListener ('resize', this.resizeCanvas, false);
      this.canvas = this.refs.gridlines;
      this.context = this.canvas.getContext ("2d");
      this.ecgWindow = this.refs.ecgWindow;
      this.resizeCanvas ();
    }

    resizeCanvas () {
      this.canvas.width = window.innerWidth*7.5/12;
      this.canvas.height = 200;
      this.redraw ();
    }

    redraw () {
      this.context.strokeStyle = 'red';
      this.context.lineWidth = '10';
      this.context.strokeRect (0, 0, this.canvas.width, this.canvas.height);
      this.opts = {
          distance : 5,
          lineWidth : 1,
          gridColor : "#BDE4FF",
          caption : false,
          horizontalLines : true,
          verticalLines : true
      };
      new Grid (this.opts).draw (this.context);
    }

    componentWillUnmount () {
      window.removeEventListener ('resize', this.resizeCanvas, false);
    }

    render () {
      return (
        <div style={{position:'absolute'}}>
          <canvas ref="gridlines"></canvas>
        </div>
      );
    }
}

class ECGView extends Component {
    constructor (props) {
      super (props);
      this.state = {

      };
      this.IN_TO_CM = 2.54; // 2.54f

      this.SWEEPBAR_WIDTH = 1;
      this.mEcgFilter = ""; // Using simple averaging LP filter, that also removes mains noise
      this.mInitalized = false;
      this.mEcgBuffer = "";
      this.mPath = "";
      this.mSamplesPerWidth = "";

      this.mYOffset = "";
      this.mXScale = "";
      this.mYScale = "";
      this.mWidth = "";

      this.mDisplayMetrics = "";
      this.mXppcm = "";
      this.mYppcm = "";
      this.mContext = "";

      this.mView = "";
      this.contextView = "";

      this.rawECGSamples = [];

      this.getECGRangeHeight = this.getECGRangeHeight.bind (this);
      this.onMeasure = this.onMeasure.bind (this);
      this.onDraw = this.onDraw.bind (this);
      this.resetECG = this.resetECG.bind (this);
      this.onAlivePacket = this.onAlivePacket.bind (this);

      this.loadingDataFromServer = this.loadingDataFromServer.bind (this);
    }
    
    componentDidMount () {
    	this.mView = this.refs.ecgView;
    	this.contextView = this.mView.getContext ("2d");
    	this.contextView.strokeStyle = "black";
    	this.contextView.lineWidth = 2;
    	this.contextView.lineCap = "round";
    	this.contextView.lineJoin = "round";
        
    	this.onMeasure ();
       
    	window.addEventListener ('resize', this.onMeasure, false);
    	this.onMeasure ();
    	this.loadingDataFromServer ();
    	this.loadingInterval = setInterval (this.loadingDataFromServer, 100);
    }

    getECGRangeHeight () {
    	let xppcm = this.mView.width / this.IN_TO_CM;
    	let yppcm = this.mView.height / this.IN_TO_CM;
    	yppcm = xppcm;

    	// Height of 5 mV range
    	return Math.floor (5*yppcm);
    }

    onMeasure () {
        this.mView.width = window.innerWidth*7.5/12;
        this.mView.height = 200*3/4;

        this.mXppcm = this.mView.width/this.IN_TO_CM;
        this.mYppcm = this.mView.height/this.IN_TO_CM;
        //this.mYppcm = this.mXppcm;

        // XScale set to 25mm/s. Sample rate is 300 Hz, so 300 samples per 25mm
        this.mXScale = 1.25 * this.mXppcm/300.0;

        // YScale set to 10mm/mV. 8bit, 20uV LSB or 50=1mV
        // this.mYScale = this.mYppcm / 25;
        this.mYScale = this.mYppcm/100;

        this.mYOffset = this.mView.height*0.4;
        this.mWidth = this.mView.width;
        this.mSamplesPerWidth = Math.floor (this.mView.width/this.mXScale);

        if (this.mInitalized) {
            let bufferSamples = this.mSamplesPerWidth + 12; // Extra samples for filter delay etc
            this.mEcgBuffer.resize (bufferSamples);
        }
    }

    onDraw() {
        if (!this.mInitalized) return; // Nothing to draw

        let sweepbarSamples = Math.floor (this.SWEEPBAR_WIDTH*300/12.5);

        this.contextView.beginPath ();

        let startIndex = 0;
        let endIndex = this.mEcgBuffer.getCount () - 1;

        if (endIndex >= (this.mSamplesPerWidth-sweepbarSamples)) {
            startIndex = endIndex - (this.mSamplesPerWidth-sweepbarSamples);
            endIndex = startIndex + (this.mSamplesPerWidth-sweepbarSamples);
        }
        let nCount = 0;
        let lastXPos = 0;
        for (let x = startIndex; x < endIndex; x++) {
            let xPos = x * this.mXScale;
            xPos = xPos % this.mWidth;
            //let yPos = this.mYOffset - this.mEcgBuffer.get(x)*this.mYScale;
            //let yPos = this.mYOffset + this.mEcgBuffer.get(x)*0.5
            let yPos;
            // if(this.mEcgBuffer.get(x) > 20) {
                // yPos = this.mYOffset - this.mEcgBuffer.get(x)*this.mYScale*0.025;
            // } else {
            yPos = this.mYOffset - this.mEcgBuffer.get (x)*this.mYScale;
            // }

            /*console.log(
                "mYOffset = " + this.mYOffset +
                " xPos = " + xPos +
                " yPos = " + yPos
            );*/

            if (x == startIndex || xPos < lastXPos) {
                this.contextView.moveTo (xPos, yPos);
            } else {
                this.contextView.lineTo (xPos, yPos);
            }
            lastXPos = xPos;

            // TODO: Test optimization - drawing short paths
            nCount++;
            if (nCount == 200) {
                this.contextView.stroke ();
                this.contextView.beginPath ();
                this.contextView.moveTo (xPos, yPos);
                nCount = 0;
            }

        }
        if (nCount > 1) {
            this.contextView.stroke ();
        }
    }

    resetECG () {
        if (this.mInitalized) {
            this.mEcgFilter.reset ();
            this.mEcgBuffer.reset ();
        }
        this.onDraw ();
    }

    onAlivePacket (index, packet) {
        let len = packet.length;
        if (len > 0) {
            if (!this.mInitalized) {
                // Extra samples for filter delay etc
                let bufferSamples = this.mSamplesPerWidth+12;

                this.mEcgBuffer = new CirFloatBufferManager (bufferSamples);
                this.mEcgFilter = new MainsFilterManager ();
                this.mInitalized = true;
            }
            
            for (let i = 0; i < len; i++) {
                let val = packet[i];
                val = this.mEcgFilter.filter (-val);
                this.mEcgBuffer.add (val);
                this.rawECGSamples[index++] = packet[i];
            }

            this.onMeasure ();
            this.onDraw ();
        }
    }

    componentWillUnmount () {
      window.removeEventListener ('resize', this.onMeasure, false);
      clearInterval (this.loadingInterval);
    }

    loadingDataFromServer () {
      fetch (serverURL + 'getRawECGSamples/' + this.props.patientID)
      .then ((response) => response.json ())
      .then ((response) => {
      	let rawECGSamples = response;
      	for (let i = 0; i < rawECGSamples.length; i++) {
      	  if (i < this.rawECGSamples.length) {
            if (rawECGSamples[i] != this.rawECGSamples[i]) {
              this.onAlivePacket (i, rawECGSamples.slice (i, rawECGSamples.length));
            }
      	  } else {
            this.onAlivePacket (i, rawECGSamples.slice (i, rawECGSamples.length));
      	  }
      	}
      });
    }

    render () {
    	return (
    	    <div>
    		  <canvas ref="ecgView"></canvas>
    		</div>
        );
    }
}

class ECGTitle extends Component {
	constructor (props) {
      super (props);
      this.state = {

      };

      this.onMeasure = this.onMeasure.bind (this);
      this.updateHeartRate = this.updateHeartRate.bind (this);
      this.onAliveHeartBeat = this.onAliveHeartBeat.bind (this);
      this.hrString = "---";
      this.loadingDataFromServer = this.loadingDataFromServer.bind (this);
	}

	componentDidMount () {
      this.mHR = this.refs.ecgTitle;
      this.contextHR = this.mHR.getContext ("2d");

      this.mHRUnits = this.refs.ecgHR;
      this.contextHRUnits = this.mHRUnits.getContext ("2d");

      this.onMeasure();

      window.addEventListener ('resize', this.onMeasure, false);
      this.onMeasure();
      this.loadingDataFromServer ();
	  this.loadingInterval = setInterval (this.loadingDataFromServer, 2000);
	}

	componentWillUnmount () {
      window.removeEventListener ('resize', this.onMeasure, false);
      clearInterval (this.loadingInterval);
	}

	loadingDataFromServer () {
	  fetch (serverURL + 'getHR/' + this.props.patientID)
	  .then ((response) => response.json ())
	  .then ((response) => {
	  	if (response != 0) {
          this.onAliveHeartBeat (0, response);
        }
	  });
	}

	onMeasure () {
	  this.mHR.width = window.innerWidth*7.5/12 / 4;
	  this.mHR.height = 200 / 4;
	  this.contextHR.font = "20px sans-serif";
	  this.contextHR.fillText (this.hrString, this.mHR.width/4, this.mHR.height/2);

	  this.mHRUnits.width = window.innerWidth*7.5/12 / 4;
	  this.mHRUnits.height = 200 / 4;
	  this.contextHRUnits.font = "20px sans-serif";
	  this.contextHRUnits.fillText ("BPM", this.mHR.width/4, this.mHR.height/2);
	}

	updateHeartRate (hr) {
	    this.hrString = hr;
	    this.onMeasure ();
	}

    onAliveHeartBeat (timeSampleCount, hr) {
        // console.log(hr);
        this.updateHeartRate (hr);
    }

	render () {
		return (
		  <div>
            <canvas ref="ecgTitle"></canvas>
            <canvas ref="ecgHR"></canvas>
          </div>
        );
	}
}

class ECGTable extends Component {
	constructor (props) {
	  super (props);
	  this.state = {
	  	isStart: 0, // 0: stop, 1: start
	  	info: {},
	  	btnTxt: 'Start',
	  	HR: '---',
        meanRR: 0,
        RMSSD: 0,
        SDNN: 0,
        NN50: 0,
        pNN50: 0,
        TP: 0,
        LF: 0,
        HF: 0,
        ratio: 0,
        status: 0
	  };

	  this.loadingDataFromServer = this.loadingDataFromServer.bind (this);
	}
    
	componentDidMount () {
	  this.loadingDataFromServer ();
	  this.loadingInterval = setInterval (this.loadingDataFromServer, 2000);
	}

	componentWillUnmount () {
	  clearInterval (this.loadingInterval);
	}

	loadingDataFromServer () {
	  fetch (serverURL + 'getParameters/' + this.props.patientID)
	  .then ((response) => response.json ())
	  .then ((response) => {
	    this.setState ({
	      meanRR: response.meanRR,
	      RMSSD: response.RMSSD,
	      SDNN: response.SDNN,
	      NN50: response.NN50,
	      pNN50: response.pNN50,
	      TP: response.TP,
	      LF: response.LF,
	      HF: response.HF,
	      ratio: response.ratio
	    });
	  })
	  .catch ((err) => {
	  	console.log (err);
	  });

	  fetch (serverURL + 'getStatus/' + this.props.patientID)
	  .then ((response) => response.json ())
	  .then ((response) => {
	    this.setState ({
	      status: response
	    });
	  })
	  .catch ((err) => {
	  	console.log (err);
	  });	

	  fetch (serverURL + 'getPatient/' + this.props.patientID)
	  .then ((response) => response.json ())
	  .then ((response) => {
	  	this.setState ({
          info: response
	  	});
	  });
	}

	render () {
	  return (
	  	<div> 
          <div className={(this.state.status == 0) ? "panel panel-info" : ((this.state.status == 1) ? "panel panel-warning" : ((this.state.status == 2) ? "panel panel-danger" : "panel panel-default"))}>
            <div className="panel-heading">
              <h3>Patient {this.state.info.name}
                <button className={this.state.isStart ? 'btn btn-danger pull-right' : 'btn btn-success pull-right'} ref='monitorButton' onClick={() => {
                  if (this.state.isStart) {
            	    // to stop
                    this.setState ({isStart: 0});
                    this.setState ({btnTxt: 'Start'});
                  } else {
                    // to start
                    this.setState ({isStart: 1});
                    this.setState ({btnTxt: 'Stop'});
                  }
                  }}
                >{this.state.btnTxt}</button>
              </h3>
            </div>
            
            <div className="panel-body">
              <table className='table' style={{backgroundColor: 'white'}}>
    	  	  <tbody>
    	  	    <tr>
    	  	      <td>
    	  	      	<div className="panel-group">
    	  	      	  <div className={(this.state.status == 0) ? "panel panel-info" : ((this.state.status == 1) ? "panel panel-warning" : ((this.state.status == 2) ? "panel panel-danger" : "panel panel-default"))}>
    	  	      	  	<div className="panel-heading">
    	  	      	  	  <h4 className="panel-title">
    	  	      	  	  	<a data-toggle="collapse" href={"#info" + this.props.patientID} aria-expanded="true" aria-controls="info">
                          		病人基本資料
                          	</a>
    	  	      	  	  </h4>
    	  	      	  	</div>
    	  	      	  	<div id={"info" + this.props.patientID} className="panel-collapse collapse" aria-expanded="false" aria-labelledby="info">
    	  	      	  	  <table className="table table-bordered" style={{backgroundColor: '#FFFFFF'}}>
    	  	      	  	    <tbody>
    	  	      	  	      <tr>
    	  	      	  	      	<td>{"病人ID: "}<span className="pull-right">{this.props.patientID}</span></td>
    	  	      	  	        <td>{"姓名: "}<span className="pull-right">{this.state.info.name}</span></td>
    	  	      	  	      </tr>
    	  	      	  	      <tr>
    	  	      	  	      	<td>{"性別: "}<span className="pull-right">{this.state.info.gender}</span></td>
    	  	      	  	      	<td>{"年齡: "}<span className="pull-right">{this.state.info.age}</span></td>
    	  	      	  	      </tr>
    	  	      	  	    </tbody>
    	  	      	  	  </table>
    	  	      	  	</div>
    	  	      	  </div>
    	  	      	</div>
    	  	      </td>
    	  	    </tr>
                <tr>
                  <td>
                    <ECGGraph patientID={this.props.patientID}/>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="panel-group">
                      <div className={(this.state.status == 0) ? "panel panel-info" : ((this.state.status == 1) ? "panel panel-warning" : ((this.state.status == 2) ? "panel panel-danger" : "panel panel-default"))}>
                        <div className="panel-heading">
                          <h4 className="panel-title">
                          	<a data-toggle="collapse" href={"#content" + this.props.patientID} aria-expanded="true" aria-controls="content">
                          		詳細資訊
                          	</a>
                          </h4>
                        </div>
                        <div id={"content" + this.props.patientID} className="panel-collapse collapse" aria-expanded="false" aria-labelledby="content">
                          <table className="table table-bordered" style={{backgroundColor: '#FFFFFF'}}>
                            <thead>
                              <tr>
                                <th className="text-center">HRV Parameter</th>
                                <th className="text-center">Value</th>
                              </tr>
                            </thead>
                            <tbody>
                          	  <tr>
                          	  	<th>Mean RR</th>
                          	  	<td>{this.state.meanRR}</td>
                          	  </tr>
                          	  <tr>
                          	  	<th>RMSSD</th>
                          	  	<td>{this.state.RMSSD}</td>
                          	  </tr>
                          	  <tr>
                          	  	<th>SDNN</th>
                          	  	<td>{this.state.SDNN}
                          	  	</td>
                          	  </tr>
                          	  <tr>
                          	  	<th>NN50</th>
                          	  	<td>{this.state.NN50}</td>
                          	  </tr>
                          	  <tr>
                          	  	<th>pNN50</th>
                          	  	<td>{this.state.pNN50}</td>
                          	  </tr>
                          	  <tr>
                          	  	<th>TP</th>
                          	  	<td>{this.state.TP}</td>
                          	  </tr>
                          	  <tr>
                          	  	<th>LF</th>
                          	  	<td>{this.state.LF}</td>
                          	  </tr>
                          	  <tr>
                          	  	<th>HF</th>
                          	  	<td>{this.state.HF}</td>
                          	  </tr>
                          	  <tr>
                          	  	<th>LF/HF</th>
                          	  	<td>{this.state.ratio}</td>
                          	  </tr>
                            </tbody>
                          </table>
                        </div>
                      	
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
    	  	  </table>
            </div>
          </div>		  
	  	</div>
	  );
	}
}

export default Hemodialysis;