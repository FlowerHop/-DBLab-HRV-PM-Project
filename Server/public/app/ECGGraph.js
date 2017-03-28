import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ECGGridlines from './ECGGridlines';
import ECGTitle from './ECGTitle';
import ECGView from './ECGView';

class ECGGraph extends Component {
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
        <div ref="ecgWindow" style={{position: 'relative'}}>
          <ECGGridlines/>
          <ECGTitle patientID={this.props.patientID}/>
          <ECGView patientID={this.props.patientID}/>
        </div>
      );
    }
}

export default ECGGraph;