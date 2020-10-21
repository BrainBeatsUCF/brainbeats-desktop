import { VerifiedUserInfo } from './authRequestService'
import { GridBeatObject, GridSampleObject } from '../panel/workstationPanel/gridObjects'
import { ResultStatus } from './requestService'

const mockNetworkDelayMillisecond = 2000

/**
 *
 * @param {VerifiedUserInfo} userInfo
 * @param {GridBeatObject} beatObject
 * @param {(status: ResultStatus) => void} didCompleteRequest
 */
const RequestDeleteBeat = (userInfo, beatObject, didCompleteRequest) => {
  // placeholder for request handler
  setTimeout(() => {
    didCompleteRequest(ResultStatus.Success)
  }, mockNetworkDelayMillisecond)
}

/**
 *
 * @param {VerifiedUserInfo} userInfo
 * @param {GridSampleObject} sampleObject
 * @param {(status: ResultStatus) => void} didCompleteRequest
 */
const RequestDeleteSample = (userInfo, sampleObject, didCompleteRequest) => {
  // placeholder for request handler
  setTimeout(() => {
    didCompleteRequest(ResultStatus.Success)
  }, mockNetworkDelayMillisecond)
}

export { RequestDeleteBeat, RequestDeleteSample, VerifiedUserInfo, ResultStatus }
