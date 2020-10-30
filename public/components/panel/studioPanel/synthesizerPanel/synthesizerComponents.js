import React, { useEffect, useState } from 'react'
import { GridSampleObject } from '../../workstationPanel/gridObjects'
import PlayButton from '../../../../images/whitePlayButton.png'
import PauseButton from '../../../../images/pauseButton.png'
import './synthesizerComponents.css'
import { lab } from 'color'

const MODEL_CARD_KEY_PREFIX = 'synthModelCard'
const MODEL_CELL_LENGTH_IN_PIXELS = 100

let SynthSamplesMounted = false
let currentAudioSource = null
let currentAudioBufferIndex = -1

const SynthModelObject = {
  modelImageName: '',
  modelName: '',
  modelBackgroundColor: '',
}

const SynthesizingStage = {
  Selecting: 'Selecting',
  Connecting: 'Connecting',
  Recording: 'Recording',
  Modeling: 'Modeling',
  Completed: 'Completed',
}

const ProcessingStageInfo = {
  Connecting: 'Connecting to EEG headset',
  Recording: 'Recording EEG Data',
  Modeling: 'Generating Samples',
  Completed: 'Generated Samples',
}

/**
 * @param {{
 * modelObjects: [SynthModelObject],
 * onModelClick: (modelObject: SynthModelObject) => void
 * }} props
 */
const SynthModelCards = props => {
  return props.modelObjects.map((modelObject, index) => {
    const modelBackgroundColor =
      modelObject.modelBackgroundColor == null || modelObject.modelBackgroundColor == undefined
        ? 'rgb(10, 48, 89)'
        : modelObject.modelBackgroundColor
    return (
      <div
        className="SynthModelCard Tooltip"
        key={MODEL_CARD_KEY_PREFIX + index}
        style={{
          height: MODEL_CELL_LENGTH_IN_PIXELS,
          width: MODEL_CELL_LENGTH_IN_PIXELS,
          backgroundColor: modelBackgroundColor,
        }}
        onClick={() => props.onModelClick(modelObject)}
      >
        <img className="SynthModelCardImage" src={modelObject.modelImageName} alt={modelObject.modelName}></img>
        <span className="TooltipText">{modelObject.modelName}</span>
      </div>
    )
  })
}

/**
 * @param {{
 * customClassname: String?,
 * modelCardsContainerWidth: Number,
 * availableSynthModels: [SynthModelObject],
 * handleSynthModelClick: (modelObject: SynthModelObject) => void
 * }} props
 */
const SynthSelectionStagePanel = props => {
  const customClassname = props.customClassname ?? ''
  const { modelCardsContainerWidth, availableSynthModels } = props
  return (
    <div className={customClassname}>
      <div
        className="SynthModelsContainer"
        style={{
          width: modelCardsContainerWidth,
        }}
      >
        <SynthModelCards
          modelObjects={availableSynthModels}
          onModelClick={props.handleSynthModelClick}
        ></SynthModelCards>
      </div>
    </div>
  )
}

/**
 * @param {{
 * className: String,
 * isAnimating: Boolean
 * }} props
 */
const SynthVisualizer = props => {
  const SynthAnimationStyle = !props.isAnimating ? '' : 'SynthAnimationStyle'
  return (
    <div className={`FlexWithCenteredContent ${props.className}`}>
      <div className={`SynthVisualizer ${SynthAnimationStyle}`}></div>
    </div>
  )
}

/**
 * @param {{
 * leftSectionClassname: String?,
 * rightSectionClassname: String?,
 * synthesizingStage: SynthesizingStage
 * }} props
 */
const SynthProcessingStagePanel = props => {
  const { leftSectionClassname, rightSectionClassname, synthesizingStage } = props
  const shouldAnimateVisualizer =
    synthesizingStage === SynthesizingStage.Recording || synthesizingStage === SynthesizingStage.Modeling
  return (
    <>
      <SynthVisualizer className={leftSectionClassname} isAnimating={shouldAnimateVisualizer}></SynthVisualizer>
      <div className={`FlexWithCenteredContent ${rightSectionClassname}`}>
        <h4 className="SynthProcessingMessage">{ProcessingStageInfo[synthesizingStage]}</h4>
      </div>
    </>
  )
}

/// Kept out of the component to prevent unexpected state from component updates
let sampleIsPlaying = [false]

/**
 * @param {{
 * leftSectionClassname: String?,
 * rightSectionClassname: String?,
 * audioContext: AudioContext,
 * sampleOptions: [GridSampleObject],
 * saveSamples: (samples: [GridSampleObject]) => void,
 * restartGenerator: () => void
 * }} props
 */
const SynthCompletedStagePanel = props => {
  const SampleCardKey = 'SynthSampleCard'
  const { leftSectionClassname, rightSectionClassname, sampleOptions } = props
  const [titles, setTitles] = useState(
    sampleOptions.map((_, index) => {
      return 'Sample ' + (index + 1)
    })
  )
  const [isSelected, setIsSelected] = useState(
    sampleOptions.map(_ => {
      return false
    })
  )
  const [isPrivate, setIsPrivate] = useState(isSelected)

  useEffect(_ => {
    SynthSamplesMounted = true
    sampleIsPlaying = isSelected
    return function cleanup() {
      SynthSamplesMounted = false
      stopSynthPreview(currentAudioBufferIndex)
    }
  }, [])

  const respondToAudioDidEnd = _ => {
    stopSynthPreview(currentAudioBufferIndex)
  }

  const stopSynthPreview = index => {
    if (index < 0 || index >= sampleOptions.length) {
      return
    }
    currentAudioSource.removeEventListener('ended', respondToAudioDidEnd)
    currentAudioSource.stop()
    currentAudioSource.disconnect(props.audioContext)
    currentAudioBufferIndex = -1
    sampleIsPlaying[index] = false
  }

  const startSynthPreview = index => {
    if (index < 0 || index >= sampleOptions.length) {
      return
    }

    const sampleAudioBuffer = sampleOptions[index].sampleAudioBuffer
    if (sampleAudioBuffer == null || sampleAudioBuffer == undefined) {
      return
    }
    currentAudioSource = props.audioContext.createBufferSource()
    currentAudioSource.buffer = sampleAudioBuffer
    currentAudioSource.connect(props.audioContext.destination)
    currentAudioSource.addEventListener('ended', respondToAudioDidEnd)
    currentAudioSource.start()
    currentAudioBufferIndex = index
    sampleIsPlaying[index] = true
  }

  const sampleCards = _ => {
    return titles.map((title, index) => {
      return (
        <div key={SampleCardKey + index} className="SynthSampleCardContainer">
          <div className={`SynthSampleCard ${isSelected[index] ? 'SynthSampleCardSelected' : ''}`}>
            <input
              className="SynthSampleCardTitle"
              value={title}
              type="text"
              onChange={event => {
                let newTitles = titles
                newTitles[index] = event.target.value
                setTitles([...newTitles])
              }}
            ></input>
            <img
              className="SynthSampleCardButton"
              src={PlayButton}
              onClick={_ => {
                if (sampleIsPlaying[index]) {
                  // stop this preview
                  stopSynthPreview(index)
                } else {
                  // stop current preview
                  stopSynthPreview(currentAudioBufferIndex)
                  // load and play this preview
                  startSynthPreview(index)
                }
              }}
            ></img>
          </div>
          <div className="CheckmarkContainer">
            <label className="container">
              <input
                type="checkbox"
                defaultChecked={isSelected[index]}
                onChange={event => {
                  let newSelected = [...isSelected]
                  newSelected[index] = event.target.checked
                  setIsSelected(newSelected)
                }}
              ></input>
              <span className="checkmark"></span>
            </label>
          </div>
          <div className="CheckmarkContainer">
            <label className="container">
              <input
                type="checkbox"
                defaultChecked={isPrivate[index]}
                onChange={event => {
                  let newPrivate = [...isSelected]
                  newPrivate[index] = event.target.checked
                  setIsPrivate(newPrivate)
                }}
              ></input>
              <span className="checkmark"></span>
            </label>
          </div>
        </div>
      )
    })
  }

  const actionInput = (title, color, onClick) => {
    return (
      <input
        className="SynthSamplesActionInput"
        value={title}
        type="button"
        style={{
          backgroundColor: color,
        }}
        onClick={onClick}
      ></input>
    )
  }

  return (
    <>
      <SynthVisualizer className={leftSectionClassname} isAnimating={false}></SynthVisualizer>
      <div className={`FlexWithCenteredContent ${rightSectionClassname}`}>
        <div className="SynthResultsContainer">
          <h4 className="SynthProcessingMessage SynthResultsContainerTitle">
            {ProcessingStageInfo[SynthesizingStage.Completed]}
          </h4>
          <div className="SynthSubtitleContainer">
            <h5 className="SynthSubtitle">Generated Sample</h5>
            <h5 className="SynthSubtitle SynthSubtitleShort">Selected</h5>
            <h5 className="SynthSubtitle SynthSubtitleShort">Private</h5>
          </div>
          {sampleCards()}
          {actionInput('Restart Generator', '#5A3232', _ => {
            props.restartGenerator()
          })}
          {actionInput('Save Selected Samples', '#415F36', _ => {
            let selectedSamples = isSelected.map((sampleSelected, index) => {
              if (sampleSelected) {
                let selectedSample = sampleOptions[index]
                selectedSample.sampleTitle = titles[index]
                return selectedSample
              }
            })
            props.saveSamples(selectedSamples)
          })}
        </div>
      </div>
    </>
  )
}

export {
  SynthModelObject,
  SynthesizingStage,
  ProcessingStageInfo,
  MODEL_CELL_LENGTH_IN_PIXELS,
  SynthSelectionStagePanel,
  SynthProcessingStagePanel,
  SynthCompletedStagePanel,
}
