import React, { useState } from 'react'
import { GridBeatObject } from '../workstationPanel/gridObjects'
import { SampleDownloader } from './sampleDownloader'

/// Generic info for displaying the download beat prompt
const CloseBeatDownloadPrompt = {
  shouldShowPrompt: false,
  beatObject: GridBeatObject,
  audioContext: null,
  onDownloadComplete: null,
  onDownloadError: null,
}

/**
 * @param {{
 * gridBeatObject: GridBeatObject,
 * audioContext: AudioContext,
 * onDownloadComplete: (downloadedBeat: GridBeatObject) => void,
 * onDownloadError: () => void
 * }} props
 */
const BeatDownloadPrompt = props => {
  const samplesToDownload = [...props.gridBeatObject.samples]
  const handleSamplesDownloaded = downloadedSamples => {
    let newGridObject = { ...props.gridBeatObject }
    newGridObject.samples = downloadedSamples
    props.onDownloadComplete(newGridObject)
  }
  return (
    <SampleDownloader
      samples={samplesToDownload}
      audioContext={props.audioContext}
      onComplete={handleSamplesDownloaded}
      onError={props.onDownloadError}
    ></SampleDownloader>
  )
}

/**
 *
 * @param {{
 * promptInfo: CloseBeatDownloadPrompt
 * }} props
 */
const BeatDownloadPromptWrapper = props => {
  const { promptInfo } = props
  if (!promptInfo.shouldShowPrompt) {
    return <></>
  }
  return (
    <BeatDownloadPrompt
      gridBeatObject={promptInfo.beatObject}
      audioContext={promptInfo.audioContext}
      onDownloadComplete={promptInfo.onDownloadComplete}
      onDownloadError={promptInfo.onDownloadError}
    ></BeatDownloadPrompt>
  )
}

export { BeatDownloadPromptWrapper, CloseBeatDownloadPrompt }
