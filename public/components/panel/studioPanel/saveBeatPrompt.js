import React, { useState } from 'react'
import ImageUploader from 'react-images-upload'
import { BeatUploader } from './beatUploader'
import { GridBeatObject } from '../workstationPanel/gridObjects'

const maximumImageUploadSize = 5242880 // 5mb
const acceptedImageFormats = ['.jpg', '.gif', '.png', '.jpeg']
let timeoutId = null

/// Generic info for displaying the save dialog
const SavePromptInfo = {
  title: null,
  shouldShowPrompt: false,
  onSaveComplete: null,
}

/// Generic info for hiding the save dialog
const ClosePromptInfo = {
  title: null,
  shouldShowPrompt: false,
  onSaveComplete: null,
}

/**
 * A dialog component that's customizable with `PromptInfo` objects.
 * @param {{
 * promptTitle: String?,
 * currentGridItem: GridBeatObject,
 * setIsMakingNetworkActivity: (Boolean) => void
 * onSaveComplete: (savedBeat: GridBeatObject) => void,
 * onSaveError: () => void
 * }} props
 */
const SaveBeatPrompt = props => {
  const placeHolder = props.currentGridItem.sampleTitle !== '' ? props.currentGridItem.sampleTitle : 'Beat Title...'
  const [beatTitle, setBeatTitle] = useState(placeHolder)
  const [beatImage, setBeatImage] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStarted, setUploadStarted] = useState(false)

  const startUpload = () => {
    if (props.currentGridItem.sampleTitle == '') {
      return
    }
    setUploadStarted(true)
    setUploadProgress(2)
    timeoutId = BeatUploader(
      beatTitle,
      beatImage,
      props.currentGridItem,
      progress => setUploadProgress(progress),
      savedGridItem => props.onSaveComplete(savedGridItem),
      props.onSaveError
    )
  }

  const getPromptTitle = () => {
    if (props.promptTitle == null && props.promptTitle == undefined) {
      return <></>
    } else {
      return <h3 className="SaveBeatPromptText">{props.promptTitle}</h3>
    }
  }

  const getProgressIndicator = () => {
    if (uploadProgress === 0) {
      return <></>
    } else {
      return <h4 className="SaveBeatPromptText">Upload progress... {uploadProgress}%</h4>
    }
  }

  return (
    <div className="SaveBeatPromptBackground">
      <form className="SaveBeatPrompt">
        {getPromptTitle()}
        <input
          className="LoginInput"
          type="text"
          placeholder={placeHolder}
          onChange={event => setBeatTitle(event.target.value)}
        ></input>
        <ImageUploader
          withPreview={true}
          withIcon={false}
          onChange={pictures => setBeatImage(pictures[0])}
          imgExtension={acceptedImageFormats}
          maxFileSize={maximumImageUploadSize}
          singleImage={true}
          buttonClassName="PromptUploadButton"
          buttonText="Choose Beat Background"
          label="Maximum file size: 5mb, accepted: jpg, gif, png, jpeg"
        />
        {getProgressIndicator()}
        <div className="SaveBeatPromptButtons">
          <input
            className="LoginInput PromptButton"
            type="button"
            value="Cancel"
            onClick={_ => {
              const cachedTimeout = timeoutId
              if (cachedTimeout != null) {
                clearTimeout(cachedTimeout)
              }
              const prevSaveCancel =
                props.currentGridItem.prevSaveCancel == undefined ? 0 : props.currentGridItem.prevSaveCancel
              props.currentGridItem.prevSaveCancel = prevSaveCancel + 1
              props.onSaveError()
            }}
          ></input>
          <input
            className="LoginInput PromptButton"
            type="button"
            value="Save"
            onClick={_ => startUpload()}
            disabled={uploadStarted}
          ></input>
        </div>
      </form>
    </div>
  )
}

/**
 * A wrapper to abstract hiding/showing the save dialog
 * @param {{
 * promptInfo: SavePromptInfo,
 * currentGridItem: GridBeatObject,
 * setIsMakingNetworkActivity: (Boolean) => void,
 * onSaveError: () => void
 * }} props
 */
const SaveBeatPromptWrapper = props => {
  const { currentGridItem, promptInfo } = props
  if (!promptInfo.shouldShowPrompt) {
    return <></>
  } else {
    return (
      <SaveBeatPrompt
        promptTitle={promptInfo.title}
        currentGridItem={currentGridItem}
        setIsMakingNetworkActivity={props.setIsMakingNetworkActivity}
        onSaveComplete={promptInfo.onSaveComplete}
        onSaveError={props.onSaveError}
      ></SaveBeatPrompt>
    )
  }
}

export { SavePromptInfo, ClosePromptInfo, SaveBeatPromptWrapper }
