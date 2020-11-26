import React, { useEffect, useState } from 'react'
import { SynthesizingStage, SynthModelObject } from './synthesizerComponents'
import { closeHardwareSocket } from './hardwareSocketHandler'
import {
  SelectionSynthesizingPanel,
  EEGProcessingSynthesizingPanel,
  ModelingSynthesizingPanel,
  UploadSynthesizingPanel,
} from './synthesizerPanel'
import './synthesizerPanel.css'

const defaultEmotionValue = 'predict'
const HideSynthesizerInfo = {
  shouldShowSynthesizer: false,
  onSynthesizerClose: null,
}

/**
 * @param {HideSynthesizerInfo} props
 */
const SynthPanelCollection = props => {
  const { onSynthesizerClose } = props
  const [currentStage, setCurrentStage] = useState(SynthesizingStage.Selecting)
  const [synthModel, setSynthModel] = useState(SynthModelObject)
  const [predictedEmotion, setPredictedEmotion] = useState(defaultEmotionValue)
  const [generatedSamples, setGeneratedSamples] = useState([])

  useEffect(() => {
    window.process.env['generation_key'] = `${new Date()}`
    return function cleanup() {
      window.process.env['generation_key'] = ''
    }
  }, [])

  /**
   * @param {String} emotion
   */
  const handleEmotionPredicted = emotion => {
    setPredictedEmotion(emotion)
    setCurrentStage(SynthesizingStage.Modeling)
    closeHardwareSocket()
  }

  /**
   * @param {String} emotionOption
   */
  const handleToggleEEGHardwareConnection = emotionOption => {
    setPredictedEmotion(emotionOption)
  }

  /**
   * @param {String} error
   */
  const handleHardwareError = error => {
    setCurrentStage(SynthesizingStage.Selecting)
    console.error(error)
  }

  switch (currentStage) {
    case SynthesizingStage.Selecting:
      return (
        <SelectionSynthesizingPanel
          onModelSelect={modelObject => {
            setSynthModel(modelObject)
            if (predictedEmotion === 'predict') {
              setCurrentStage(SynthesizingStage.Connecting)
            } else {
              /// Skip to modeling if user chose not specific emotion
              setCurrentStage(SynthesizingStage.Modeling)
            }
          }}
          handleToggleEEGHardwareConnection={handleToggleEEGHardwareConnection}
          onClose={onSynthesizerClose}
        ></SelectionSynthesizingPanel>
      )
    case SynthesizingStage.Connecting:
    case SynthesizingStage.Recording:
      return (
        <EEGProcessingSynthesizingPanel
          onEmotionPredicted={handleEmotionPredicted}
          onHardwareError={handleHardwareError}
          onRestart={_ => setCurrentStage(SynthesizingStage.Selecting)}
          onClose={onSynthesizerClose}
          stage={currentStage}
        ></EEGProcessingSynthesizingPanel>
      )
    case SynthesizingStage.Modeling:
      return (
        <ModelingSynthesizingPanel
          selectedModel={synthModel}
          predictedEmotion={predictedEmotion}
          onSamplesGenerated={samples => {
            setGeneratedSamples(samples)
            setCurrentStage(SynthesizingStage.Completed)
          }}
          onRestart={_ => setCurrentStage(SynthesizingStage.Selecting)}
          onClose={onSynthesizerClose}
        ></ModelingSynthesizingPanel>
      )
    case SynthesizingStage.Completed:
      return (
        <UploadSynthesizingPanel
          generatedSamples={generatedSamples}
          onRestart={_ => setCurrentStage(SynthesizingStage.Selecting)}
          onClose={onSynthesizerClose}
        ></UploadSynthesizingPanel>
      )
    default:
      return <></>
  }
}

/**
 * @param {HideSynthesizerInfo} props
 */
const SynthesizerManager = props => {
  if (!props.shouldShowSynthesizer) {
    return <></>
  } else {
    return <SynthPanelCollection {...props}></SynthPanelCollection>
  }
}

export { SynthesizerManager }
