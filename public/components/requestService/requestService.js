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
  console.log('Refresh Profile Image')
  const options = {
    height: 120,
    width: 120,
    cellSize: 25,
    seed: userInfo.uuid,
  }
  const pattern = trianglify(options)
  return pattern.toCanvas().toDataURL()
}

export { RequestHomeData, RequestUserProfileImage, RequestUserSampleItems, ResultStatus }
