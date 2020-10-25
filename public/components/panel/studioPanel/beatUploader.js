import bufferToWav from 'audiobuffer-to-wav'
import {
  GridBeatObject,
  EncodedBeatObject,
  commitBeatIfNecessary,
  encodeBeatObject,
  decodeBeatObject,
} from '../workstationPanel/gridObjects'
import { SampleSequenceRenderer } from '../workstationPanel/sampleSequencePlayer'
import { VerifiedUserInfo } from '../../requestService/authRequestService'

/**
 *
 * @param {EncodedBeatObject} encodedBeat
 * @param {(progress: Number) => void} onUploadProgress
 * @param {(savedGridObject: GridBeatObject) => void} onUploadComplete
 * @param {() => void} onError
 */
const UploadEncodedBeat = (encodedBeat, onUploadProgress, onUploadComplete, onError) => {
  /// Todo: replace with actual request
  onUploadProgress(40)
  setTimeout(_ => {
    console.log('encoded To:::', encodedBeat)
    console.log(encodedBeat.attributes)
    let decodableBeat = { ...encodedBeat }
    decodableBeat.image = 'something'
    decodableBeat.audio = 'something'
    let retrievedBeat = decodeBeatObject(decodableBeat)
    onUploadComplete(retrievedBeat)
  }, 1000)
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {String} beatTitle
 * @param {File} beatImageFile
 * @param {GridBeatObject} beatObject
 * @param {(progress: Number) => void} onUploadProgress
 * @param {(savedGridObject: GridBeatObject) => void} onUploadComplete
 * @param {() => void} onError
 */
const BeatUploader = (userInfo, beatTitle, beatImageFile, beatObject, onUploadProgress, onUploadComplete, onError) => {
  onUploadProgress(0)
  let newBeatObject = { ...beatObject }
  newBeatObject.sampleTitle = beatTitle
  SampleSequenceRenderer(
    beatObject.samples,
    renderedAudioBuffer => {
      const retrievedWavBuffer = bufferToWav(renderedAudioBuffer)
      if (beatImageFile != null && beatImageFile != undefined) {
        beatImageFile
          .arrayBuffer()
          .then(retrievedImageBuffer => {
            UploadEncodedBeat(
              encodeBeatObject(userInfo, newBeatObject, retrievedImageBuffer, retrievedWavBuffer),
              onUploadProgress,
              onUploadComplete,
              onError
            )
          })
          .catch(error => {
            console.error.log('Error retrieving image', error)
            onError()
          })
      } else {
        UploadEncodedBeat(
          encodeBeatObject(userInfo, newBeatObject, null, retrievedWavBuffer),
          onUploadProgress,
          onUploadComplete,
          onError
        )
      }
    },
    _ => {
      console.error.log('Error rendering audio')
      onError()
    }
  )
}

export { BeatUploader }
