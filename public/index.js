import React from 'react'
import ReactDOM from 'react-dom'
import { Authentication } from './components/authentication/authentication'
import { AppDelegate } from './components/appDelegate/appDelegate'
import { ClearUserAuthInfo, GetUserAuthInfo, SaveUserAuthInfo } from './components/requestService/authRequestService'

import './index.css'
import './scrollbar.css'

const PreloadUserInfo = _ => {
  const userInfo = GetUserAuthInfo()
  if (
    userInfo != null &&
    userInfo != undefined &&
    userInfo.authToken != null &&
    userInfo.authToken != undefined &&
    userInfo.authToken != ''
  ) {
    return userInfo
  } else {
    return null
  }
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userInfo: PreloadUserInfo(),
    }
  }

  onLoginSuccess = userInfo => {
    this.setUserInfo(userInfo)
  }

  onLoginError = message => {
    this.setUserInfo(null)
  }

  handleLogout = () => {
    this.setUserInfo(null)
  }

  setUserInfo = userInfo => {
    this.setState({ userInfo: userInfo })
    if (userInfo == null || userInfo == undefined) {
      ClearUserAuthInfo()
    } else {
      SaveUserAuthInfo(userInfo)
    }
  }

  isUserDefined = () => {
    return this.state.userInfo != null && this.state.userInfo != undefined
  }

  render() {
    return this.isUserDefined() ? (
      <AppDelegate onLogoutClick={this.handleLogout} userInfo={this.state.userInfo}></AppDelegate>
    ) : (
      <Authentication onSuccess={this.onLoginSuccess} onError={this.onLoginError}></Authentication>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
