import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import CirFloatBufferManager from './lib/CirFloatBuffer';
import MainsFilterManager from './lib/MainsFilter';

let serverURL = "http://localhost:1338/";

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
      this.sampleCount = 0;

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
    	this.loadingInterval = setInterval (this.loadingDataFromServer, 200);
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
            // console.log (index + 'new: ' + packet);

            for (let i = 0; i < len; i++) {
                let val = packet[i].data;
                val = this.mEcgFilter.filter (val);
                this.mEcgBuffer.add (val);
                this.sampleCount = packet[i].sampleCount;
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
          if (rawECGSamples[i].sampleCount > this.sampleCount) {
            this.onAlivePacket (0, rawECGSamples.slice (i, rawECGSamples.length));
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

export default ECGView;