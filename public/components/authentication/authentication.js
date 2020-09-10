import React, { useState } from 'react'
import loadingAnimation from '../../images/loading_animation.gif'
import {
	RequestUserLoginAuthentication,
	RequestUserRegisterAuthentication,
	AuthenticateUserInfo,
	ResultStatus,
} from '../requestService/authRequestService'
import './authentication.css'

const loginText = 'Sign In'
const registerText = 'Sign Up'
const toggleToLoginText = 'Already Have An Account'
const toggleToRegisterText = 'Create An Account'

/**
 * @param {{
 * onSuccess: (message: String) => void
 * onError: (message: String) => void
 * }} props
 */
const Authentication = props => {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [hasAnAccount, setHasAnAccount] = useState(true)
	const [isMakingRequest, setIsMakingRequest] = useState(false)
	const [authenticationError, setAuthenticationError] = useState(null)

	const handleSubmit = event => {
		event.preventDefault()
		if (isMakingRequest) {
			return
		}

		setIsMakingRequest(true)
		setAuthenticationError(null)
		if (hasAnAccount) {
			RequestUserLoginAuthentication(AuthenticateUserInfo(username, password), (userData, status, message) => {
				onRequestCompletion(status, status == ResultStatus.Success ? userData : message)
			})
		} else {
			RequestUserRegisterAuthentication(AuthenticateUserInfo(username, password), (userData, status, message) => {
				onRequestCompletion(status, status == ResultStatus.Success ? userData : message)
			})
		}
	}

	const onRequestCompletion = (result, message) => {
		setIsMakingRequest(false)
		if (result == ResultStatus.Success) {
			props.onSuccess(message)
		} else {
			setAuthenticationError(message)
			props.onError(message)
		}
	}

	const toggleRegisterAndLogin = () => {
		setHasAnAccount(!hasAnAccount)
	}

	const renderAuthenticationErrorIfNeeded = () => {
		if (authenticationError == null) {
			return <></>
		} else {
			return (
				<h3 className="LoginAuthenticationError">
					{authenticationError
						.split(' ')
						.map(str => str.charAt(0).toUpperCase() + str.slice(1))
						.join(' ')}
				</h3>
			)
		}
	}

	const loadingAnimationStyle = {
		display: isMakingRequest ? '' : 'none',
	}

	return (
		<div className="LoginBackground">
			<div style={loadingAnimationStyle} className="LoginLoadingContainer">
				<img src={loadingAnimation} height="70px" width="90px"></img>
			</div>
			{renderAuthenticationErrorIfNeeded()}
			<form className="LoginForm" onSubmit={event => handleSubmit(event)}>
				<input
					className="LoginInput"
					type="email"
					placeholder="username"
					onChange={event => setUsername(event.target.value)}
				></input>
				<input
					className="LoginInput"
					type="password"
					placeholder="password"
					onChange={event => setPassword(event.target.value)}
				></input>
				<input className="LoginInput" type="submit" value={hasAnAccount ? loginText : registerText}></input>
				<input
					className="LoginInput"
					type="button"
					value={hasAnAccount ? toggleToRegisterText : toggleToLoginText}
					onClick={_ => toggleRegisterAndLogin()}
				></input>
			</form>
		</div>
	)
}

export { Authentication }
