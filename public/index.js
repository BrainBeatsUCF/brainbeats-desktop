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
      shouldShowOverlay: false,
    }
  }

  componentDidMount() {
    if (this.state.userInfo != null) {
      RequestUserTokenRefresh(this.handleRefreshTokenSuccess, this.hideMainOverlay)
    }
  }

  hideMainOverlay = _ => {
    this.setState({ shouldShowOverlay: false })
  }

  handleRefreshTokenSuccess = _ => {
    this.hideMainOverlay()
    setInterval(_ => {
      RequestUserTokenRefresh()
    }, TokenRefreshInterval)
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
      this.state.shouldShowOverlay ? (
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
