import { GridBeatObject, commitBeatIfNecessary } from '../workstationPanel/gridObjects'

/**
 * @param {String} beatTitle
 * @param {File} beatImageFile
 * @param {GridBeatObject} beatObject
 * @param {(progress: Number) => void} onUploadProgress
 * @param {(savedGridObject: GridBeatObject) => void} onUploadComplete
 * @param {() => void} onError
 */
const BeatUploader = (beatTitle, beatImageFile, beatObject, onUploadProgress, onUploadComplete, onError) => {
  // Temporary placeholder
  // To be replaced with axios request to database which can
  // monitor upload progress
  onUploadProgress(40)
  const timeoutID = setTimeout(() => {
    console.log('here')
    let copyBeat = {}
    Object.assign(copyBeat, beatObject)
    copyBeat.sampleTitle = beatTitle
    copyBeat.image = beatImageFile != null ? beatImageFile.path : ''
    commitBeatIfNecessary(copyBeat)
    onUploadComplete(copyBeat)
  }, 1000)
  return timeoutID
}

export { BeatUploader }
