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
				email: 'test@test.com',
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
