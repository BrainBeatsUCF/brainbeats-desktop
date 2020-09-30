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
  sampleTitle: '',
  sampleSubTitle: '',
  beatID: 0,
  image: '',
  currentHash: '',
  samples: [GridSampleObject],
}

// Todo: update to parse some request body
const createNewBeat = jsonBody => {
  return GridBeatObject
}

/**
 * @param {GridSampleObject} sample
 * @param {GridBeatObject} beat
 */
const appendSampleToBeat = (sample, beat) => {
  let retval = {}
  let source = createNewBeat()
  if (beat != null) {
    source = beat
  }
  source.samples.push(sample)
  Object.assign(retval, source)
  return retval
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

export { GridBeatObject, createNewBeat, updateBeatSamples, appendSampleToBeat, appendSamplesToBeat }
