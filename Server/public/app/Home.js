import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class Home extends Component {
	constructor (props) {
		super (props);
	}
    render () {
      return (
        <div className="row" style={{marginTop: '40px'}}>
          <div className="col-md-2"></div>
          <div className="col-md-8">
            <h1>Hi, 王小明 醫生</h1>
          </div>
          <div className="col-md-2"></div>
        </div>
      );
    }
}

export default Home;