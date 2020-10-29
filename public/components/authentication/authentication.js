import React, { useState } from 'react'
import loadingAnimation from '../../images/loading_animation.gif'
import {
  RequestUserLoginAuthentication,
  AuthenticateUserInfo,
  ResultStatus,
} from '../requestService/authRequestService'
import './authentication.css'

const registerationURL =
  'https://ucfbrainbeats.b2clogin.com/ucfbrainbeats.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1_signup&client_id=037bbefc-958e-489d-ba61-8c0823284010&nonce=defaultNonce&redirect_uri=https%3A%2F%2Fbrain-beats-server-docker.azurewebsites.net%2F.auth%2Flogin%2Faad%2Fcallback&scope=openid&response_type=id_token&prompt=login'

/**
 * @param {{
 * onSuccess: (message: String) => void
 * onError: (message: String) => void
 * }} props
 */
const Authentication = props => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isMakingRequest, setIsMakingRequest] = useState(false)
  const [authenticationError, setAuthenticationError] = useState(null)

  const handleSubmit = event => {
    event.preventDefault()
    if (isMakingRequest) {
      return
    }
    setIsMakingRequest(true)
    setAuthenticationError(null)
    RequestUserLoginAuthentication(AuthenticateUserInfo(username, password), (userData, status, message) => {
      onRequestCompletion(status, status == ResultStatus.Success ? userData : message)
    })
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
        <input className="LoginInput LoginAddonInput" type="submit" value="Sign In"></input>
        <input
          className="LoginInput LoginAddonInput"
          type="button"
          value="Create An Account"
          onClick={_ => {
            window.open(registerationURL, '_blank', 'nodeIntegration=no')
          }}
        ></input>
      </form>
    </div>
  )
}

export { Authentication }
