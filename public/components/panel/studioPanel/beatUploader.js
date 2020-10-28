import bufferToWav from 'audiobuffer-to-wav'
import { SampleSequenceRenderer } from '../workstationPanel/sampleSequencePlayer'
import { VerifiedUserInfo } from '../../requestService/authRequestService'
import { RequestCreateBeat, RequestUpdateBeat } from '../../requestService/itemRequestService'
import {
  GridBeatObject,
  EncodedBeatObject,
  commitBeatIfNecessary,
  encodeBeatObject,
  decodeBeatObject,
} from '../workstationPanel/gridObjects'

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {String} beatTitle
 * @param {File} beatImageFile
 * @param {Boolean} beatIsPrivate
 * @param {GridBeatObject} beatObject
 * @param {(progress: String) => void} onUploadProgress
 * @param {(savedGridObject: GridBeatObject) => void} onUploadComplete
 * @param {() => void} onError
 */
const BeatUploader = (
  userInfo,
  beatTitle,
  beatImageFile,
  beatIsPrivate,
  beatObject,
  onUploadProgress,
  onUploadComplete,
  onError
) => {
  let newBeatObject = { ...beatObject }
  newBeatObject.sampleTitle = beatTitle
  newBeatObject.isPrivate = beatIsPrivate
  onUploadProgress('Preparing Beat for Upload...')
  SampleSequenceRenderer(
    beatObject.samples,
    renderedAudioBuffer => {
      /// Convert audio binary to file
      const retrievedWavBuffer = bufferToWav(renderedAudioBuffer)
      const retrievedWavBlob = new window.Blob([new DataView(retrievedWavBuffer)], { type: 'audio/wav' })
      const retrievedWavFile = new File([retrievedWavBlob], beatTitle + '.wav')
      /// Start upload process
      const encodedBeat = encodeBeatObject(userInfo, newBeatObject, beatImageFile, retrievedWavFile)
      /// Create a new beat if theres no ID, otherwise update using ID
      if (encodedBeat.id === '') {
        RequestCreateBeat(userInfo, encodedBeat, onUploadProgress, onUploadComplete, onError)
      } else {
        RequestUpdateBeat(userInfo, encodedBeat, onUploadProgress, onUploadComplete, onError)
      }
    },
    _ => {
      console.error('Error rendering audio')
      onError()
    }
  )
}

export { BeatUploader }
