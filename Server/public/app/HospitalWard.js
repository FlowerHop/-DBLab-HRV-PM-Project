import React, { Component } from 'react';
import ReactDOM from 'react-dom';

let serverURL = "http://localhost:1338/";

class HospitalWard extends Component {
    constructor (props) {
      super (props);
      this.state = {
        roomIDs: [],
        patients: {}
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
      fetch (serverURL + 'getRoomIDs/')
      .then ((response) => response.json ())
      .then ((response) => {
      	this.setState ({ roomIDs: response });
      })
      .catch ((err) => {
      	console.log (err);
      });
      
      let patients = {};
      this.state.roomIDs.forEach ((roomID) => {
        fetch (serverURL + 'getPatientsAtRoom/' + roomID)
        .then ((response) => response.json ())
        .then ((response) => {
          patients[roomID] = response;
          this.state.patients[roomID] = response;
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
                    {this.state.roomIDs.map ((roomID) => {
                      return (
                      	this.state.patients[roomID] ? 
                          this.state.patients[roomID].map ((patient) => {
                            return (
                              <li key={patient.id} className={ patient.hr == "---" ? "" : (patient.hr >= 60 ? (patient.hr <= 100 ? "" : "list-group-item-danger") : "list-group-item-danger") }>
                                <a href={"#table" + patient.id}>{patient.name}</a>
                              </li>
                            );
                          }) : ""
                      );
                    })}
                    
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-8">
              {this.state.roomIDs.map ((roomID) => {
                return (
                  <div id={roomID} key={roomID} className="panel panel-primary">
                    <div className="panel-heading">
                      <h3>{"Room " + roomID}</h3>
                    </div>
                    <div className="panel-body">
                      <table className="table">
                        <tbody>
                      	  {
                      	    this.state.patients[roomID] ? 
                      	      this.state.patients[roomID].map ((patient) => {
                      	        return (
                                  <tr key={patient.id} id={"table" + patient.id}>
                                    <td className={ patient.hr == "---" ? "" : (patient.hr >= 60 ? (patient.hr <= 100 ? "" : "list-group-item-danger") : "list-group-item-danger") }>
                              	      <h3>
                              	        {patient.name}
                              	        <div className="pull-right" style={{marginRight: 40}}>
                              	          <img src="app/res/img/heart.png" style={{width: 40, height: 40}}></img>
                              	          : {patient.hr}
                              	        </div>
                              	      </h3>
                                    </td>
                                  </tr>
                      	        );
                      	      }) : ""
                      	  } 
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="col-md-1"></div>
          </div>
        </div>
      );
    }
}

export default HospitalWard;