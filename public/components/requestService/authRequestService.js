import hash from 'object-hash'
import axios from 'axios'
import cookieHandler from 'js-cookie'

const UserAuthInfoKey = 'userAuthInfo'
const fakeNetworkDelayMilliseconds = 1250

const fakeAcceptedUsers = [
  {
    UserEmail: 'lloyd@lloyddapaah@gmail.com',
    UserPassword: '1234',
  },
]

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
  return cookieHandler.get()
}

/**
 * @param {VerifiedUserInfo} userInfo
 */
const SaveUserAuthInfo = userInfo => {
  for (let userInfoKey in userInfo) {
    cookieHandler.set(userInfoKey, userInfo[userInfoKey])
  }
}

const ClearUserAuthInfo = _ => {
  for (let userInfoKey in VerifiedUserInfo) {
    cookieHandler.remove(userInfoKey)
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
        email: userInfo.email,
        authToken: responseData.access_token,
        refreshToken: responseData.refresh_token,
        password: userInfo.password,
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
 * @param {{
 * UserEmail: String,
 * UserPassword: String,
 * }} userInfo
 * @param {(user: VerifiedUserInfo, status: String, message: String) => void} didCompleteRequest
 */
const RequestUserRegisterAuthentication = (userInfo, didCompleteRequest) => {
  setTimeout(() => {
    if (userInfo.UserEmail.length === 0 || userInfo.UserPassword.length === 0) {
      didCompleteRequest(
        {
          email: null,
          authCode: null,
          uuid: null,
        },
        ResultStatus.Error,
        ResultStatusErrorMessage.INVALID_REGISTRATION_DATA
      )
      return
    }

    let userAlreadyExists = false
    for (let user in fakeAcceptedUsers) {
      const fakeUser = fakeAcceptedUsers[user]
      if (fakeUser.UserEmail == userInfo.UserEmail) {
        userAlreadyExists = true
        break
      }
    }

    if (userAlreadyExists) {
      didCompleteRequest(
        {
          email: null,
          authCode: null,
          uuid: null,
        },
        ResultStatus.Error,
        ResultStatusErrorMessage.USER_ALREADY_EXISTS
      )
      return
    }

    const newUser = {
      UserEmail: userInfo.UserEmail,
      UserPassword: userInfo.UserPassword,
    }
    fakeAcceptedUsers.push(newUser)
    didCompleteRequest(
      {
        email: userInfo.UserEmail,
        authCode: userInfo.UserEmail.repeat(2),
        uuid: hash.sha1(userInfo.UserEmail),
      },
      ResultStatus.Success,
      null
    )
    return
  }, fakeNetworkDelayMilliseconds)
}

export {
  RequestUserLoginAuthentication,
  RequestUserRegisterAuthentication,
  RequestUserRefreshAuthentication,
  AuthenticateUserInfo,
  GetUserAuthInfo,
  SaveUserAuthInfo,
  ClearUserAuthInfo,
  VerifiedUserInfo,
  ResultStatus,
}
