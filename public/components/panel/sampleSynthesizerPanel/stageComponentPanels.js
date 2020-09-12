import React from 'react'
import './sampleSynthesizerPanel.css'

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
 * modelCardsContainerWidth: Number,
 * availableSynthModels: [SynthModelObject],
 * handleSynthModelClick: (modelObject: SynthModelObject) => void
 * }} props
 */
const SynthSelectionStagePanel = props => {
  const { modelCardsContainerWidth, availableSynthModels } = props
  return (
    <div className="SynthesizerFullBodySection">
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
 * synthesizingStage: SynthesizingStage,
 * advanceStage: (newStage: SynthesizingStage) => void,
 * abortProcessing: () => void
 * }} props
 */
const SynthProcessingStagePanel = props => {
  const renderProcessingStageSection = () => {
    const { synthesizingStage } = props
    switch (synthesizingStage) {
      case SynthesizingStage.Connecting:
      case SynthesizingStage.Recording:
      case SynthesizingStage.Modeling:
        return <h4 className="SynthesizerHeaderTitle">{ProcessingStageInfo[synthesizingStage]}</h4>
      case SynthesizingStage.Completed:
        return <div></div>
      default:
        return <></>
    }
  }
  return (
    <>
      <div className="SynthesizerLeftBodySection FlexWithCenteredContent"></div>
      <div className="SynthesizerRightBodySection FlexWithCenteredContent">{renderProcessingStageSection()}</div>
    </>
  )
}

/**
 * @param {{
 * modelCardsContainerWidth: Number,
 * availableSynthModels: [SynthModelObject],
 * synthesizingStage: SynthesizingStage,
 * handleSynthModelClick: (modelObject: SynthModelObject) => void,
 * advanceStage: (newStage: SynthesizingStage) => void,
 * abortProcessing: () => void
 * }} props
 */
const SynthStagePanel = props => {
  const { synthesizingStage } = props
  switch (synthesizingStage) {
    case SynthesizingStage.Selecting:
      return (
        <SynthSelectionStagePanel
          modelCardsContainerWidth={props.modelCardsContainerWidth}
          availableSynthModels={props.availableSynthModels}
          handleSynthModelClick={props.handleSynthModelClick}
        ></SynthSelectionStagePanel>
      )
    case SynthesizingStage.Connecting:
    case SynthesizingStage.Recording:
    case SynthesizingStage.Modeling:
    case SynthesizingStage.Completed:
      return (
        <SynthProcessingStagePanel
          synthesizingStage={synthesizingStage}
          advanceStage={props.advanceStage}
          abortProcessing={props.abortProcessing}
        ></SynthProcessingStagePanel>
      )
    default:
      return <></>
  }
}

export { SynthModelObject, SynthesizingStage, ProcessingStageInfo, MODEL_CELL_LENGTH_IN_PIXELS, SynthStagePanel }
