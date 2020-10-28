import React from 'react'
import ReactDOM from 'react-dom'
import { Authentication } from './components/authentication/authentication'
import { AppDelegate } from './components/appDelegate/appDelegate'

import './index.css'
import './scrollbar.css'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userInfo: {
        email: 'lloyd.lloyddapaah@gmail.com',
        authToken:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsifQ.eyJpc3MiOiJodHRwczovL3VjZmJyYWluYmVhdHMuYjJjbG9naW4uY29tL2JkYTE2NGQwLWZjYWUtNDM2Mi1hZGI0LWEzZjVmY2U3MWVjZi92Mi4wLyIsImV4cCI6MTYwMzg1MzMzMSwibmJmIjoxNjAzODQ5NzMxLCJhdWQiOiIwMzdiYmVmYy05NThlLTQ4OWQtYmE2MS04YzA4MjMyODQwMTAiLCJpZHAiOiJMb2NhbEFjY291bnQiLCJvaWQiOiI0MjY5MzY3MC05YWI3LTRmYjktOWJlZS1iMDRjZWYyZTlhMGYiLCJzdWIiOiI0MjY5MzY3MC05YWI3LTRmYjktOWJlZS1iMDRjZWYyZTlhMGYiLCJnaXZlbl9uYW1lIjoiTGxveWQiLCJmYW1pbHlfbmFtZSI6IkRhcGFhaCIsImVtYWlscyI6WyJsbG95ZC5sbG95ZGRhcGFhaEBnbWFpbC5jb20iXSwidGZwIjoiQjJDXzFfcm9wY19hdXRoIiwiYXpwIjoiMDM3YmJlZmMtOTU4ZS00ODlkLWJhNjEtOGMwODIzMjg0MDEwIiwidmVyIjoiMS4wIiwiaWF0IjoxNjAzODQ5NzMxfQ.TX6l7xzzuJ78CG_ArldUYCIzV4p42JN8OFzxiZ9eK6Q0va4WjWlADmXYIgC6IymmGr-eXTDffsQv672k_02jAtzVhTmUqsk52gm-1Vx0cl1usspp2oAAf9d1IqsHf8cpGxRm1r0JTWpVMrMZRHQd5GUsnlQ4knVPfUj3-XSEUzUh1JxP962DV_lzaqv_1dcqm4z7__RCK3t9X2IwJaYAmOcDNFo7Kt-bM0DD5Vig9lZnrTHRX5VzB290PVGbz1BD7nmCe66s2TlCLmh6SHoteo-wO1XCdeBu5A_nnbRNElxnHS1YWF6BoIBGPVRZW9SHmipbGt78_FZ5B7wpl4XLLg',
        authCode: '1234567435645654njkln45',
        uuid: 'ajk-dsfsdf-asdf32-asdasdf-dsg',
      },
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
