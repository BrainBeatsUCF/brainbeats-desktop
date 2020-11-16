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
  ownerName: '',
}

const GridBeatObject = {
  isWorthSaving: false,
  sampleTitle: '',
  sampleSubTitle: '',
  isPrivate: false,
  beatID: '',
  image: '',
  savedAudio: '',
  commit: '',
  ownerName: '',
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
  audio: new File([], ''),
  image: new File([], ''),
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
  ownerName: '',
}

/// Representation of a sample object when being sent to backend
const EncodedSampleObject = {
  id: '',
  email: '',
  name: '',
  isPrivate: false,
  attributes: '',
  audio: new File([], ''),
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
  ownerName: '',
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
    beatID: '',
    image: '',
    commit: '',
    samples: [],
    savedAudio: '',
    ownerName: '',
    isPrivate: false,
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
  let seenModels = new Set()
  beatObject.samples.forEach(sample => seenModels.add(sample.sampleSubtitle))
  let retval = []
  seenModels.forEach(model => retval.push(model))
  return retval
}

/**
 * @param {JSON} instrumentList
 * @returns {String}
 */
const convertInstrumentListToSubtitle = instrumentList => {
  const instruments = JSON.parse(instrumentList)
  if (!Array.isArray(instruments)) {
    return ''
  }
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
      sampleSubtitle: sample.sampleSubtitle,
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
  let beatAttributeList = JSON.parse(beatAttributes)
  if (!Array.isArray(beatAttributeList)) {
    return []
  }
  return beatAttributeList.map(sample => {
    sample.sampleAudioBuffer = null
    return sample
  })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {GridBeatObject} beatObject
 * @param {File?} newBeatImage
 * @param {File?} newBeatAudio
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
    sampleSubtitle: convertInstrumentListToSubtitle(encodedBeatObject.instrumentList),
    isPrivate: encodedBeatObject.isPrivate,
    beatID: encodedBeatObject.id,
    image: encodedBeatObject.image,
    savedAudio: encodedBeatObject.audio,
    commit: 0,
    samples: convertAttributesToSamples(encodedBeatObject.attributes),
    duration: encodedBeatObject.duration,
    ownerName: encodedBeatObject.ownerName,
  }
  commitBeatIfNecessary(gridBeatObject)
  return gridBeatObject
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {GridSampleObject} sampleObject
 * @param {File} sampleAudio
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
  if (decodedAttributes.length == 0) {
    return {}
  }
  return {
    sampleID: decodableSample.id,
    sampleImage: decodedAttributes[0].sampleImage,
    sampleSource: decodableSample.audio,
    sampleColor: decodedAttributes[0].sampleColor,
    sampleTitle: decodableSample.name,
    sampleSubtitle: decodedAttributes[0].sampleSubtitle,
    sampleIsActive: decodedAttributes[0].sampleIsActive,
    sampleAudioDelay: decodedAttributes[0].sampleAudioDelay,
    sampleAudioStart: decodedAttributes[0].sampleAudioStart,
    sampleAudioLength: decodedAttributes[0].sampleAudioLength,
    sampleAudioBuffer: null,
    isPrivate: decodableSample.isPrivate,
    ownerName: decodableSample.ownerName,
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
