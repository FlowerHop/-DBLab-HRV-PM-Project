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
        stationarySensorIDs: ['a', 'b', 'c'],
        monitor: {
        	a: 'B33', 
        	b: 'Empty',
        	c: 'Empty'
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
      // monitor[stationarySensorID] = 'Empty';

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
      	  <table className="table table-bordered" style={{backgroundColor: '#FFFFFF'}}>
      	    <thead>
      	      <tr>
      	    	<th>#</th>
      	    	<th>Stationary Sensor ID</th>
      	    	<th>Patient ID</th>
      	      </tr>
      	    </thead>
      	    <tbody>
      	      {this.state.stationarySensorIDs.map ((stationarySensorID, index) => {
      	      	row++;
      	    	return (
      	    	  <tr key={row}>
      	    		<td key={row + ", " + (index)}>{index + 1}</td> 
      	    		<td key={row + ", " + (index) + ", " + stationarySensorID}>
                  {stationarySensorID}
                  <button className="btn btn-danger pull-right" onClick={() => {
                    fetch (serverURL + 'removeStationarySensor/', {
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
                  }>remove</button>
                </td>
      	    		<td className="dropdown" key={row + ", " + (index) + ", " + "patientID"}>
                      <a href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {this.state.monitor[stationarySensorID]}
                        <span className="caret"></span>
                      </a>
                      <ul className="dropdown-menu" role="menu" aria-labelledby="dLabel">
                        <li onClick={() => {this.monitorChange (stationarySensorID, "Empty")}}>Empty</li>
                        {patientIDs.map ((patientID, index) => {
                          for (let k in this.state.monitor) {
                          	if (this.state.monitor[k] == patientID) {
                          		return;
                          	}
                          }
                          return (
                          	<li key={index} onClick={() => {this.monitorChange (stationarySensorID, patientID)}}>{patientID}</li>
                          );
                        })}
                      </ul>
      	    		</td>
      	    	  </tr>
      	    	);
      	      })}
      	    </tbody>
      	  </table>

      	  <form>
      	    <div className="row">
      	      <div className="form-group col-md-8" >
      	  	    <lable className="sr-only" htmlFor="stationarySensorIDInput">New Stationary Sensor</lable>
      	  	    <input onChange={this.handleInputChange} type="text" className="form-control" id="stationarySensorIDInput" placeholder="Stationary Sensor ID" ref="stationarySensorIDInput"></input>
      	  	  </div>
      	  	  <div className="col-md-4">
        	  	<button type="button" onClick={this.newStationarySensorID} className="btn btn-primary btn-block">New</button>
      	  	  </div>
      	  	</div>
      	  </form>
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