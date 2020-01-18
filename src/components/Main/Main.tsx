import * as React from 'react';
import Home from '../Home/Home';
import './Main.css';

export default class Main extends React.Component {
  state = {
    isUserLoggedIn: true
  }

  render() {
    let content = <div></div>

    // select window
    if(this.state.isUserLoggedIn) {
      content = <Home></Home>
    }

    return (
      <div className='Main-Background'>
        {content}
      </div>
    )
  }
}