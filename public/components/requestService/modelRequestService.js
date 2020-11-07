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
  modelCommonName: '',
}

let indexBeingGenerated = 0
let generatedSamples = []

/**
 * Calls symphony API and parses the return audio into gridSampleObject format
 * @param {AudioContext} audioContext
 * @param {VerifiedUserInfo} userInfo
 * @param {GenerationInfo} generationInfo
 * @param {(index: Number) => void} onGenerationProgress
 * @param {(samples: [GridSampleObject], status: ResultStatus) => void} didCompleteRequest
 */
const RequestGenerateSamples = (audioContext, userInfo, generationInfo, onGenerationProgress, didCompleteRequest) => {
  generatedSamples = []
  indexBeingGenerated = 0
  RequestGenerateSingleSample(
    audioContext,
    userInfo,
    numberOfSamplesToGenerate,
    generationInfo,
    onGenerationProgress,
    didCompleteRequest
  )
}

/**
 * Calls symphony API and parses the return audio into gridSampleObject format
 * @param {AudioContext} audioContext
 * @param {VerifiedUserInfo} userInfo
 * @param {Number} count
 * @param {GenerationInfo} generationInfo
 * @param {(index: Number) => void} onGenerationProgress
 * @param {(samples: [GridSampleObject], status: ResultStatus) => void} didCompleteRequest
 */
const RequestGenerateSingleSample = (
  audioContext,
  userInfo,
  count,
  generationInfo,
  onGenerationProgress,
  didCompleteRequest
) => {
  if (count <= 0) {
    didCompleteRequest(generatedSamples, ResultStatus.Success)
    return
  }
  /// WIP: Route not ready
  onGenerationProgress(indexBeingGenerated)
  axios
    //.post(
    // getSampleRoute,
    // {
    //   instrument_name: generationInfo.modelName,
    //   emotion: generationInfo.emotion,
    //   seed: '60 _ ',
    //   num_steps: 64,
    //   max_seq_len: 128,
    //   temperature: 0.5,
    // },
    .get(
      'https://cors-anywhere.herokuapp.com/' +
        'https://brainbeatsstorage.blob.core.windows.net/static/ff17d2d8-0505-484f-bfb5-b344df6bd333.wav',
      {
        responseType: 'arraybuffer',
      }
    )
    .then(response => audioContext.decodeAudioData(response.data))
    .then(decodedAudioBuffer => {
      let newSample = { ...GridSampleObject }
      newSample.sampleAudioLength = -1
      newSample.sampleAudioBuffer = decodedAudioBuffer
      newSample.sampleSubtitle = generationInfo.modelCommonName
      newSample.sampleImage = generationInfo.modelImageSource
      newSample.sampleIsActive = true
      generatedSamples.push(newSample)
      indexBeingGenerated += 1
      RequestGenerateSingleSample(
        audioContext,
        userInfo,
        count - 1,
        generationInfo,
        onGenerationProgress,
        didCompleteRequest
      )
    })
    .catch(error => {
      didCompleteRequest([], ResultStatus.Error)
      console.error(error.response)
    })
}

export { RequestGenerateSamples, GenerationInfo }
