import React from 'react'
import axios from 'axios'
import { CELL_COLOR_SATURATION, CELL_COLOR_BRIGHTNESS } from '../workstationPanel/constants'
import { GridSampleObject } from '../workstationPanel/gridComponents'
import './studioPanel.css'

let SampleDownloaderMounted = false
let downloadedSampleCache = {}
let assignedSampleColor = {}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l) {
  let r, g, b
  if (s == 0) {
    r = g = b = l // achromatic
  } else {
    let hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s
    let p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

/**
 * Returns a dark color in hsl format
 * @return {String}
 */
const RandomDarkColor = _ => {
  const start = 0
  const end = 360
  const hue = Math.floor(Math.random() * (end - start + 1) + start)
  const rgb = hslToRgb((hue % 360) / 360, CELL_COLOR_SATURATION / 100, CELL_COLOR_BRIGHTNESS / 100)
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}

class SampleDownloader extends React.Component {
  /**
   * @param {{
   * samples: [GridSampleObject],
   * audioContext: AudioContext,
   * onComplete: (samples: [GridSampleObject]) => void,
   * onError: () => void
   * }} props
   */
  constructor(props) {
    super(props)
    this.state = {
      downloadError: false,
      samples: props.samples,
      currentDownloadIndex: 0,
      currentDownloadProgress: 0,
    }
  }

  componentDidMount() {
    const { sample } = this.props
    SampleDownloaderMounted = true
    this.startDownload([], 0)
  }

  componentWillUnmount() {
    SampleDownloaderMounted = false
  }

  /**
   * @param {GridSampleObject} prevResults
   * @param {Number} downloadIndex
   */
  startDownload = (prevResults, downloadIndex) => {
    if (!SampleDownloaderMounted) {
      return
    }

    if (downloadIndex >= this.state.samples.length && SampleDownloaderMounted) {
      downloadedSampleCache = {} // empty cache to save memory
      this.props.onComplete(prevResults)
      return
    }

    const setProgress = progressPercentage => {
      if (SampleDownloaderMounted) {
        this.setState({ currentDownloadProgress: progressPercentage })
      }
    }

    const setCurrentDownloadIndex = _ => {
      if (SampleDownloaderMounted) {
        this.setState({ currentDownloadIndex: downloadIndex })
      }
    }

    let sample = this.state.samples[downloadIndex]
    // check sample audio has already been downloaded and take from cache if available
    // otherwise, initiate download
    const cachedBuffer = downloadedSampleCache[sample.sampleSource]
    if (cachedBuffer != null && cachedBuffer != undefined) {
      sample.sampleColor = assignedSampleColor[sample.sampleSource]
      sample.sampleAudioBuffer = cachedBuffer
      sample.sampleAudioLength = sample.sampleAudioLength === -1 ? cachedBuffer.duration : sample.sampleAudioLength
      prevResults.push(sample)
      downloadedSampleCache[sample.sampleSource] = cachedBuffer
      this.startDownload(prevResults, downloadIndex + 1)
    } else {
      setProgress(0)
      setCurrentDownloadIndex()
      axios({
        responseType: 'arraybuffer',
        url: 'https://cors-anywhere.herokuapp.com/' + sample.sampleSource,
        onDownloadProgress(progressEvent) {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
          setProgress(progress)
        },
      })
        .then(response => this.props.audioContext.decodeAudioData(response.data))
        .then(audioBuffer => {
          if (SampleDownloaderMounted) {
            const cachedBackgroundColor = assignedSampleColor[sample.sampleSource]
            const backgroundColor =
              cachedBackgroundColor == null || cachedBackgroundColor == undefined
                ? RandomDarkColor()
                : cachedBackgroundColor
            sample.sampleColor = backgroundColor
            sample.sampleAudioBuffer = audioBuffer
            sample.sampleAudioLength = sample.sampleAudioLength === -1 ? audioBuffer.duration : sample.sampleAudioLength
            prevResults.push(sample)
            downloadedSampleCache[sample.sampleSource] = audioBuffer
            assignedSampleColor[sample.sampleSource] = backgroundColor
            this.startDownload(prevResults, downloadIndex + 1)
          }
        })
        .catch(error => {
          console.error(error)
          if (SampleDownloaderMounted) {
            this.setState({ downloadError: true })
            setTimeout(() => {
              if (SampleDownloaderMounted) {
                this.props.onError()
              }
            }, 1500)
          }
        })
    }
  }

  render() {
    const { currentDownloadIndex, currentDownloadProgress, samples, downloadError } = this.state
    const sampleTitle = currentDownloadIndex < samples.length ? samples[currentDownloadIndex].sampleTitle : 'Sample'
    const getTitle = () => {
      if (downloadError) {
        return 'An error occured, please try again'
      } else {
        return `Downloading ${sampleTitle}... ${currentDownloadProgress}%`
      }
    }
    return (
      <div className="SampleDownloader">
        <h5 className="SampleDownloadedTitle">{getTitle()}</h5>
      </div>
    )
  }
}

export { SampleDownloader }
