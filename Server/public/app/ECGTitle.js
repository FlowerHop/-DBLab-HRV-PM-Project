import React, { Component } from 'react';
import ReactDOM from 'react-dom';

let serverURL = "http://localhost:1338/";

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

export default ECGTitle;