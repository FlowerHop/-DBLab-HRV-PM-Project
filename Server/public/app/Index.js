import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import bootstrap from 'bootstrap';
import Home from './Home';
import DeviceManagement from './DeviceManagement';

class Index extends Component {
	  constructor (props) {
		  super (props);
      $('#home a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
      });
      $('#profile a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
      });
      $('#messages a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
      });
      $('#settings a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
      });
	  }

    render () {
      return (
        <div>
          <div role="tabpanel">
            <ul style={{backgroundColor: '#083D77', color: '#F8FFF4',}} className="nav nav-pills" role="tablist">
              <li className="active"><a href="#home" aria-controls="home" role="tab" data-toggle="tab">Home</a></li>
              <li><a href="#profile" aria-controls="profile" role="tab" data-toggle="tab">Profile</a></li>
              <li><a href="#messages" aria-controls="messages" role="tab" data-toggle="tab">Messages</a></li>
              <li><a href="#settings" aria-controls="settings" role="tab" data-toggle="tab">Device Management</a></li>
            </ul>
            <div className="tab-content">
              <div role="tabpanel" className="tab-pane active" id="home"><Home/></div>
              <div role="tabpanel" className="tab-pane" id="profile">...</div>
              <div role="tabpanel" className="tab-pane" id="messages">...</div>
              <div role="tabpanel" className="tab-pane" id="settings"><DeviceManagement/></div>
            </div>

          </div>
        </div>
      );
    }
}

export default Index;