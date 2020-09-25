import { GridSampleObject } from './gridComponents'
import toWav from 'audiobuffer-to-wav'

/**
 * @param {AudioContext} context
 * @param {AudioBuffer} sourceBuffer
 * @param {GridSampleObject} sampleObject
 */
const renderPlayedBuffer = (context, sourceBuffer, sampleObject) => {
  const destDelayLength = sampleObject.sampleAudioDelay * sourceBuffer.sampleRate
  const destContentLength = sampleObject.sampleAudioLength * sourceBuffer.sampleRate
  const sourceChannelOffset = sampleObject.sampleAudioStart * sourceBuffer.sampleRate
  const results = context.createBuffer(2, destContentLength + destDelayLength, sourceBuffer.sampleRate)
  for (let channel = 0; channel < sourceBuffer.numberOfChannels; channel++) {
    let toChannel = results.getChannelData(channel)
    const fromChannel = sourceBuffer.getChannelData(channel)
    // put in empty sound for delay
    for (let i = 0; i < destDelayLength; i++) {
      toChannel[i] = 0
    }
    // take only the part of source that will be played
    for (let i = destDelayLength, j = sourceChannelOffset; i < results.length; i++, j++) {
      toChannel[i] = fromChannel[j]
    }
  }
  return results
}

/**
 * @param {[GridSampleObject]} sampleObjects
 * @return {Number}
 */
const calculateRenderLength = sampleObjects => {
  let maxLength = 0
  sampleObjects.forEach(sample => {
    const destDelayLength = sample.sampleAudioDelay * sample.sampleAudioBuffer.sampleRate
    const destContentLength = sample.sampleAudioLength * sample.sampleAudioBuffer.sampleRate
    const totalLength = destDelayLength + destContentLength
    if (totalLength > maxLength) {
      maxLength = totalLength
    }
  })
  return maxLength
}

/**
 * @param {[GridSampleObject]} sampleObjects
 * @param {(renderedBuffer: AudioBuffer) => void} onDataReady
 * @param {() => void} onRenderError
 */
const SampleSequenceRenderer = (sampleObjects, onDataReady, onRenderError) => {
  const contextPlayLength = calculateRenderLength(sampleObjects)
  const offlineAudioContext = new window.OfflineAudioContext(2, contextPlayLength, 44100)

  sampleObjects.forEach(sampleObject => {
    let { sampleAudioBuffer, sampleIsActive } = sampleObject
    if (sampleIsActive) {
      let compressor = offlineAudioContext.createDynamicsCompressor()
      compressor.threshold.setValueAtTime(-50, offlineAudioContext.currentTime)
      compressor.knee.setValueAtTime(40, offlineAudioContext.currentTime)
      compressor.ratio.setValueAtTime(12, offlineAudioContext.currentTime)
      compressor.attack.setValueAtTime(0, offlineAudioContext.currentTime)
      compressor.release.setValueAtTime(0.25, offlineAudioContext.currentTime)

      let offlineSource = offlineAudioContext.createBufferSource()
      offlineSource.buffer = renderPlayedBuffer(offlineAudioContext, sampleAudioBuffer, sampleObject)
      offlineSource.connect(compressor)
      compressor.connect(offlineAudioContext.destination)
      offlineSource.start()
    }
  })

  offlineAudioContext
    .startRendering()
    .then(renderedBuffer => {
      console.log('Rendering complete')
      const wav = toWav(renderedBuffer)
      const blob = new window.Blob([new DataView(wav)], {
        type: 'audio/wav',
      })
      const url = window.URL.createObjectURL(blob)

      let anchor = document.createElement('a')
      anchor.style = 'display: none'
      anchor.href = url
      anchor.download = 'someaudio.wav'
      anchor.click()
      window.URL.revokeObjectURL(url)

      // let playContext = new AudioContext()
      // let song = playContext.createBufferSource()
      // song.buffer = renderedBuffer
      // song.connect(playContext.destination)
      // song.start()
    })
    .catch(error => {
      console.log(error)
    })
}

export { SampleSequenceRenderer }

// TODO:
// [] add gain to each track
// [] add handlers for data ready, should save data to grid and upload blob to database on save
