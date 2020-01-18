import * as React from 'react';
import './Home.css';
const { spawn } = window.require('child_process');

export default class Home extends React.Component {

  state: { process: any, isInRecordSession: boolean } = {
    process: null,
    isInRecordSession: false
  }

  componentDidMount = () => {
    window.console.log('Home Loaded')
  }

  instantiateSubProcess = () => {
    const child = spawn('python', ['server/app.py']);

    this.setState({
      process: child,
      isInRecordSession: true
    });

    child.on('exit', (code:Number) => {
      window.console.log(`Exit code is ${code}`);
    });
    
    child.stdout.on('data', (data:Uint8Array) => {
      let string = new TextDecoder("utf-8").decode(data);
      window.console.log(string);
    });

    child.on('message', (message:Object) => {
      window.console.log(`Child message is ${message}`);
    });
  }

  killSubProcess = () => {
    if(!this.state.isInRecordSession) {
      return;
    }

    if(this.state.process == null) {
      return;
    }

    this.state.process!.kill('SIGINT');
    this.setState({
      process: null,
      isInRecordSession: false
    })

    window.console.log('Python server session ended')
  }

  handleStartSessionClicked = () => {
    if(!this.state.isInRecordSession) {
      this.instantiateSubProcess();
    } else {
      this.killSubProcess();
    }
  }

  renderStartSessionButton = () => {
    let buttonTitle = this.state.isInRecordSession ? 'Stop Recording' : 'Start Recording';
    return (
      <input 
        type='button' 
        value={buttonTitle} 
        className='Start-Recording-Button' 
        onClick={this.handleStartSessionClicked}
      ></input>
    );
  }

  render() {
    return (
      <div className='Home-Background'>
        <div className='New-Session-Preview'>
          {this.renderStartSessionButton()}
        </div>
        <div className='Old-Session-Preview'>

        </div>
      </div>
    )
  }
}