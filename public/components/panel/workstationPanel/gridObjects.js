import hash from 'object-hash'

const GridSampleObject = {
  sampleSource: '',
  sampleTitle: '',
  sampleSubtitle: '',
  sampleIsActive: true,
  sampleAudioDelay: 0,
  sampleAudioStart: 0,
  sampleAudioLength: -1,
  sampleAudioBuffer: AudioBuffer,
}

const GridBeatObject = {
  isWorthSaving: false,
  sampleTitle: '',
  sampleSubTitle: '',
  beatID: 0,
  image: '',
  commit: '',
  isSaved: '',
  samples: [GridSampleObject],
}

// Todo: update to parse some request body
const createNewBeat = jsonBody => {
  return GridBeatObject
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
    console.log(hashValue)
    return true
  }
  return false
}

export {
  GridBeatObject,
  commitBeatIfNecessary,
  createNewBeat,
  updateBeatSamples,
  appendSamplesToBeat,
  fixResizeOverCorrections,
}
