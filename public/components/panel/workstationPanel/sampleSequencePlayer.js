import { GridSampleObject } from './gridComponents'

const AcceptedSampleRate = 44100
const CompressionThreshold = -50
const CompressionKnee = 40
const CompressionRatio = 12
const CompressionAttack = 0
const CompressionRelease = 0.25

/**
 * @param {AudioContext} context
 * @param {AudioBuffer} sourceBuffer
 * @param {GridSampleObject} sampleObject
 */
const extractPlayedBuffer = (context, sourceBuffer, sampleObject) => {
  const sourceLength = sourceBuffer.length
  const resultLength = sampleObject.sampleAudioLength * sourceBuffer.sampleRate
  const sourceOffset = sampleObject.sampleAudioStart * sourceBuffer.sampleRate
  const results = context.createBuffer(sourceBuffer.numberOfChannels, resultLength, sourceBuffer.sampleRate)
  for (let channel = 0; channel < sourceBuffer.numberOfChannels; channel++) {
    let toChannel = results.getChannelData(channel)
    const fromChannel = sourceBuffer.getChannelData(channel)
    for (let i = 0, j = sourceOffset; i < resultLength, j < sourceLength; i++, j++) {
      toChannel[i] = fromChannel[j]
    }
  }
  return results
}

/**
 * @param {[GridSampleObject]} sampleObjects
 */
const calculateRenderDuration = sampleObjects => {
  return sampleObjects.reduce((prevMax, sample) => {
    if (sample.sampleAudioDelay + sample.sampleAudioLength > prevMax) {
      return sample.sampleAudioDelay + sample.sampleAudioLength
    } else {
      return prevMax
    }
  }, 0)
}

/**
 * @param {[GridSampleObject]} sampleObjects
 * @param {(renderedBuffer: AudioBuffer) => void} onDataReady
 * @param {() => void} onRenderError
 */
const SampleSequenceRenderer = (sampleObjects, onDataReady, onRenderError) => {
  const contextPlayLength = calculateRenderDuration(sampleObjects) * AcceptedSampleRate
  const contextSampleRate =
    sampleObjects.length > 0 ? sampleObjects[0].sampleAudioBuffer.sampleRate : AcceptedSampleRate
  const offlineAudioContext = new window.OfflineAudioContext(2, contextPlayLength, contextSampleRate)

  sampleObjects.forEach(sampleObject => {
    let { sampleAudioBuffer, sampleIsActive } = sampleObject
    if (sampleIsActive) {
      let compressor = offlineAudioContext.createDynamicsCompressor()
      compressor.threshold.setValueAtTime(CompressionThreshold, offlineAudioContext.currentTime)
      compressor.knee.setValueAtTime(CompressionKnee, offlineAudioContext.currentTime)
      compressor.ratio.setValueAtTime(CompressionRatio, offlineAudioContext.currentTime)
      compressor.attack.setValueAtTime(CompressionAttack, offlineAudioContext.currentTime)
      compressor.release.setValueAtTime(CompressionRelease, offlineAudioContext.currentTime)

      let offlineSource = offlineAudioContext.createBufferSource()
      offlineSource.buffer = extractPlayedBuffer(offlineAudioContext, sampleAudioBuffer, sampleObject)
      offlineSource.connect(compressor)
      compressor.connect(offlineAudioContext.destination)
      offlineSource.start(sampleObject.sampleAudioDelay)
    }
  })

  offlineAudioContext
    .startRendering()
    .then(renderedBuffer => {
      onDataReady(renderedBuffer)
    })
    .catch(error => {
      console.log(error)
      onRenderError()
    })
}

export { SampleSequenceRenderer, calculateRenderDuration }
