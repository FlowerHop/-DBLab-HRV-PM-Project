import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ECGTable from './ECGTable';

let serverURL = "http://localhost:1338/";

class Hemodialysis extends Component {
    constructor (props) {
      super (props);
      this.state = {
      	stationarySensorIDs: [],
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
      // fetch (serverURL + 'getPatientIDs/')
      // .then ((response) => response.json ())
      // .then ((response) => {
      //   this.setState ({patientIDs: response});
      // })
      // .catch ((err) => {
      // 	console.log (err);
      // });	

      fetch (serverURL + 'getMonitor')
      .then ((response) => response.json ())
      .then ((response) => {
        this.setState ({monitor: response});
        let stationarySensorIDs = [];
        let patientIDs = [];

        for (let k in response) {
          if (response[k] != '無') {
          	stationarySensorIDs.push (k);
            patientIDs.push (response[k]);
          }
        }

        this.setState ({
          stationarySensorIDs: stationarySensorIDs,
          patientIDs: patientIDs
        });
      })
      .catch ((err) => {
      	console.log (err);
      });
    }

    render () {
      return (
      	<div style={{marginTop: '40px'}}>
      	  <div className="row">
      	    <div className="col-md-2"></div>
      	    <div className="col-md-8">
      	      {this.state.patientIDs.map ((patientID, index) => {
                return (
                  <ECGTable key={patientID} patientID={patientID} stationarySensorID={this.state.stationarySensorIDs[index]}/>
                );
      	      })}
            </div>
      	    <div className="col-md-2"></div>
      	  </div>
      	</div>
      );
    }
}

export default Hemodialysis;