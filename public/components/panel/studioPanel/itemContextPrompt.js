import React, { useState } from 'react'
import axios from 'axios'
import bufferToWav from 'audiobuffer-to-wav'
import audioEncoder from 'audio-encoder'
import { ListObjectType } from '../verticalListPanel/verticalListPanel'
import { GridBeatObject, GridSampleObject } from '../workstationPanel/gridObjects'
import {
  RequestDeleteBeat,
  RequestDeleteSample,
  VerifiedUserInfo,
  ResultStatus,
} from '../../requestService/itemRequestService'

/// Generic info for showing prompt dialog
const OpenContextPromptInfo = {
  title: null,
  shouldShowPrompt: true,
  value: GridBeatObject,
  type: ListObjectType,
  onLoadItemToGrid: null,
  onItemDeleted: null,
  onCancel: null,
}

/// Generic info for cloase prompt dialog
const CloseContextPromptInfo = {
  title: null,
  shouldShowPrompt: false,
  value: GridBeatObject,
  type: ListObjectType,
  onLoadItemToGrid: null,
  onItemDeleted: null,
  onCancel: null,
}

const errorMessageDisplayDuration = 1500 // milliseconds
let downloadProgress = 0

/**
 * @param {{
 * promptTitle: String,
 * userInfo: VerifiedUserInfo,
 * value: GridBeatObject | GridSampleObject,
 * type: ListObjectType,
 * setIsMakingNetworkActivity: (Boolean) => void,
 * onLoadItemToGrid: (value: GridBeatObject | GridSampleObject) => void,
 * onItemDeleted: (value: GridBeatObject | GridSampleObject) => void,
 * onCancel: () => void
 * }} props
 */
const ItemContextPrompt = props => {
  const isSample = props.type == ListObjectType.Sample
  const deleteInputValue = `Delete ${isSample ? 'Sample' : 'Beat'}`
  const openInputValue = `${isSample ? 'Add to' : 'Open in'} Workstation`
  const [activityMessage, setActivityMessage] = useState(null)

  const handleItemAudioDownload = _ => {
    // use audiobuffer-to-wav to download
    props.setIsMakingNetworkActivity(true)
    if (isSample) {
      downloadSampleAudio(props.value, _ => {
        props.setIsMakingNetworkActivity(false)
      })
    }
  }

  /**
   * @param {GridSampleObject} sample
   * @param {() => void} onComplete
   */
  const downloadSampleAudio = (sample, onComplete) => {
    const tempAudioContext = new AudioContext({ sampleRate: 44100 })
    axios({
      responseType: 'arraybuffer',
      url: 'https://cors-anywhere.herokuapp.com/' + sample.sampleSource,
      onDownloadProgress(progressEvent) {
        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
        downloadProgress = progress
        setActivityMessage(`Sample download progress... ${progress}%`)
      },
    })
      .then(response => {
        setActivityMessage('Preparing sample')
        return tempAudioContext.decodeAudioData(response.data)
      })
      .then(audioBuffer => {
        const wavData = bufferToWav(audioBuffer)
        const blob = new window.Blob([new DataView(wavData)], {
          type: 'audio/wav',
        })
        let anchor = document.createElement('a')
        let downloadURL = window.URL.createObjectURL(blob)
        anchor.href = downloadURL
        anchor.download = sample.sampleTitle + '.wav'
        anchor.click()
        window.URL.revokeObjectURL(downloadURL)
        setActivityMessage(null)
        onComplete()
      })
      .catch(error => {
        console.error(error)
        setActivityMessage('Something went wrong, please try again')
        setTimeout(() => {
          setActivityMessage(null)
          onComplete()
        }, errorMessageDisplayDuration)
      })
  }

  /**
   * Handles the delete request and informs parent component when completed.
   * A failed request will have no visible effect on the UI
   */
  const handleItemDelete = _ => {
    props.setIsMakingNetworkActivity(true)
    if (isSample) {
      RequestDeleteSample(props.userInfo, props.value, status => {
        if (status == ResultStatus.Success) {
          props.onItemDeleted(props.value)
        }
        props.setIsMakingNetworkActivity(false)
      })
    } else {
      RequestDeleteBeat(props.userInfo, props.value, status => {
        if (status == ResultStatus.Success) {
          props.onItemDeleted(props.value)
        }
        props.setIsMakingNetworkActivity(false)
      })
    }
  }

  const isInActivity = _ => {
    return activityMessage != null && activityMessage != undefined
  }

  const getActivityMessage = _ => {
    if (!isInActivity()) {
      return <></>
    } else {
      return <h4 className="SaveBeatPromptText">{activityMessage}</h4>
    }
  }

  const getDownloadAudioButton = _ => {
    if (isSample) {
      return (
        <input
          className="LoginInput PromptButton ContextButton"
          type="button"
          value="Download Audio File"
          onClick={_ => handleItemAudioDownload()}
          disabled={isInActivity()}
        ></input>
      )
    } else {
      return <></>
    }
  }

  return (
    <div className="SaveBeatPromptBackground">
      <div className="ItemContextPrompt">
        <h4 className="SaveBeatPromptText">{props.promptTitle}</h4>
        {getActivityMessage()}
        <input
          className="LoginInput PromptButton ContextButton"
          type="button"
          value={openInputValue}
          onClick={_ => props.onLoadItemToGrid(props.value)}
          disabled={isInActivity()}
        ></input>
        {getDownloadAudioButton()}
        <input
          className="LoginInput PromptButton ContextButton"
          type="button"
          value={deleteInputValue}
          onClick={_ => {
            if (window.confirm(`Delete ${props.promptTitle} permanently?`)) {
              handleItemDelete()
            }
          }}
          disabled={isInActivity()}
        ></input>
        <input
          className="LoginInput PromptButton ContextButton"
          type="button"
          value="Cancel"
          onClick={_ => props.onCancel()}
          disabled={isInActivity()}
        ></input>
      </div>
    </div>
  )
}

/**
 * A wrapper to abstract hiding/showing the context prompt
 * Also handles breaking out prompt info to keys
 * @param {{
 * userInfo: VerifiedUserInfo,
 * promptInfo: CloseContextPromptInfo,
 * setIsMakingNetworkActivity: (Boolean) => void
 * }} props
 */
const ItemContextPromptWrapper = props => {
  const { promptInfo, userInfo } = props
  if (!promptInfo.shouldShowPrompt) {
    return <></>
  } else {
    return (
      <ItemContextPrompt
        promptTitle={promptInfo.title ?? ''}
        userInfo={userInfo}
        value={promptInfo.value}
        type={promptInfo.type}
        setIsMakingNetworkActivity={props.setIsMakingNetworkActivity}
        onLoadItemToGrid={props.promptInfo.onLoadItemToGrid}
        onItemDeleted={props.promptInfo.onItemDeleted}
        onCancel={props.promptInfo.onCancel}
      ></ItemContextPrompt>
    )
  }
}

export { OpenContextPromptInfo, CloseContextPromptInfo, ItemContextPromptWrapper }
