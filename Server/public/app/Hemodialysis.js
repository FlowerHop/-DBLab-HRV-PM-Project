import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ECGTable from './ECGTable';

// let serverURL = "http://localhost:1338/";
let serverURL = "http://140.115.51.30:1338/";

class Hemodialysis extends Component {
    constructor (props) {
      super (props);
      this.state = {
      	stationarySensorIDs: [],
        patientIDs: [], 
        patientNames: {},
        patientStatuses: {}
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

      this.state.patientIDs.forEach ((patientID) => {
        fetch (serverURL + 'getPatient/' + patientID)
        .then ((response) => response.json ())
        .then ((response) => {
          this.state.patientNames[patientID] = response.name;
        })
        .catch ((err) => {
          console.log (err);
        });

        fetch (serverURL + 'getStatus/' + patientID)
        .then ((response) => response.json ())
        .then ((response) => {
          this.state.patientStatuses[patientID] = response;
        })
        .catch ((err) => {
          console.log (err);
        });
      });
    }

    render () {
      return (
      	<div style={{marginTop: '40px'}}>
      	  <div className="row">
            <div className="col-md-1"></div>
      	    <div className="col-md-2">
              <div className="panel panel-primary affix">
                <div className="panel-heading">
                  病人名單
                </div>
                <div className="panel-body">
                  <ul className="nav nav-sidebar">
                    {this.state.patientIDs.map ((patientID, index) => {
                      return (
                        <li key={patientID} className={
                          (this.state.patientStatuses[patientID] == 1) ? "list-group-item-warning" : ((this.state.patientStatuses[patientID] == 2) ? "list-group-item-danger" : "")}>
                          <a href={"#table" + patientID}>{this.state.patientNames[patientID] + " (床位 " + (this.state.stationarySensorIDs[index].match (/SS-([^-]+)/)[1].charCodeAt (0) - 64) +")"}</a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
      	    <div className="col-md-8">
      	      {this.state.patientIDs.map ((patientID, index) => {
                return (
                  <ECGTable key={patientID} patientID={patientID} stationarySensorID={this.state.stationarySensorIDs[index]}/>
                );
      	      })}
            </div>
            <div className="col-md-1"></div>
      	  </div>
      	</div>
      );
    }
}

export default Hemodialysis;