import React from 'react'
import './synthesizerComponents.css'

const MODEL_CARD_KEY_PREFIX = 'synthModelCard'
const MODEL_CELL_LENGTH_IN_PIXELS = 100

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
  Completed: 'Samples Generated',
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

export {
  SynthModelObject,
  SynthesizingStage,
  ProcessingStageInfo,
  MODEL_CELL_LENGTH_IN_PIXELS,
  SynthSelectionStagePanel,
  SynthProcessingStagePanel,
}
