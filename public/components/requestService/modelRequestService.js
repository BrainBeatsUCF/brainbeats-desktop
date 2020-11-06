import axios from 'axios'
import { VerifiedUserInfo } from './authRequestService'
import { GridSampleObject } from '../panel/workstationPanel/gridObjects'
import { ResultStatus } from './requestService'

const numberOfSamplesToGenerate = 5
const getSampleRoute = window.process.env['BRAINBEATS_SYMPHONY_API_URL'] + '/getSample'

const GenerationInfo = {
  emotion: '',
  modelImageSource: '',
  modelName: '',
}

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
  RequestGenerateSingleSample(audioContext, userInfo, numberOfSamplesToGenerate, generationInfo, didCompleteRequest)
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
  /// WIP: Route not ready
  axios
    .post(
      getSampleRoute,
      {
        instrument_name: generationInfo.modelName,
        emotion: generationInfo.emotion,
        seed: '60 _ ',
        num_steps: 64,
        max_seq_len: 128,
        temperature: 0.5,
      },
      {
        responseType: 'arraybuffer',
      }
    )
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
