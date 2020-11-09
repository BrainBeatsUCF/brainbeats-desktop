import React, { useEffect, useState } from 'react'
import SynthesizerModels from './synthesizerModels.json'
import { startHardwareSocket, closeHardwareSocket } from './hardwareSocketHandler'
import { MODEL_CELL_LENGTH_IN_PIXELS, SynthesizingStage } from './synthesizerComponents'
import { GridSampleObject } from '../../workstationPanel/gridObjects'
import { RequestGenerateSamples } from '../../../requestService/modelRequestService'
import { RequestCreateSamples } from '../../../requestService/itemRequestService'
import { GetUserAuthInfo, ResultStatus, VerifiedUserInfo } from '../../../requestService/authRequestService'
import {
  SynthSelectionStagePanel,
  SynthProcessingStagePanel,
  SynthCompletedStagePanel,
  SynthesizingStageNavigation,
  SynthModelObject,
} from './synthesizerComponents'
import './synthesizerPanel.css'

/// Cancel Token for monitering axios request
/// TODO: Store cancel token for axios call here and cancel if disrupt
const SampleSynthAudioContext = new AudioContext({ sampleRate: 44100 })

const StageTitle = {
  Selecting: 'Select Sample Synthesizer',
  Default: 'Sample Creator Processing',
  Completed: 'Sample Generation Completed',
}

const HideSynthesizerInfo = {
  customClassname: '',
  userInfo: VerifiedUserInfo,
  shouldShowSynthesizer: false,
  onSynthesizerClose: null,
}

const lengthForModelCount = count => {
  const lengthWithMargin = MODEL_CELL_LENGTH_IN_PIXELS + 40
  let length = lengthWithMargin
  const minimumMiddleCount = Math.ceil(Math.sqrt(count))
  while (length / lengthWithMargin < minimumMiddleCount) {
    length += lengthWithMargin
  }
  return length
}

/**
 * @param {{
 * onModelSelect: (modelObject: SynthModelObject) => void
 * onClose: () => void
 * }} props
 */
const SelectionSynthesizingPanel = props => {
  const modelContainerLength = lengthForModelCount(SynthesizerModels.length)
  return (
    <>
      <div className={'Synthesizer'}>
        <SynthesizingStageNavigation
          stageTitle={StageTitle.Selecting}
          onMenuButtonClick={props.onClose}
        ></SynthesizingStageNavigation>
        <SynthSelectionStagePanel
          customClassname="SynthesizerFullBodySection"
          modelCardsContainerWidth={modelContainerLength}
          availableSynthModels={SynthesizerModels}
          handleSynthModelClick={props.onModelSelect}
        ></SynthSelectionStagePanel>
      </div>
    </>
  )
}

/**
 * @param {{
 * onEmotionPredicted: (emotion: String) => void,
 * onHardwareError: (error: any) => void
 * onRestart: () void,
 * onClose: () => void,
 * stage: SynthesizingStage
 * }} props
 */
const EEGProcessingSynthesizingPanel = props => {
  let processingPanelMounted = false

  const bootUpHardware = _ => {
    startHardwareSocket(
      emotion => {
        if (processingPanelMounted) {
          props.onEmotionPredicted(emotion)
        }
      },
      error => {
        if (processingPanelMounted) {
          props.onHardwareError(error)
        }
      },
      _ => {} // Not handling confirmation callback
    )
  }

  useEffect(() => {
    processingPanelMounted = true
    bootUpHardware()
    return function cleanup() {
      processingPanelMounted = false
    }
  }, [])

  return (
    <>
      <div className="SynthesizerHeaderOverlay"></div>
      <div className={'Synthesizer'}>
        <SynthesizingStageNavigation
          stageTitle={StageTitle.Default}
          onMenuButtonClick={_ => {
            closeHardwareSocket()
            props.onClose()
          }}
        ></SynthesizingStageNavigation>
        <SynthProcessingStagePanel
          leftSectionClassname="SynthesizerLeftBodySection"
          rightSectionClassname="SynthesizerRightBodySection"
          synthesizingStage={SynthesizingStage.Recording}
          sampleGenerationIndex={0}
        ></SynthProcessingStagePanel>
      </div>
    </>
  )
}

/**
 * @param {{
 * selectedModel: SynthModelObject,
 * predictedEmotion: String,
 * onSamplesGenerated: (samples: [GridSampleObject]) => void,
 * onRestart: () void,
 * onClose: () => void
 * }} props
 */
const ModelingSynthesizingPanel = props => {
  let modelingPanelMounted = false
  const { selectedModel, predictedEmotion } = props
  const [sampleGenerationIndex, setSampleGenerationIndex] = useState(0)

  const startRequestingSamples = _ => {
    let sampleGenerationInfo = {
      emotion: predictedEmotion,
      modelImageSource: selectedModel.modelImageName,
      modelName: selectedModel.queryName,
      modelCommonName: selectedModel.modelName,
    }
    RequestGenerateSamples(
      SampleSynthAudioContext,
      GetUserAuthInfo(),
      sampleGenerationInfo,
      currentSampleGenerationIndex => {
        if (modelingPanelMounted) {
          setSampleGenerationIndex(currentSampleGenerationIndex)
        }
      },
      (samples, status) => {
        if (status === ResultStatus.Error) {
          if (modelingPanelMounted) {
            props.onRestart()
          }
          return
        }
        if (modelingPanelMounted) {
          props.onSamplesGenerated(samples)
        }
      }
    )
  }

  useEffect(() => {
    modelingPanelMounted = true
    startRequestingSamples()
    return function cleanup() {
      modelingPanelMounted = false
    }
  }, [])

  return (
    <>
      <div className="SynthesizerHeaderOverlay"></div>
      <div className={'Synthesizer'}>
        <SynthesizingStageNavigation
          stageTitle={StageTitle.Default}
          onMenuButtonClick={_ => {
            // TODO: Call cancel executer for request
            props.onClose()
          }}
        ></SynthesizingStageNavigation>
        <SynthProcessingStagePanel
          leftSectionClassname="SynthesizerLeftBodySection"
          rightSectionClassname="SynthesizerRightBodySection"
          synthesizingStage={SynthesizingStage.Modeling}
          sampleGenerationIndex={sampleGenerationIndex}
        ></SynthProcessingStagePanel>
      </div>
    </>
  )
}

/**
 * @param {{
 * generatedSamples: [GridSampleObject],
 * onRestart: () void,
 * onClose: () => void
 * }} props
 */
const UploadSynthesizingPanel = props => {
  let uploadPanelMounted = false
  const { generatedSamples } = props
  const [hasBegunUpload, setHasBegunUpload] = useState(false)
  const [sampleUploadProgress, setSampleUploadProgress] = useState('')
  const overlayStyle = {
    visibility: hasBegunUpload ? 'visible' : 'hidden',
  }

  /**
   * @param {[GridSampleObject]} selectedSamples
   */
  const uploadSamples = selectedSamples => {
    setHasBegunUpload(true)
    RequestCreateSamples(
      GetUserAuthInfo(),
      0,
      selectedSamples,
      [],
      progressMessage => {
        if (uploadPanelMounted) {
          setSampleUploadProgress(progressMessage)
        }
      },
      // Success Callback
      _ => {
        if (uploadPanelMounted) {
          props.onClose()
        }
      },
      // Error Callback
      _ => {
        if (uploadPanelMounted) {
          props.onRestart()
        }
      }
    )
  }

  useEffect(() => {
    uploadPanelMounted = true
    return function cleanup() {
      uploadPanelMounted = false
    }
  }, [])

  return (
    <>
      <div className="SynthesizerHeaderOverlay"></div>
      <div className={'Synthesizer'}>
        <SynthesizingStageNavigation
          stageTitle={StageTitle.Completed}
          onMenuButtonClick={props.onClose}
        ></SynthesizingStageNavigation>
        <SynthCompletedStagePanel
          leftSectionClassname="SynthesizerLeftBodySection"
          rightSectionClassname="SynthesizerRightBodySection"
          audioContext={SampleSynthAudioContext}
          synthesizingStage={SynthesizingStage.Completed}
          sampleOptions={generatedSamples}
          saveSamples={selectedSamples => uploadSamples(selectedSamples)}
          restartGenerator={props.onRestart}
        ></SynthCompletedStagePanel>
      </div>
      <div className="SampleUploadOverlay" style={overlayStyle}>
        <h5 className="SampleUploadText">{sampleUploadProgress}</h5>
      </div>
    </>
  )
}

export {
  HideSynthesizerInfo,
  SelectionSynthesizingPanel,
  EEGProcessingSynthesizingPanel,
  ModelingSynthesizingPanel,
  UploadSynthesizingPanel,
}
