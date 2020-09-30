import React from 'react'
import axios from 'axios'
import { GridSampleObject } from '../workstationPanel/gridComponents'
import './studioPanel.css'

let SampleDownloaderMounted = false

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

    if (downloadIndex >= this.state.samples.length) {
      this.props.onComplete(prevResults)
      return
    }

    const setProgress = progressPercentage => {
      if (SampleDownloaderMounted) {
        this.setState({ currentDownloadProgress: progressPercentage })
      }
    }

    let sample = this.state.samples[downloadIndex]
    setProgress(0)
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
          sample.sampleAudioLength = sample.sampleAudioLength === -1 ? audioBuffer.duration : -1
          prevResults.push(sample)
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
