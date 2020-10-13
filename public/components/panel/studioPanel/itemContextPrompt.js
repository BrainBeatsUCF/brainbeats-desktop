import React from 'react'
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

  const handleItemAudioDownload = () => {
    // use audiobuffer-to-wav to download
  }

  /**
   * Handles the delete request and informs parent component when completed.
   * A failed request will have no visible effect on the UI
   */
  const handleItemDelete = () => {
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

  return (
    <div className="SaveBeatPromptBackground">
      <div className="ItemContextPrompt">
        <h4 className="SaveBeatPromptText">{props.promptTitle}</h4>
        <input
          className="LoginInput PromptButton ContextButton"
          type="button"
          value={openInputValue}
          onClick={_ => props.onLoadItemToGrid(props.value)}
        ></input>
        <input
          className="LoginInput PromptButton ContextButton"
          type="button"
          value="Download Audio File"
          onClick={_ => handleItemAudioDownload()}
        ></input>
        <input
          className="LoginInput PromptButton ContextButton"
          type="button"
          value={deleteInputValue}
          onClick={_ => {
            if (window.confirm(`Delete ${props.promptTitle} permanently?`)) {
              handleItemDelete()
            }
          }}
        ></input>
        <input
          className="LoginInput PromptButton ContextButton"
          type="button"
          value="Cancel"
          onClick={_ => props.onCancel()}
        ></input>
      </div>
    </div>
  )
}

/**
 * A wrapper to abstract hiding/showing the context prompt
 * Also handles breaking out prompt info to keys
 * @param {{
 * promptInfo: CloseContextPromptInfo,
 * setIsMakingNetworkActivity: (Boolean) => void
 * }} props
 */
const ItemContextPromptWrapper = props => {
  const { promptInfo } = props
  if (!promptInfo.shouldShowPrompt) {
    return <></>
  } else {
    return (
      <ItemContextPrompt
        promptTitle={promptInfo.title ?? ''}
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
