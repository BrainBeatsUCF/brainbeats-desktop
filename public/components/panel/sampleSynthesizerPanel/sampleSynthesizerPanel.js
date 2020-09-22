import React from 'react'
import SynthesizerModels from './synthesizerModels.json'
import { startHardwareSocket, closeHardwareSocket } from './hardwareSocketHandler'
import { GridSampleObject } from '../workstationPanel/gridComponents'
import {
  SynthModelObject,
  SynthesizingStage,
  SynthStagePanel,
  MODEL_CELL_LENGTH_IN_PIXELS,
} from './stageComponentPanels'
import './sampleSynthesizerPanel.css'

const StageTitle = {
  Selecting: 'Select Sample Synthesizer',
  Default: 'Sample Creator Processing',
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
      modelsContainerLength: this.getModelMosaicContainerLength(SynthesizerModels.length),
      hasEstablishedHardwareConnection: false,
    }
  }

  // MARK : Life Cycle

  componentDidUpdate() {
    // processing stage effect
    const { synthesizingStage, hasEstablishedHardwareConnection } = this.state
    if (synthesizingStage == SynthesizingStage.Connecting && !hasEstablishedHardwareConnection) {
      this.handleConnectingToHardware()
    }
  }

  // MARK : Event Handlers

  /**
   * @param {SynthesizingStage} newStage
   */
  handleAdvanceStage = newStage => this.setState({ synthesizingStage: newStage })

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

  handleConnectingToHardware = () => {
    this.setState({ hasEstablishedHardwareConnection: true })
    startHardwareSocket(this.handleHardwareData, this.handleHardwareError, this.handleHardwareDidConnect)
  }

  handleHardwareData = message => {
    const { synthesizingStage } = this.state
    // TODO: make request to model server with data
    console.log('HM', message)
    if (synthesizingStage === SynthesizingStage.Recording) {
      this.setState({
        hasEstablishedHardwareConnection: false,
        synthesizingStage: SynthesizingStage.Modeling,
      })
    }
  }

  handleHardwareError = errorMessage => {
    console.log('Error from hardware: ', errorMessage)
    this.handleAbortProcessing()
  }

  handleHardwareDidConnect = () => {
    const { synthesizingStage } = this.state
    if (synthesizingStage === SynthesizingStage.Connecting) {
      this.setState({ synthesizingStage: SynthesizingStage.Recording })
    }
  }

  handleAbortProcessing = () => {
    closeHardwareSocket()
    this.setState({
      hasEstablishedHardwareConnection: false,
      synthesizingStage: SynthesizingStage.Selecting,
    })
  }

  // MARK : Helpers

  hasStartedFlow = () => {
    const { synthesizingStage } = this.state
    return synthesizingStage !== SynthesizingStage.Selecting
  }

  hasConnectedToHardware = () => {
    const { synthesizingStage } = this.state
    return synthesizingStage !== SynthesizingStage.Selecting && synthesizingStage !== SynthesizingStage.Connecting
  }

  /**
   * @param {Number} modelCount
   */
  getModelMosaicContainerLength = modelCount => {
    const lengthWithMargin = MODEL_CELL_LENGTH_IN_PIXELS + 40
    let length = lengthWithMargin
    const minimumMiddleCount = Math.ceil(Math.sqrt(modelCount))
    while (length / lengthWithMargin < minimumMiddleCount) {
      length += lengthWithMargin
    }
    return length
  }

  // MARK : Render

  render() {
    const customClass = this.props.customClassname ?? ''
    const { modelsContainerLength, synthesizingStage } = this.state
    const appHeaderDisplayControl = this.hasStartedFlow() ? '' : 'HideSection'
    const headerSectionTitle =
      synthesizingStage === SynthesizingStage.Selecting ? StageTitle.Selecting : StageTitle.Default
    return (
      <>
        <div className={`appHeaderOverlaySection ${appHeaderDisplayControl}`}></div>
        <div className={`SampleSynthesizer ${customClass}`}>
          <div className="SynthesizerHeaderSection">
            <h4 className="SynthesizerHeaderTitle">{headerSectionTitle}</h4>
          </div>
          <SynthStagePanel
            modelCardsContainerWidth={modelsContainerLength}
            availableSynthModels={SynthesizerModels}
            synthesizingStage={synthesizingStage}
            handleSynthModelClick={this.handleSynthModelClick}
            advanceStage={this.handleAdvanceStage}
            abortProcessing={this.handleAbortProcessing}
          ></SynthStagePanel>
        </div>
      </>
    )
  }
}

export { SampleSynthesizer, SynthesizingStage }
