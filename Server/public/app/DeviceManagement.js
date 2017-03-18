import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import bootstrap from 'bootstrap';

let patientIDs = ['A12', 'B33', 'C31'];

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
        	stationaryIDs: ['a', 'b', 'c'],
        	monitor: {
        		a: 'B33', 
        		b: 'Empty',
        		c: 'Empty'
        	},
        	stationaryIDInput: ''
        };
        this.monitorChange = this.monitorChange.bind (this);
        this.newStationaryID = this.newStationaryID.bind (this);
        this.handleInputChange = this.handleInputChange.bind (this);
    }
 
    componentDidMount () {

    }

    componentWillUnmount () {

    }

    monitorChange (stationaryID, patientID) {
      let monitor = this.state.monitor;
      monitor[stationaryID] = patientID;
      this.setState ({monitor: monitor});
    }

    newStationaryID () {
      let stationaryID = this.state.stationaryIDInput;
      this.state.stationaryIDs.map ((id) => {
        if (id == stationaryID) {
        	return;
        }
      });
       
      let stationaryIDs = this.state.stationaryIDs;
      let monitor = this.state.monitor;
      stationaryIDs.push (stationaryID);
      monitor[stationaryID] = 'Empty';

      this.setState ({
      	stationaryIDs: stationaryIDs,
      	monitor: monitor
      });

      // post method to Server
    }

    handleInputChange (evt) {
      this.setState ({stationaryIDInput: evt.target.value});
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
      	      {this.state.stationaryIDs.map ((stationaryID, index) => {
      	      	row++;
      	    	return (
      	    	  <tr key={row}>
      	    		<td key={row + ", " + (index)}>{index + 1}</td> 
      	    		<td key={row + ", " + (index) + ", " + stationaryID}>{stationaryID}</td>
      	    		<td className="dropdown" key={row + ", " + (index) + ", " + "patientID"}>
                      <a href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {this.state.monitor[stationaryID]}
                        <span className="caret"></span>
                      </a>
                      <ul className="dropdown-menu" role="menu" aria-labelledby="dLabel">
                        <li onClick={() => {this.monitorChange (stationaryID, "Empty")}}>Empty</li>
                        {patientIDs.map ((patientID, index) => {
                          for (let k in this.state.monitor) {
                          	if (this.state.monitor[k] == patientID) {
                          		return;
                          	}
                          }
                          return (
                          	<li key={index} onClick={() => {this.monitorChange (stationaryID, patientID)}}>{patientID}</li>
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
      	  	    <lable className="sr-only" htmlFor="stationaryIDInput">New Stationary Sensor</lable>
      	  	    <input onChange={this.handleInputChange} type="text" className="form-control" id="stationaryIDInput" placeholder="Stationary Sensor ID" ref="stationaryIDInput"></input>
      	  	  </div>
      	  	  <div className="col-md-4">
        	  	<button type="button" onClick={this.newStationaryID} className="btn btn-primary btn-block">New</button>
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