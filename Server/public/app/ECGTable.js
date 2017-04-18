import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ECGGraph from './ECGGraph';

// let serverURL = "http://localhost:1338/";
let serverURL = "http://140.115.51.30:1338/";

class ECGTable extends Component {
	constructor (props) {
	  super (props);
	  this.state = {
	  	isStart: false, // 0: stop, 1: start
	  	info: {},
	  	hr: '---',
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

	  fetch (serverURL + 'getStationarySensorStatus/' + this.props.stationarySensorID)
	  .then ((response) => response.json ())
	  .then ((response) => {
	    this.setState ({
	      isStart: response
	    });  	
	  });

    fetch (serverURL + 'getHR/' + this.props.patientID)
    .then ((response) => response.json ())
    .then ((response) => {
      this.setState ({
        hr: response
      });
    });
	}

	render () {
	  return (
	  	<div> 
        <div id={"table" + this.props.patientID} className={(this.state.isStart ? ((this.state.status == 0) ? "panel panel-success" : ((this.state.status == 1) ? "panel panel-warning" : ((this.state.status == 2) ? "panel panel-danger" : "panel panel-info"))) : "panel panel-default")}>
            <div className="panel-heading">
              <h3>病人 <u>{this.state.info.name + " (床位 " + (this.props.stationarySensorID.match (/SS-([^-]+)/)[1].charCodeAt (0) - 64) + ")"}</u>

                <button className={this.state.isStart ? 'btn btn-danger pull-right' : 'btn btn-success pull-right'} ref='monitorButton' onClick={() => {
                  if (this.state.isStart) {
            	      // to stop
                    fetch (serverURL + 'updateStationarySensorStatus/' + this.props.stationarySensorID + '/false')
                    .catch ((err) => {
                      console.log (err);
                    });
                  } else {
                    // to start
                    fetch (serverURL + 'updateStationarySensorStatus/' + this.props.stationarySensorID + '/true')
            	      .catch ((err) => {
            	        console.log (err);
            	      });
                  }
                }}>{this.state.isStart ? '停止監測' : '開始監測'}</button>
                <div className="pull-right" style={{marginRight: 40}}>
                  <img src="app/res/img/heart.png" style={{width: 40, height: 40}}></img>
                  : {this.state.hr}
                </div>
              </h3>
            </div>
            
            <div className="panel-body">
              <table className='table' style={{backgroundColor: 'white'}}>
    	  	      <tbody>
    	  	    <tr>
    	  	      <td>
    	  	      	<div className="panel-group">
    	  	      	  <div className={(this.state.isStart ? ((this.state.status == 0) ? "panel panel-success" : ((this.state.status == 1) ? "panel panel-warning" : ((this.state.status == 2) ? "panel panel-danger" : "panel panel-info"))) : "panel panel-default")}>
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
                      <div className={(this.state.isStart ? ((this.state.status == 0) ? "panel panel-success" : ((this.state.status == 1) ? "panel panel-warning" : ((this.state.status == 2) ? "panel panel-danger" : "panel panel-info"))) : "panel panel-default")}>
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

export default ECGTable;

