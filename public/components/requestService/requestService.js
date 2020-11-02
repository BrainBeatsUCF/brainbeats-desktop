import trianglify from 'trianglify'
import secondTestDataSet from './testHomeData2.json'
import testSampleAudioBuffer from './testSampleAudioBuffer.json'
import { VerifiedUserInfo } from './authRequestService'
import { ListObjectType } from '../panel/verticalListPanel/verticalListPanel'
import { GridSampleObject, GridBeatObject } from '../panel/workstationPanel/gridObjects'

const mockNetworkDelayMillisecond = 2000

const ResultStatus = {
  Success: 'success',
  Error: 'error',
}

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

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(data: any, status: String) => void} didCompleteRequest
 */
const RequestHomeData = (userInfo, didCompleteRequest) => {
  setTimeout(() => {
    console.log('Refreshes Home Items')
    didCompleteRequest(secondTestDataSet, ResultStatus.Success)
  }, 2500)
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(data: [GridSampleObject]) => void} didCompleteRequest
 */
const RequestUserSampleItems = (userInfo, didCompleteRequest) => {
  setTimeout(() => {
    console.log('Refresh Studio Sample List')
    didCompleteRequest(testSampleAudioBuffer)
  }, mockNetworkDelayMillisecond)
}

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

export { RequestHomeData, RequestUserProfileImage, RequestUserSampleItems, ResultStatus }
