import { GridSampleObject } from './gridComponents'
import toWav from 'audiobuffer-to-wav'

/**
 * @param {AudioContext} audioContext
 * @param {[String]} audioSources
 * @param {(buffers: [AudioBuffer]) => void} onLoadCompleted
 */
const AudioFileLoader = (audioContext, audioSources, onLoadCompleted) => {
  const loadedBuffers = []
  audioSources.forEach(audioSource => {
    fetch('https://cors-anywhere.herokuapp.com/' + audioSource)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        loadedBuffers.push(audioBuffer)
        if (loadedBuffers.length == audioSources.length) {
          onLoadCompleted(loadedBuffers)
        }
      })
  })
}

// TODO:
// [] test out 5 tracks
// [] calculate full length from samples before creating offlinecontext
// [] add gain to each track
// [] add handlers for failed download or render
// [] add handlers for data ready, should save data to grid and upload blob to database on save
/**
 * @param {[GridSampleObject]} sampleObjects
 * @param {*} onStateChange
 */
const SampleSequencePlayer = (sampleObjects, onStateChange, onDataReady) => {
  const audioContext = new window.AudioContext()
  const offlineAudioContext = new window.OfflineAudioContext(2, 44100 * 42, 44100) // 2 => stereo channel, 16 => 16 total seconds
  const audioSources = sampleObjects.map(single => {
    return single.sampleSource
  })
  let audioSampleSources = []
  let offlineSources = []

  AudioFileLoader(audioContext, audioSources, audioBuffers => {
    // audioBuffers.map(audioBuffer => {
    //   const sampleSource = audioContext.createBufferSource();
    //   sampleSource.buffer = audioBuffer;
    //   sampleSource.connect(audioContext.destination)
    //   sampleSource.start(audioContext.currentTime + 5, 30, 10)
    //   return sampleSource
    // })

    audioBuffers.forEach((audioBuffer, index) => {
      const { sampleAudioDelay, sampleAudioStart, sampleAudioLength } = sampleObjects[index]

      let compressor = offlineAudioContext.createDynamicsCompressor()
      compressor.threshold.setValueAtTime(-50, offlineAudioContext.currentTime)
      compressor.knee.setValueAtTime(40, offlineAudioContext.currentTime)
      compressor.ratio.setValueAtTime(12, offlineAudioContext.currentTime)
      compressor.attack.setValueAtTime(0, offlineAudioContext.currentTime)
      compressor.release.setValueAtTime(0.25, offlineAudioContext.currentTime)

      let offlineSource = offlineAudioContext.createBufferSource()
      offlineSource.buffer = audioBuffer
      offlineSource.connect(compressor)
      compressor.connect(offlineAudioContext.destination)
      offlineSource.start(offlineAudioContext.currentTime + sampleAudioDelay, sampleAudioStart, sampleAudioLength)
    })

    offlineAudioContext.startRendering().then(renderedBuffer => {
      console.log('rendering completed')
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
      // let song = audioContext.createBufferSource()
      // song.buffer = renderedBuffer
      // song.connect(audioContext.destination)
      // console.log('start playing')
      // song.start()
    })
  })
}

export { SampleSequencePlayer }
