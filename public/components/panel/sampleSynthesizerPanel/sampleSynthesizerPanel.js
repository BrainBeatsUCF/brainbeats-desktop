import React from 'react'
import SynthesizerModels from './synthesizerModels.json'
import { GridSampleObject } from '../workstationPanel/gridComponents'
import './sampleSynthesizerPanel.css'

const SynthesizingStage = {
  Selecting: 'selecting',
  Connecting: 'connecting',
  Recording: 'recording',
  Modeling: 'modeling',
  Completed: 'completed',
}

const StageTitle = {
  Selecting: 'Select Sample Synthesizer',
  Default: 'Sample Creator Processing',
}

const SynthModelObject = {
  modelImageName: '',
  modelName: '',
  modelRequestURL: '',
}

const MODEL_CELL_LENGTH_IN_PIXELS = 100
const MODEL_CARD_KEY_PREFIX = 'synthModelCard'

/**
 *
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

class SampleSynthesizer extends React.Component {
  /**
   * @param {{
   * customClassname: String?,
   * didSelectFinalSample: (sampleObject: GridSampleObject) => void,
   * startSynthesizingStage: SynthesizingStage
   * }} props
   */
  constructor(props) {
    super(props)
    this.state = {
      synthesizingStage: props.startSynthesizingStage,
      selectedSynthModel: SynthesizerModels.length > 0 ? SynthesizerModels[0] : null,
      modelsDisplayedInModalsContainer: 0,
      modalsContainerLength: 0,
      availableSynthModels: SynthesizerModels,
    }
  }

  // MARK : Life Cycle

  componentDidUpdate() {
    const { availableSynthModels, modelsDisplayedInModalsContainer } = this.state
    if (availableSynthModels.length != modelsDisplayedInModalsContainer) {
      this.setModelMosaicContainerLength(availableSynthModels.length)
    }
  }

  // MARK : Event Handlers

  /**
   * Sets the selected synth and triggers flow start
   * @param {SynthModelObject} modelObject
   */
  handleSynthModelClick = modelObject => {
    this.setState({
      selectedSynthModel: modelObject,
      synthesizingStage: SynthesizingStage.Connecting,
    })
  }

  // MARK : Helpers

  hasStartedFlow = () => {
    const { synthesizingStage } = this.state
    return synthesizingStage !== SynthesizingStage.Selecting
  }

  getStageTitle = () => {
    const { synthesizingStage } = this.state
    switch (synthesizingStage) {
      case SynthesizingStage.Selecting:
        return StageTitle.Selecting
      default:
        return StageTitle.Default
    }
  }

  /**
   * @param {Number} modelCount
   */
  setModelMosaicContainerLength = modelCount => {
    const lengthWithMargin = MODEL_CELL_LENGTH_IN_PIXELS + 40
    let length = lengthWithMargin
    const minimumMiddleCount = Math.ceil(Math.sqrt(modelCount))
    while (length / lengthWithMargin < minimumMiddleCount) {
      length += lengthWithMargin
    }
    this.setState({
      modelsDisplayedInModalsContainer: modelCount,
      modalsContainerLength: length,
    })
  }

  // MARK : Render

  renderStage = () => {
    const { synthesizingStage } = this.state
    switch (synthesizingStage) {
      case SynthesizingStage.Selecting:
        return this.renderSelectionStage()
      case SynthesizingStage.Connecting:
        return this.renderConnectingStage()
      default:
        return <></>
    }
  }

  renderSelectionStage = () => {
    const { modalsContainerLength, availableSynthModels } = this.state
    return (
      <div className="SynthesizerFullBodySection">
        <div
          className="SynthModelsContainer"
          style={{
            width: modalsContainerLength,
          }}
        >
          <SynthModelCards
            modelObjects={availableSynthModels}
            onModelClick={this.handleSynthModelClick}
          ></SynthModelCards>
        </div>
      </div>
    )
  }

  renderConnectingStage = () => {
    return <div></div>
  }

  render() {
    const customClass = this.props.customClassname ?? ''
    const appHeaderDisplayControl = this.hasStartedFlow() ? '' : 'HideSection'
    return (
      <>
        <div className={`appHeaderOverlaySection ${appHeaderDisplayControl}`}></div>
        <div className={`SampleSynthesizer ${customClass}`}>
          <div className="SynthesizerHeaderSection">
            <h4 className="SynthesizerHeaderTitle">{this.getStageTitle()}</h4>
          </div>
          {this.renderStage()}
        </div>
      </>
    )
  }
}

export { SampleSynthesizer, SynthesizingStage }
