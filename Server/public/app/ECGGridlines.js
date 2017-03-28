import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Grid from './lib/grid';

class ECGGridlines extends Component {
    constructor (props) {
      super (props);
      this.state = {

      };
      this.resizeCanvas = this.resizeCanvas.bind (this);
      this.redraw = this.redraw.bind (this);
    }
   
    componentDidMount () {
      window.addEventListener ('resize', this.resizeCanvas, false);
      this.canvas = this.refs.gridlines;
      this.context = this.canvas.getContext ("2d");
      this.ecgWindow = this.refs.ecgWindow;
      this.resizeCanvas ();
    }

    resizeCanvas () {
      this.canvas.width = window.innerWidth*7.5/12;
      this.canvas.height = 200;
      this.redraw ();
    }

    redraw () {
      this.context.strokeStyle = 'red';
      this.context.lineWidth = '10';
      this.context.strokeRect (0, 0, this.canvas.width, this.canvas.height);
      this.opts = {
          distance : 5,
          lineWidth : 1,
          gridColor : "#BDE4FF",
          caption : false,
          horizontalLines : true,
          verticalLines : true
      };
      new Grid (this.opts).draw (this.context);
    }

    componentWillUnmount () {
      window.removeEventListener ('resize', this.resizeCanvas, false);
    }

    render () {
      return (
        <div style={{position:'absolute'}}>
          <canvas ref="gridlines"></canvas>
        </div>
      );
    }
}

export default ECGGridlines;