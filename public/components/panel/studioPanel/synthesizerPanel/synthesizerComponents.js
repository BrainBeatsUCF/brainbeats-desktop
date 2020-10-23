import React, { useEffect, useState } from 'react'
import { GridSampleObject } from '../../workstationPanel/gridObjects'
import PlayButton from '../../../../images/whitePlayButton.png'
import PauseButton from '../../../../images/pauseButton.png'
import './synthesizerComponents.css'

const MODEL_CARD_KEY_PREFIX = 'synthModelCard'
const MODEL_CELL_LENGTH_IN_PIXELS = 100

const SynthPreviewAudioContext = new AudioContext()
let SynthSamplesMounted = false
let currentAudioSource = SynthPreviewAudioContext.createBufferSource()
let currentAudioBufferIndex = -1

const SynthModelObject = {
  modelImageName: '',
  modelName: '',
  modelRequestURL: '',
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
    return (
      <div
        className="SynthModelCard Tooltip"
        key={MODEL_CARD_KEY_PREFIX + index}
        style={{
          height: MODEL_CELL_LENGTH_IN_PIXELS,
          width: MODEL_CELL_LENGTH_IN_PIXELS,
        }}
        onClick={() => props.onModelClick(modelObject)}
      >
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

/**
 * @param {{
 * leftSectionClassname: String?,
 * rightSectionClassname: String?,
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
  const [isPlaying, setIsPlaying] = useState(
    sampleOptions.map(_ => {
      return false
    })
  )
  const [isSelected, setIsSelected] = useState(isPlaying)

  useEffect(_ => {
    SynthSamplesMounted = true
    return function cleanup() {
      SynthSamplesMounted = false
      stopSynthPreview(currentAudioBufferIndex)
    }
  }, [])

  const stopSynthPreview = index => {
    if (index < 0 || index >= sampleOptions.length) {
      return
    }

    currentAudioSource.removeEventListener('ended', null)
    currentAudioSource.stop()
    currentAudioSource.disconnect(SynthPreviewAudioContext)
    currentAudioBufferIndex = -1

    let newIsPlaying = [...isPlaying]
    newIsPlaying[index] = false
    if (SynthSamplesMounted) {
      setIsPlaying(newIsPlaying)
    }
  }

  const startSynthPreview = index => {
    if (index < 0 || index >= sampleOptions.length) {
      return
    }

    const buffer = sampleOptions[index].sampleAudioBuffer
    if (buffer == null || buffer == undefined) {
      return
    }

    currentAudioSource.buffer = buffer
    currentAudioSource.connect(SynthPreviewAudioContext)
    currentAudioSource.addEventListener('ended', _ => stopSynthPreview(index))
    currentAudioSource.start()

    let newIsPlaying = [...isPlaying]
    newIsPlaying[index] = true
    if (SynthSamplesMounted) {
      setIsPlaying(newIsPlaying)
    }
  }

  const sampleCards = _ => {
    return titles.map((title, index) => {
      return (
        <div
          key={SampleCardKey + index}
          className={`SynthSampleCard ${isSelected[index] ? 'SynthSampleCardSelected' : ''}`}
          onClick={_ => {
            let newIsSelected = [...isSelected]
            newIsSelected[index] = !newIsSelected[index]
            if (SynthSamplesMounted) {
              setIsSelected(newIsSelected)
            }
          }}
        >
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
            src={isPlaying[index] ? PauseButton : PlayButton}
            onClick={_ => {
              if (isPlaying[index]) {
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
