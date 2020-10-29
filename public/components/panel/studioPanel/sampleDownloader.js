import React from 'react'
import Color from 'color'
import axios from 'axios'
import { GridSampleObject } from '../workstationPanel/gridComponents'
import {
  CELL_COLOR_SATURATION,
  CELL_COLOR_BRIGHTNESS,
  MAXIMUM_GRID_COLUMN_COUNT,
  CELL_WIDTH_IN_PIXELS,
  PIXELS_PER_SECOND,
} from '../workstationPanel/constants'
import './studioPanel.css'

let SampleDownloaderMounted = false
let downloadedSampleCache = {}
let assignedSampleColor = {}

/**
 * Returns a dark color in hsl format
 * @return {String}
 */
const RandomDarkColor = _ => {
  const start = 0
  const end = 360
  let hue = Math.floor(Math.random() * (end - start + 1) + start) % 360
  const randomColor = Color.hsl([hue, CELL_COLOR_SATURATION, CELL_COLOR_BRIGHTNESS])
  return randomColor.rgb().string()
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
      sample.sampleAudioLength =
        sample.sampleAudioLength === -1 ? Math.floor(cachedBuffer.duration) : sample.sampleAudioLength
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
            const maximumAudioLength = MAXIMUM_GRID_COLUMN_COUNT * (CELL_WIDTH_IN_PIXELS / PIXELS_PER_SECOND)
            const backgroundColor =
              cachedBackgroundColor == null || cachedBackgroundColor == undefined
                ? RandomDarkColor()
                : cachedBackgroundColor
            sample.sampleColor = backgroundColor
            sample.sampleAudioBuffer = audioBuffer
            sample.sampleAudioLength =
              sample.sampleAudioLength === -1 ? Math.floor(audioBuffer.duration) : sample.sampleAudioLength
            if (sample.sampleAudioLength > maximumAudioLength) {
              sample.sampleAudioLength = maximumAudioLength
            }
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
