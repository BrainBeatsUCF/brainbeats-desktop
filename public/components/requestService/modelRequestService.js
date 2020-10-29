import { VerifiedUserInfo } from './authRequestService'
import { GridSampleObject } from '../panel/workstationPanel/gridObjects'
import { ResultStatus } from './requestService'

const mockNetworkDelayMiliseconds = 2000

const GenerationInfo = {
  emotion: '',
}

/**
 * Calls symphony API and parses the return audio into gridSampleObject format
 * @param {VerifiedUserInfo} userInfo
 * @param {GenerationInfo} generationInfo
 * @param {(samples: [GridSampleObject], status: ResultStatus) => void} didCompleteRequest
 */
const RequestGenerateSamples = (userInfo, generationInfo, didCompleteRequest) => {
  setTimeout(_ => {
    console.log(`${userInfo.email} requesting samples with ${generationInfo.emotion}`)
    const resultObject = [1, 2, 3].map(_ => {
      let testSample = {}
      testSample = Object.assign(testSample, GridSampleObject)
      return testSample
    })
    didCompleteRequest(resultObject, ResultStatus.Success)
  }, mockNetworkDelayMiliseconds)
}

export { RequestGenerateSamples, GenerationInfo }
