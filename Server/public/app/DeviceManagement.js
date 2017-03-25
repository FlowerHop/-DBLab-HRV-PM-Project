import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import bootstrap from 'bootstrap';

let patientIDs = ['A12', 'B33', 'C31'];
let serverURL = 'http://localhost:1338/';
class DeviceManagement extends Component {
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
        <div className="row">

          <div className="col-md-2"></div>
          <div className="col-md-8 center-block">
            <h2>Device Management</h2> 
            <StationaryTable/>
          </div>
          <div className="col-md-2"></div>
        </div>
      );
    }
}

class StationaryTable extends Component {
    constructor (props) {
    	super (props);
      this.state = {
        stationarySensorIDs: [],
        monitor: {
        	a: 'B33', 
        	b: '無',
        	c: '無'
        },
        stationarySensorIDInput: ''
      };

      this.monitorChange = this.monitorChange.bind (this);
      this.newStationarySensorID = this.newStationarySensorID.bind (this);
      this.handleInputChange = this.handleInputChange.bind (this);  
      this.loadingDataFromServer = this.loadingDataFromServer.bind (this);
    }

    loadingDataFromServer () {
      fetch (serverURL + 'getStationarySensorIDs')
      .then((response) => response.json ())
      .then ((response) => {
        // console.log (response);  
        let stationarySensorIDs = [];
        response.forEach ((stationarySensor) => {
          stationarySensorIDs.push (stationarySensor.id);
        });
        this.setState ({stationarySensorIDs: stationarySensorIDs});      
      })
      .catch ((err) => {
        console.log (err);
      });
      

      // next will move to the top
      fetch (serverURL + 'getPatientIDs')
      .then ((response) => response.json ())
      .then ((response) => {
        // console.log (response);
        patientIDs = response;      
      })
      .catch ((err) => {
        console.log (err);
      });

      fetch (serverURL + 'getMonitor')
      .then ((response) => response.json ())
      .then ((response) => {
        this.setState ({monitor: response});
      })
      .catch ((err) => {
        console.log (err);
      });
    }
 
    componentDidMount () {
      this.loadingDataFromServer ();
      this.loadingInterval = setInterval (this.loadingDataFromServer, 2000);
    }

    componentWillUnmount () {
      clearInterval (this.loadingInterval);
    }

    monitorChange (stationarySensorID, patientID) {
      let newMonitor = {};
      newMonitor[stationarySensorID] = patientID;
      // post method to Server
      fetch (serverURL + 'updateMonitor/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMonitor)
      });
    }

    newStationarySensorID () {
      let stationarySensorID = this.state.stationarySensorIDInput;
      // this.state.stationarySensorIDs.map ((id) => {
      //   if (id == stationarySensorID) {
      //   	return;
      //   }
      // });
       
      // let stationarySensorIDs = this.state.stationarySensorIDs;
      // let monitor = this.state.monitor;
      // stationarySensorIDs.push (stationarySensorID);
      // monitor[stationarySensorID] = '無';

      // post method to Server
      fetch (serverURL + 'newStationarySensor/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stationarySensorID: stationarySensorID
        })
      });
    }

    handleInputChange (evt) {
      this.setState ({stationarySensorIDInput: evt.target.value});
    }

    render () {
      let row = -1;
      return (
        <div>
          <table className="table table-bordered" style={{backgroundColor: '#FFFFFF', textAlign:"center"}}>
            <tbody>
              {this.state.stationarySensorIDs.map ((stationarySensorID, index, stationarySensorIDs) => {
                if (index % 2 != 0) {
                  return (
                    <tr key={"row" + (index/2)}>
                      <td className="row">
                        <div className="col-md-6">
                          <img src="app/res/img/bed_left.png"></img>
                          <h3>{"Bed " + (index - 1 + 1)}</h3>
                        </div>
                        <div className="col-md-6" style={{top: '35px', color: '#083D77'}}>
                          <h3>監測病人ID</h3>
                          <div className="dropdown">
                          <h3 href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            {this.state.monitor[stationarySensorIDs[index - 1]]}
                            <span className="caret"></span>
                          </h3>
                          <ul className="dropdown-menu" role="menu" aria-labelledby="dLabel">
                            <li onClick={() => {this.monitorChange (stationarySensorIDs[index - 1], "無")}}>無</li>
                            {patientIDs.map ((patientID, i) => {
                              for (let k in this.state.monitor) {
                                if (this.state.monitor[k] == patientID) {
                                  return;
                                }
                              }
                              return (
                                <li key={i} onClick={() => {this.monitorChange (stationarySensorIDs[index - 1], patientID)}}>{patientID}</li>
                              );
                            })}
                          </ul>
                        </div>
                        </div>
                        
                      </td>
                      <td className="row">
                        <div className="col-md-6">
                          <img src="app/res/img/bed_right.png"></img>
                          <h3>{"Bed " + (index + 1)}</h3>
                        </div>
                        <div className="col-md-6" style={{top: '35px', color: '#083D77'}}>
                          <h3>監測病人ID</h3>
                          <div className="dropdown">
                            <h3 href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                              {this.state.monitor[stationarySensorIDs[index]]}
                              <span className="caret"></span>
                            </h3>
                            <ul className="dropdown-menu text-center" role="menu" aria-labelledby="dLabel">
                              <li onClick={() => {this.monitorChange (stationarySensorIDs[index], "無")}}>無</li>
                              {patientIDs.map ((patientID, i) => {
                                for (let k in this.state.monitor) {
                                  if (this.state.monitor[k] == patientID) {
                                    return;
                                  }
                                }
                                return (
                                  <li key={i} onClick={() => {this.monitorChange (stationarySensorIDs[index], patientID)}}>{patientID}</li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                        
                      </td>
                    </tr>
                  );    
                } else if (index == stationarySensorIDs.length - 1) {
                  return (
                    <tr key={"row" + (index/2)}>
                      <td className="row">
                        <div className="col-md-6"> 
                          <img src="app/res/img/bed_left.png"></img>
                          <h3>{"Bed " + (index + 1)}</h3>
                        </div>
                        <div className="col-md-6" style={{top: '35px', color: '#083D77'}}>
                          <h3>監測病人ID</h3>
                          <div className="dropdown">
                            <h3 href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                              {this.state.monitor[stationarySensorIDs[index]]}
                              <span className="caret"></span>
                            </h3>
                            <ul className="dropdown-menu" role="menu" aria-labelledby="dLabel">
                              <li onClick={() => {this.monitorChange (stationarySensorIDs[index], "無")}}>無</li>
                              {patientIDs.map ((patientID, i) => {
                                for (let k in this.state.monitor) {
                                  if (this.state.monitor[k] == patientID) {
                                    return;
                                  }
                                }
                                return (
                                  <li key={i} onClick={() => {this.monitorChange (stationarySensorIDs[i], patientID)}}>{patientID}</li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                        
                      </td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      );
    }
}

class WearableTable extends Component {
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
      
    }
}

export default DeviceManagement;