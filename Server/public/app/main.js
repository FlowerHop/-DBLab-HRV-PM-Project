import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import LoginForm from './LoginForm';
import Index from './Index';

class App extends Component {
    constructor (props) {
      super (props);
    }

	render () {
		return (
		  <div>
            <div className="row">
		      <div className="col-md-12" style={{backgroundColor: '#083D77'}}>
		        <h1 style={{color: '#F8FFF4'}}>Hospital Monitoring System</h1>
		      </div>
		    </div>
		    <div className="row">
              <Router>
	            <div>
                  <Route exact path="/" component={LoginForm}/>
                  <Route path="/index" component={Index}/>
                </div>
              </Router>
            </div>
          </div>
        )
	}
}

ReactDOM.render (React.createElement (App), document.getElementById ('app'));