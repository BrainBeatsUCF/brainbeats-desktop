import React from 'react'
import ReactDOM from 'react-dom'
import { Authentication } from './components/authentication/authentication'
import { AppDelegate } from './components/appDelegate/appDelegate'
import NetworkActivityAnimation from './images/network_activity.gif'
import { RequestGetOwnedBeats } from './components/requestService/itemRequestService'
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
const WakeServerTime = 2 * 1000 // 2 seconds

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
      shouldShowOverlay: shouldRefreshOnReload,
    }
  }

  componentDidMount() {
    if (this.state.userInfo != null && shouldRefreshOnReload) {
      RequestUserTokenRefresh(this.handleRefreshTokenSuccess, this.hideMainOverlay)
    }
  }

  hideMainOverlay = _ => {
    this.setState({ shouldShowOverlay: false })
  }

  handleRefreshTokenSuccess = _ => {
    RequestGetOwnedBeats(
      GetUserAuthInfo(),
      _ => {
        shouldRefreshOnReload = false
        this.hideMainOverlay()
        setInterval(_ => {
          RequestUserTokenRefresh()
        }, TokenRefreshInterval)
      },
      _ => {
        setTimeout(_ => {
          this.handleRefreshTokenSuccess()
        }, WakeServerTime)
      }
    )
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
