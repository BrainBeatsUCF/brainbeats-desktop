import axios from 'axios'

const ResultStatus = {
  Success: 'success',
  Error: 'error',
}

const ResultStatusErrorMessage = {
  NON_EXISTENT_USER_ERROR_MESSAGE: 'User email or password invalid',
  INVALID_REGISTRATION_DATA: 'User email or password cannot be registered',
  USER_ALREADY_EXISTS: 'Email already exists, please log in',
}

/// Request APIs and Routes
const azureRouteKey = 'BRAINBEATS_AZURE_API_URL'
const loginUserRoute = '/user/login_user'
const refreshUserTokenRoute = '/user/refresh_token'

/**
 * This object holds the session info for the authenticated user
 */
const VerifiedUserInfo = {
  email: '',
  authToken: '',
  refreshToken: '',
  password: '',
  uuid: '',
}

/**
 * @param {String} email
 * @param {String} password
 * @return {VerifiedUserInfo}
 */
const AuthenticateUserInfo = (email, password) => {
  /// TODO: Add client-side input validation here
  return {
    email: email,
    password: password,
  }
}

/**
 * @return {VerifiedUserInfo}
 */
const GetUserAuthInfo = _ => {
  let userInfo = {}
  for (let userInfoKey in VerifiedUserInfo) {
    userInfo[userInfoKey] = window.localStorage.getItem(userInfoKey)
  }
  return userInfo
}

/**
 * @param {VerifiedUserInfo} userInfo
 */
const SaveUserAuthInfo = userInfo => {
  for (let userInfoKey in userInfo) {
    window.localStorage.setItem(userInfoKey, userInfo[userInfoKey])
  }
}

const ClearUserAuthInfo = _ => {
  for (let userInfoKey in VerifiedUserInfo) {
    window.localStorage.removeItem(userInfoKey)
  }
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(user: VerifiedUserInfo, status: String, message: String) => void} didCompleteRequest
 */
const RequestUserLoginAuthentication = (userInfo, didCompleteRequest) => {
  const url = window.process.env[azureRouteKey] + loginUserRoute
  const requestBody = {
    email: userInfo.email,
    password: userInfo.password,
  }
  axios
    .post(url, requestBody)
    .then(response => response.data)
    .then(responseData => {
      const newUserInfo = {
        email: userInfo.email,
        authToken: responseData.access_token,
        refreshToken: responseData.refresh_token,
        password: userInfo.password,
        uuid: responseData.id_token,
      }
      SaveUserAuthInfo(newUserInfo)
      didCompleteRequest(newUserInfo, ResultStatus.Success, null)
    })
    .catch(error => {
      console.error(error.response)
      didCompleteRequest(
        { authToken: null },
        ResultStatus.Error,
        ResultStatusErrorMessage.NON_EXISTENT_USER_ERROR_MESSAGE
      )
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {() => void} onComplete
 * @param {() => void} onError
 */
const RequestUserRefreshAuthentication = (userInfo, onComplete, onError) => {
  const url = window.process.env[azureRouteKey] + loginUserRoute
  const requestBody = {
    email: userInfo.email,
    password: userInfo.password,
  }
  axios
    .post(url, requestBody)
    .then(response => response.data)
    .then(responseData => {
      const newUserInfo = {
        authToken: responseData.access_token,
        refreshToken: responseData.refresh_token,
        uuid: responseData.id_token,
      }
      SaveUserAuthInfo(newUserInfo)
      onComplete()
    })
    .catch(error => {
      console.error(error.response)
      onError()
    })
}

/**
 * @param {() => void} onSuccess
 * @param {() => void} onError
 */
const RequestUserTokenRefresh = (onSuccess, onError) => {
  const url = window.process.env[azureRouteKey] + refreshUserTokenRoute
  const requestBody = {
    refreshToken: GetUserAuthInfo().refreshToken,
  }
  axios
    .post(url, requestBody)
    .then(response => response.data)
    .then(responseData => {
      const newUserInfo = {
        authToken: responseData.access_token,
        refreshToken: responseData.refresh_token,
        uuid: responseData.id_token,
      }
      SaveUserAuthInfo(newUserInfo)
      if (onSuccess != null && onSuccess != undefined) {
        onSuccess()
      }
    })
    .catch(error => {
      console.error(error.response)
      if (onError != null && onError != undefined) {
        onError()
      }
    })
}

export {
  RequestUserTokenRefresh,
  RequestUserLoginAuthentication,
  RequestUserRefreshAuthentication,
  AuthenticateUserInfo,
  GetUserAuthInfo,
  SaveUserAuthInfo,
  ClearUserAuthInfo,
  VerifiedUserInfo,
  ResultStatus,
}
