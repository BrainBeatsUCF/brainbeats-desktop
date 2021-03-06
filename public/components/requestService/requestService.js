import axios from 'axios'
import trianglify from 'trianglify'
import { GetUserAuthInfo, VerifiedUserInfo, RequestUserRefreshAuthentication } from './authRequestService'
import { RequestGetOwnedBeats, RequestGetOwnedSamples } from './itemRequestService'

const mockNetworkDelayMillisecond = 2000

const ResultStatus = {
  Success: 'success',
  Error: 'error',
}

/// Colorspace for picking pigment of profile image
const AvailableColorSpace = [
  'YlGn',
  'YlGnBu',
  'GnBu',
  'BuGn',
  'PuBuGn',
  'PuBu',
  'BuPu',
  'RdPu',
  'PuRd',
  'OrRd',
  'YlOrRd',
  'YlOrBr',
  'Purples',
  'Blues',
  'Greens',
  'Oranges',
  'Reds',
  'Greys',
  'PuOr',
  'BrBG',
  'PRGn',
  'PiYG',
  'RdBu',
  'RdGy',
  'RdYlBu',
  'Spectral',
  'RdYlGn',
]

/// Request APIs and Routes
const azureRoute = window.process.env['BRAINBEATS_AZURE_API_URL']
const readUserRouteV2 = '/v2/users/'

/// Request Error Messages
const expiredAuthorizationToken = 'The token is expired'

/**
 * @param {VerifiedUserInfo} userInfo
 * @return {String}
 */
const RequestUserProfileImage = userInfo => {
  const convertToNumber = email => {
    const emailArray = [...email]
    const convertedNumber = emailArray.map(char => char.charCodeAt(0)).reduce((current, previous) => previous + current)
    return convertedNumber
  }
  const pattern = trianglify({
    height: 120,
    width: 120,
    cellSize: 25,
    seed: userInfo.uuid,
    xColors: AvailableColorSpace[convertToNumber(userInfo.email) % AvailableColorSpace.length],
  })
  return pattern.toCanvas().toDataURL()
}

/**
 * @param {(firstName: String, lastName: String) => void} onUserIdentityRecieved
 * @param {Boolean?} limit
 */
const RequestUserIdentificationInfo = (onUserIdentityRecieved, limit) => {
  const userInfo = GetUserAuthInfo()
  const url = azureRoute + readUserRouteV2 + userInfo.email
  axios
    .get(url, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(response => response.data)
    .then(responseData => {
      const firstVertex = responseData[0]
      const firstName = firstVertex.properties.firstName[0].value
      const lastName = firstVertex.properties.lastName[0].value
      onUserIdentityRecieved(firstName, lastName)
    })
    .catch(error => {
      if (
        error.response != undefined &&
        error.response.data.includes(expiredAuthorizationToken) &&
        (limit == undefined || limit == false)
      ) {
        RequestUserRefreshAuthentication(
          userInfo,
          _ => RequestUserIdentificationInfo(onUserIdentityRecieved, true),
          _ => {}
        )
      } else {
        console.log(error.response)
      }
    })
}

/**
 * Gets the first and last name first before attempting other requests to prevent network clog
 * @param {(firstName: String, lastName: String) => void} onUserIdentityRecieved
 */
const RequestUserProfileInfo = onUserIdentityRecieved => {
  RequestUserIdentificationInfo((firstName, lastName) => onUserIdentityRecieved(firstName, lastName))
}

export { RequestUserProfileImage, RequestUserProfileInfo, ResultStatus }
