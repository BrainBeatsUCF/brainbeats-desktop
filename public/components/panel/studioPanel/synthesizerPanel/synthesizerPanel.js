import React from 'react'
import { startHardwareSocket, closeHardwareSocket } from './hardwareSocketHandler'
import { MenuButton, MenuButtonColor } from '../../../input/input'
import { MODEL_CELL_LENGTH_IN_PIXELS, SynthesizingStage } from './synthesizerComponents'
import { SynthSelectionStagePanel, SynthProcessingStagePanel } from './synthesizerComponents'
import SynthesizerModels from './synthesizerModels.json'
import './synthesizerPanel.css'

const timeToCloseSocketOnMessage = 500 // 0.5 seconds

const StageTitle = {
  Selecting: 'Select Sample Synthesizer',
  Default: 'Sample Creator Processing',
}

const PredictedEmotions = {
  Happy: 'happy',
  Melancholy: 'melancholy',
  Surprised: 'surprised',
  Calm: 'calm',
}

const HideSynthesizerInfo = {
  customClassname: '',
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

class Synthesizer extends React.Component {
  /**
   *
   * @param {{
   * customClassname: String?,
   * shouldCloseSynthesizer: () => void
   * }} props
   */
  constructor(props) {
    super(props)
    this.state = {
      hasConnectedToEEG: false,
      hasBegunFetchingSamples: false,
      predictedEmotion: PredictedEmotions.Melancholy,
      synthesizingModel: SynthesizerModels[0],
      synthesizingStage: SynthesizingStage.Selecting,
      modelContainerLength: lengthForModelCount(SynthesizerModels.length),
    }
  }

  // MARK: Life Cycle

  componentDidUpdate() {
    const { synthesizingStage, hasConnectedToEEG, hasBegunFetchingSamples } = this.state
    if (synthesizingStage == SynthesizingStage.Connecting && !hasConnectedToEEG) {
      this.handleConnectingToHardware()
    } else if (synthesizingStage == SynthesizingStage.Modeling && !hasBegunFetchingSamples) {
      // call fetch handler
      console.log(`call ${this.state.synthesizingModel} API with ${this.state.predictedEmotion}`)
    }
  }

  // MARK: EEG Event Handlers

  handleConnectingToHardware = _ => {
    this.setState({ hasConnectedToEEG: true })
    startHardwareSocket(
      message => {
        setTimeout(_ => {
          closeHardwareSocket()
          this.setState({
            predictedEmotion: message[window.process.env['BRAINBEATS_DATA_EMOTION']],
            synthesizingStage: SynthesizingStage.Modeling,
          })
        }, timeToCloseSocketOnMessage)
      },
      errorMessage => {
        console.error('EEG Error', errorMessage)
        this.handleAbortEEG()
      },
      // callback recieved when EEG successfully connects
      _ => {
        this.setState({
          synthesizingStage: SynthesizingStage.Recording,
        })
      }
    )
  }

  handleAbortEEG = _ => {
    closeHardwareSocket()
    this.setState({
      hasConnectedToEEG: false,
      synthesizingStage: SynthesizingStage.Selecting,
    })
  }

  // MARK: Stage Event Handlers

  /**
   * Cleans up any running processes like network requests or EEG connections before closing
   * synthesizer
   */
  handleShouldAbortSynthesizing = _ => {
    // cleanup background processes
    this.handleAbortEEG()
    this.props.shouldCloseSynthesizer()
  }

  // MARK: Render

  /**
   * @param {Number} modelContainerLength
   * @param {SynthesizingStage} synthesizingStage
   */
  handleStageRender = (modelContainerLength, synthesizingStage) => {
    if (synthesizingStage === SynthesizingStage.Selecting) {
      return (
        <SynthSelectionStagePanel
          customClassname="SynthesizerFullBodySection"
          modelCardsContainerWidth={modelContainerLength}
          availableSynthModels={SynthesizerModels}
          handleSynthModelClick={modelInfo => {
            this.setState({
              synthesizingModel: modelInfo,
              synthesizingStage: SynthesizingStage.Connecting,
            })
          }}
        ></SynthSelectionStagePanel>
      )
      // Connecting | Recording | Modeling
    } else {
      return (
        <SynthProcessingStagePanel
          leftSectionClassname="SynthesizerLeftBodySection"
          rightSectionClassname="SynthesizerRightBodySection"
          synthesizingStage={synthesizingStage}
        ></SynthProcessingStagePanel>
      )
    }
  }

  render() {
    const { modelContainerLength, synthesizingStage } = this.state
    const customClassname = this.props.customClassname ?? ''
    const synthesizerHeaderOverlay = synthesizingStage === SynthesizingStage.Selecting ? '' : 'SynthesizerHeaderOverlay'
    const stageTitle = synthesizingStage === SynthesizingStage.Selecting ? StageTitle.Selecting : StageTitle.Default
    return (
      <>
        <div className={synthesizerHeaderOverlay}></div>
        <div className={`Synthesizer ${customClassname}`}>
          <div className="SynthesizerHeaderSection">
            <h4 className="SynthesizerHeaderTitle">{stageTitle}</h4>
            <MenuButton
              props={{
                customClass: '',
                title: 'Close',
                color: MenuButtonColor.Red,
                onMenuButtonClick: _ => this.handleShouldAbortSynthesizing(),
              }}
            ></MenuButton>
          </div>
          {this.handleStageRender(modelContainerLength, synthesizingStage)}
        </div>
      </>
    )
  }
}

/**
 * @param {HideSynthesizerInfo} props
 */
const SynthesizerWrapper = props => {
  const { customClassname, shouldShowSynthesizer, onSynthesizerClose } = props
  if (!shouldShowSynthesizer) {
    return <></>
  } else {
    return <Synthesizer customClassname={customClassname} shouldCloseSynthesizer={onSynthesizerClose}></Synthesizer>
  }
}

export { HideSynthesizerInfo, SynthesizerWrapper }
