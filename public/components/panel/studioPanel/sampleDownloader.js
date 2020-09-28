import React from 'react'
import axios from 'axios'
import { GridSampleObject } from '../workstationPanel/gridComponents'
import './studioPanel.css'

let SampleDownloaderMounted = false

class SampleDownloader extends React.Component {
  /**
   * @param {{
   * sample: GridSampleObject,
   * audioContext: AudioContext,
   * onComplete: (audioBuffer: AudioBuffer) => void,
   * onError: () => void
   * }} props
   */
  constructor(props) {
    super(props)
    this.state = {
      downloadError: false,
      downloadProgress: 0,
      contentLength: 0.000001,
    }
  }

  componentDidMount() {
    const { sample } = this.props
    SampleDownloaderMounted = true
    this.startDownload(sample)
  }

  componentWillUnmount() {
    SampleDownloaderMounted = false
  }

  /**
   * @param {GridSampleObject} sample
   */
  startDownload = sample => {
    const setProgress = progressPercentage => {
      if (SampleDownloaderMounted) {
        this.setState({ downloadProgress: progressPercentage })
      }
    }
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
          sample.sampleAudioBuffer = audioBuffer
          sample.sampleAudioLength = audioBuffer.duration
          this.props.onComplete(sample)
        }
      })
      .catch(error => {
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

  render() {
    const { downloadProgress, downloadError } = this.state
    const getTitle = () => {
      if (downloadError) {
        return 'An error occured, please try again'
      } else {
        return `Downloading sample... ${downloadProgress}%`
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
