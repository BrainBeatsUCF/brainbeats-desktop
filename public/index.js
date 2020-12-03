import React from 'react'
import ReactDOM from 'react-dom'
import { Authentication } from './components/authentication/authentication'
import { AppDelegate } from './components/appDelegate/appDelegate'
import NetworkActivityAnimation from './images/network_activity.gif'
import {
  ClearUserAuthInfo,
  GetUserAuthInfo,
  SaveUserAuthInfo,
  RequestUserTokenRefresh,
} from './components/requestService/authRequestService'
import './index.css'
import './scrollbar.css'

let shouldRefreshOnReload = true

const TokenRefreshInterval = 40 * 60 * 1000 // 40 minutes

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

  componentDidMount() {
    if (this.state.userInfo != null && shouldRefreshOnReload) {
      RequestUserTokenRefresh(_ => {
        this.onLoginSuccess(GetUserAuthInfo())
        setInterval(_ => {
          RequestUserTokenRefresh()
          console.log('Token Refreshed')
        }, TokenRefreshInterval)
      }, this.onLoginError)
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
    shouldRefreshOnReload = false
    if (userInfo == null || userInfo == undefined) {
      ClearUserAuthInfo()
    } else {
      SaveUserAuthInfo(userInfo)
    }
    this.setState({ userInfo: userInfo })
  }

  isUserDefined = () => {
    return this.state.userInfo != null && this.state.userInfo != undefined
  }

  render() {
    return this.isUserDefined() ? (
      shouldRefreshOnReload ? (
        <div className="MainLoadingOverlay">
          <img src={NetworkActivityAnimation} height="40px" width="40px"></img>
        </div>
      ) : (
        <AppDelegate onLogoutClick={this.handleLogout} userInfo={this.state.userInfo}></AppDelegate>
      )
    ) : (
      <Authentication onSuccess={this.onLoginSuccess} onError={this.onLoginError}></Authentication>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
