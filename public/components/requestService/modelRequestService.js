import axios from 'axios'
import { VerifiedUserInfo } from './authRequestService'
import { GridSampleObject } from '../panel/workstationPanel/gridObjects'
import { ResultStatus } from './requestService'

const GenerationInfo = {
  emotion: '',
  modelImageSource: '',
  modelName: '',
}

const testSampleRoutes = [
  'https://brainbeatsstorage.blob.core.windows.net/sample/trumpet.sf2.wav',
  'https://brainbeatsstorage.blob.core.windows.net/sample/woodwinds.sf2.wav',
]
let generatedSamples = []

/**
 * Calls symphony API and parses the return audio into gridSampleObject format
 * @param {AudioContext} audioContext
 * @param {VerifiedUserInfo} userInfo
 * @param {GenerationInfo} generationInfo
 * @param {(samples: [GridSampleObject], status: ResultStatus) => void} didCompleteRequest
 */
const RequestGenerateSamples = (audioContext, userInfo, generationInfo, didCompleteRequest) => {
  generatedSamples = []
  console.log(generationInfo)
  RequestGenerateSingleSample(audioContext, userInfo, testSampleRoutes.length, generationInfo, didCompleteRequest)
}

/**
 * Calls symphony API and parses the return audio into gridSampleObject format
 * @param {AudioContext} audioContext
 * @param {VerifiedUserInfo} userInfo
 * @param {Number} count
 * @param {GenerationInfo} generationInfo
 * @param {(samples: [GridSampleObject], status: ResultStatus) => void} didCompleteRequest
 */
const RequestGenerateSingleSample = (audioContext, userInfo, count, generationInfo, didCompleteRequest) => {
  if (count <= 0) {
    didCompleteRequest(generatedSamples, ResultStatus.Success)
    return
  }
  const requestURL = 'https://cors-anywhere.herokuapp.com/' + testSampleRoutes[count - 1]
  axios({
    responseType: 'arraybuffer',
    url: requestURL,
  })
    .then(response => audioContext.decodeAudioData(response.data))
    .then(decodedAudioBuffer => {
      let newSample = { ...GridSampleObject }
      newSample.sampleAudioLength = -1
      newSample.sampleAudioBuffer = decodedAudioBuffer
      newSample.sampleSubtitle = generationInfo.modelName
      newSample.sampleImage = generationInfo.modelImageSource
      newSample.sampleIsActive = true
      generatedSamples.push(newSample)
      RequestGenerateSingleSample(audioContext, userInfo, count - 1, generationInfo, didCompleteRequest)
    })
    .catch(error => {
      didCompleteRequest([], ResultStatus.Error)
      console.error(error.response)
    })
}

export { RequestGenerateSamples, GenerationInfo }
