import hash from 'object-hash'
import { calculateRenderDuration } from './sampleSequencePlayer'
import { VerifiedUserInfo } from '../../requestService/authRequestService'

const GridSampleObject = {
  sampleID: '',
  sampleImage: '',
  sampleSource: '',
  sampleColor: '',
  sampleTitle: '',
  sampleSubtitle: '',
  sampleIsActive: true,
  sampleAudioDelay: 0,
  sampleAudioStart: 0,
  sampleAudioLength: -1,
  sampleAudioBuffer: AudioBuffer,
  isPrivate: false,
}

const GridBeatObject = {
  isWorthSaving: false,
  sampleTitle: '',
  sampleSubTitle: '',
  isPrivate: false,
  beatID: '',
  image: '',
  commit: '',
  samples: [GridSampleObject],
}

/// Representation of beat object when being sent to backend
const EncodedBeatObject = {
  email: '',
  name: '',
  id: '',
  isPrivate: false,
  instrumentList: '',
  attributes: '',
  duration: 0,
  audio: new ArrayBuffer(0),
  image: new ArrayBuffer(0),
}

/// Representation of beat object when recieved from backend
const DecodableBeatObject = {
  email: '',
  name: '',
  id: '',
  isPrivate: false,
  instrumentList: '',
  attributes: '',
  duration: 0,
  audio: '',
  image: '',
}

/// Representation of a sample object when being sent to backend
const EncodedSampleObject = {
  id: '',
  email: '',
  name: '',
  isPrivate: false,
  attributes: '',
  audio: new ArrayBuffer(0),
  image: '',
}

/// Representation of a sample object when recieved from backend
const DecodableSampleObject = {
  id: '',
  email: '',
  name: '',
  isPrivate: false,
  attributes: '',
  audio: '',
  image: '',
}

// Todo: update to parse some request body
const createNewBeat = jsonBody => {
  return GridBeatObject
}

const getEmptyBeat = () => {
  return {
    isWorthSaving: false,
    sampleTitle: '',
    sampleSubtitle: '',
    beatID: 0,
    image: '',
    commit: '',
    samples: [],
  }
}

/**
 * @param {[GridSampleObject]} samples
 * @param {GridBeatObject} beat
 */
const appendSamplesToBeat = (samples, beat) => {
  let retval = {}
  let source = createNewBeat()
  if (beat != null) {
    source = beat
  }
  source.samples = source.samples.concat(samples)
  Object.assign(retval, source)
  return retval
}

/**
 * @param {[GridSampleObject]} samples
 * @param {GridBeatObject} beat
 */
const updateBeatSamples = (samples, beat) => {
  let retval = {}
  let source = createNewBeat()
  if (beat != null) {
    source = beat
  }
  source.samples = samples
  Object.assign(retval, source)
  return retval
}

/**
 * @param {GridSampleObject} sample
 */
const fixResizeOverCorrections = sample => {
  const maxDurationPossible = sample.sampleAudioBuffer.duration
  if (sample.sampleAudioDelay < 0) {
    sample.sampleAudioDelay = 0
  }
  if (sample.sampleAudioStart < 0) {
    sample.sampleAudioStart = 0
  }
  if (sample.sampleAudioLength < 0) {
    sample.sampleAudioLength = 0
  }
  if (sample.sampleAudioStart > maxDurationPossible) {
    sample.sampleAudioStart = maxDurationPossible
  }
  if (sample.sampleAudioLength > maxDurationPossible) {
    sample.sampleAudioLength = maxDurationPossible
  }
  if (sample.sampleAudioStart + sample.sampleAudioLength > maxDurationPossible) {
    sample.sampleAudioStart = maxDurationPossible - sample.sampleAudioLength
  }
}

/**
 * @param {GridBeatObject} beatObject
 */
const getCommit = beatObject => {
  let commitObject = {}
  Object.assign(commitObject, beatObject)
  commitObject.samples = beatObject.samples.map(sample => {
    return (
      `${sample.sampleTitle}` +
      `${sample.sampleSubtitle}` +
      `${sample.sampleSource}` +
      `${sample.sampleIsActive}` +
      `${sample.sampleAudioStart}` +
      `${sample.sampleAudioLength}` +
      `${sample.sampleAudioDelay}`
    )
  })
  commitObject.commit = ''
  return commitObject
}

/**
 * Checks if object has been saved and saves otherwise
 * Used in place of a normal isSaved because hashing can be an expensive operation
 * @param {GridBeatObject} beatObject
 * @return {Boolean} indicates if save operation occured
 */
const commitBeatIfNecessary = beatObject => {
  const commitObject = getCommit(beatObject)
  const hashValue = hash(commitObject)
  if (beatObject.commit != hashValue) {
    beatObject.commit = hashValue
    return true
  }
  return false
}

/**
 * @param {GridBeatObject} beatObject
 * @return {[String]}
 */
const generateBeatInstrumentList = beatObject => {
  return beatObject.samples.map(sample => {
    return sample.sampleSubtitle
  })
}

const convertInstrumentListToSubtitle = instrumentList => {
  const instruments = JSON.parse(instrumentList)
  const retval = instruments.reduce((prev, curr, index) => {
    return index == 0 ? curr : prev + ', ' + curr
  }, '')
  return retval
}

/**
 * @param {[GridSampleObject]} samples
 */
const generateAttributesFromSamples = samples => {
  return samples.map(sample => {
    return {
      sampleID: sample.sampleID,
      sampleTitle: sample.sampleTitle,
      sampleSubTitle: sample.sampleSubtitle,
      sampleImage: sample.sampleImage,
      sampleColor: sample.sampleColor,
      sampleSource: sample.sampleSource,
      sampleIsActive: sample.sampleIsActive,
      sampleAudioStart: sample.sampleAudioStart,
      sampleAudioLength: sample.sampleAudioLength,
      sampleAudioDelay: sample.sampleAudioDelay,
      isPrivate: sample.isPrivate,
    }
  })
}

/**
 * @param {String} beatAttributes
 */
const convertAttributesToSamples = beatAttributes => {
  return JSON.parse(beatAttributes).map(sample => {
    sample.sampleAudioBuffer = null
    return sample
  })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {GridBeatObject} beatObject
 * @param {ArrayBuffer?} newBeatImage
 * @param {ArrayBuffer?} newBeatAudio
 * @return {EncodedBeatObject}
 */
const encodeBeatObject = (userInfo, beatObject, newBeatImage, newBeatAudio) => {
  let encodedBeatObject = {
    id: beatObject.beatID,
    email: userInfo.email,
    name: beatObject.sampleTitle,
    isPrivate: beatObject.isPrivate,
    instrumentList: JSON.stringify(generateBeatInstrumentList(beatObject)),
    attributes: JSON.stringify(generateAttributesFromSamples(beatObject.samples)),
    duration: calculateRenderDuration(beatObject.samples),
  }
  if (newBeatAudio != null && newBeatAudio != undefined) {
    encodedBeatObject.audio = newBeatAudio
  }
  if (newBeatImage != null && newBeatImage != undefined) {
    encodedBeatObject.image = newBeatImage
  }
  return encodedBeatObject
}

/**
 * @param {DecodableBeatObject} encodedBeatObject
 * @return {GridBeatObject}
 */
const decodeBeatObject = encodedBeatObject => {
  let gridBeatObject = {
    isWorthSaving: true,
    sampleTitle: encodedBeatObject.name,
    sampleSubTitle: convertInstrumentListToSubtitle(encodedBeatObject.instrumentList),
    isPrivate: encodedBeatObject.isPrivate,
    beatID: encodedBeatObject.id,
    image: encodedBeatObject.image,
    commit: 0,
    samples: convertAttributesToSamples(encodedBeatObject.attributes),
  }
  commitBeatIfNecessary(gridBeatObject)
  return gridBeatObject
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {GridSampleObject} sampleObject
 * @param {ArrayBuffer} sampleAudio
 * @return {EncodedSampleObject}
 */
const encodeSampleObject = (userInfo, sampleObject, sampleAudio) => {
  return {
    id: sampleObject.sampleID,
    email: userInfo.email,
    name: sampleObject.sampleTitle,
    isPrivate: sampleObject.isPrivate,
    attributes: JSON.stringify(generateAttributesFromSamples([sampleObject])),
    audio: sampleAudio,
    image: sampleObject.sampleImage,
  }
}

/**
 * @param {DecodableSampleObject} decodableSample
 * @return {GridSampleObject}
 */
const decodeSampleObject = decodableSample => {
  const decodedAttributes = convertAttributesToSamples(decodableSample.attributes)
  return {
    sampleID: decodableSample.id,
    sampleImage: decodableSample.image,
    sampleSource: decodableSample.audio,
    sampleColor: decodedAttributes.sampleColor,
    sampleTitle: decodableSample.name,
    sampleSubtitle: decodedAttributes.sampleSubTitle,
    sampleIsActive: true,
    sampleAudioDelay: decodedAttributes.sampleAudioDelay,
    sampleAudioStart: decodedAttributes.sampleAudioStart,
    sampleAudioLength: decodedAttributes.sampleAudioLength,
    sampleAudioBuffer: null,
    isPrivate: decodableSample.isPrivate,
  }
}

export {
  GridSampleObject,
  GridBeatObject,
  EncodedBeatObject,
  DecodableBeatObject,
  EncodedSampleObject,
  DecodableSampleObject,
  commitBeatIfNecessary,
  createNewBeat,
  updateBeatSamples,
  appendSamplesToBeat,
  fixResizeOverCorrections,
  encodeBeatObject,
  decodeBeatObject,
  encodeSampleObject,
  decodeSampleObject,
  getEmptyBeat,
}
