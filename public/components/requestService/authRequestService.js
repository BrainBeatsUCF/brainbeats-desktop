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
const loginUserRoute = '/v2/login'
const refreshUserTokenRoute = '/v2/refresh_token'
const urlBaseRoute = window.process.env[azureRouteKey]

/// Hack to prevent 503 on initial bootup if user already logged in
let initialRefreshTokenAttempts = 3

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
  window.localStorage.clear()
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(user: VerifiedUserInfo, status: String, message: String) => void} didCompleteRequest
 */
const RequestUserLoginAuthentication = (userInfo, didCompleteRequest) => {
  const url = urlBaseRoute + loginUserRoute
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
  const url = urlBaseRoute + loginUserRoute
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
  const url = urlBaseRoute + refreshUserTokenRoute
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
      /// Server could be asleep. 3 attempts 2.5 seconds apart
      /// could be enough to eventually make contacts
      /// This only fires on initial bootup since counter is a
      /// global variable
      if (initialRefreshTokenAttempts > 0) {
        setTimeout(_ => {
          initialRefreshTokenAttempts -= 1
          RequestUserTokenRefresh(onSuccess, onError)
        }, 2500)
      } else {
        console.error(error.response)
        if (onError != null && onError != undefined) {
          onError()
        }
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
