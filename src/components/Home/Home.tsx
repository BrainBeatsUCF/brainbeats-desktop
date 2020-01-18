import * as React from 'react';
import './Home.css';

export default class Home extends React.Component {
  render() {
    return (
      <div className='Home-Background'>
        <div className='New-Session-Preview'>
          <input type='button' value='Start Recording' className='Start-Recording-Button'></input>
        </div>
        <div className='Old-Session-Preview'>

        </div>
      </div>
    )
  }
}