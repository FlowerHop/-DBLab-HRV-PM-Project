import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class LoginForm extends Component {
  constructor (props) {
    super (props);
    this.login = this.login.bind (this);
  }
  
  login () {
    this.props.history.push ('/index');
  }

	render () {
		return (
          <div>
            <div className="row">
              <form className="form-signin col-md-8 col-md-offset-2">
                <h2 className="form-signin-heading">Please Sign in</h2>
                <label htmlFor="inputEmail" className="sr-only">Email address</label> 
                <input type="email" id="inputEmail" className="form-control" placeholder="Email address" required autoFocus/> 
                <label htmlFor="inputPassword" className="sr-only">Password</label> 
                <input type="password" id="inputPassword" className="form-control" placeholder="Password" required/>
                <div className="checkbox">
                  <label><input type="checkbox" value="remember-me"/> Remember me </label>
                </div>
                <button className="btn btn-lg btn-primary btn-block" type="submit" onClick={this.login} style={{backgroundColor: '#083D77', color: '#F8FFF4'}}>Sign in</button>
              </form>
            </div>
          </div>
	    )
	}
}

export default LoginForm;