import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// let serverURL = "http://localhost:1338/";
let serverURL = "http://140.115.51.30:1338/";

class ECGTitle extends Component {
	constructor (props) {
      super (props);
      this.state = {

      };

      this.onMeasure = this.onMeasure.bind (this);
	}

	componentDidMount () {
      this.mHR = this.refs.ecgTitle;
      this.contextHR = this.mHR.getContext ("2d");

      this.onMeasure();

      window.addEventListener ('resize', this.onMeasure, false);
      this.onMeasure();
	}

	componentWillUnmount () {}

	onMeasure () {
	  this.mHR.width = window.innerWidth*7.5/12 / 4;
	  this.mHR.height = 200 / 4;

	  this.contextHR.font = "20px sans-serif";
      this.contextHR.fillText ("ECG", this.mHR.width/4, this.mHR.height/2);
	}

	render () {
		return (
		  <div>
            <canvas ref="ecgTitle"></canvas>
          </div>
        );
	}
}

export default ECGTitle;