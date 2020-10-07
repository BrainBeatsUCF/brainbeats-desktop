import React from 'react'
import { ListObjectType, VerticalListPanel } from '../verticalListPanel/verticalListPanel'
import { WorkstationPanel } from '../workstationPanel/workstationPanel'
import { SampleDownloader } from './sampleDownloader'
import { SaveBeatPromptWrapper, ClosePromptInfo } from './saveBeatPrompt'
import { RequestUserBeatItems, RequestUserSampleItems } from '../../requestService/requestService'
import { SampleSynthesizer, SynthesizingStage } from '../sampleSynthesizerPanel/sampleSynthesizerPanel'
import {
  GridBeatObject,
  GridSampleObject,
  updateBeatSamples,
  appendSamplesToBeat,
  getEmptyBeat,
} from '../workstationPanel/gridObjects'
import './studioPanel.css'

let StudioPanelComponentMounted = false
const StudioAudioContext = new AudioContext()
const WorkstationTitle = 'WorkStation'
const VerticalListTitles = {
  Beats: 'Beats',
  Samples: 'Samples',
}

class StudioPanel extends React.Component {
  /**
   * @param {{
   * customClass: String?
   * userInfo: VerifiedUserInfo,
   * setIsMakingNetworkActivity: (Boolean) => void
   * }} props
   */
  constructor(props) {
    super(props)
    this.state = {
      customClass: props.customClass ?? '',
      downloadSamples: null,
      isSynthesizingSample: false,
      currentSavePromptInfo: ClosePromptInfo,
      loadedBeats: [],
      loadedSamples: [GridSampleObject],
      currentGridItem: GridBeatObject,
    }

    // Hacky way of adding autocomplete to state through VSCode intellisense
    this.state.loadedSamples = []
    this.state.currentGridItem.samples = []
  }

  // MARK : Life Cycle

  componentDidMount() {
    StudioPanelComponentMounted = true
  }

  componentWillUnmount() {
    StudioPanelComponentMounted = false
  }

  // MARK : Event Handlers

  /**
   * @param {GridSampleObject} sampleObject
   */
  handleSaveSampleToDatabase = sampleObject => {
    // TODO: save sample to database
    // start refreshing samples
    // turn off synthesizer
  }

  /**
   * Responds to the event of clicking the save button in workstation
   * @param {GridBeatObject} beatObject
   */
  handleSaveBeatToDatabase = beatObject => {
    this.setState({
      currentSavePromptInfo: {
        title: 'Save Beat',
        shouldShowPrompt: true,
        onSaveComplete: savedGridObject => {
          this.beatsItemListRequest()
          this.setState({
            currentGridItem: savedGridObject,
            currentSavePromptInfo: ClosePromptInfo,
          })
        },
      },
    })
  }

  /**
   * Responds to the event of clicking the add button in the beats list.
   * if there's a beat already loaded, a save sequence is triggered and the existing work will be
   * cleared if and only if the user saves their previous work..
   */
  handleBeatsAddClick = () => {
    const { currentGridItem } = this.state
    if (currentGridItem.isWorthSaving) {
      this.setState({
        currentSavePromptInfo: {
          title: 'Save Previous Work To Continue',
          shouldShowPrompt: true,
          onSaveComplete: _ => {
            this.beatsItemListRequest()
            this.setState({
              currentGridItem: getEmptyBeat(),
              currentSavePromptInfo: ClosePromptInfo,
            })
          },
        },
      })
    } else {
      this.setState({ currentGridItem: getEmptyBeat() })
    }
  }

  /**
   * Opens up synthesizer component to start EEG -> Sample flow
   */
  handleSampleAddClick = () => {
    const { isSynthesizingSample } = this.state
    this.setIsSynthesizingSample(!isSynthesizingSample)
  }

  /**
   * Load the samples of the selected beat and position in grid
   * if there's a beat already loaded, a save sequence is triggered and the next selected
   * beat will be loaded if and only if the user saves their previous work.
   * @param {GridBeatObject} selectedBeatObject
   */
  handleBeatsItemClick = selectedBeatObject => {
    const { currentGridItem } = this.state
    if (currentGridItem.beatID === selectedBeatObject.beatID) {
      return
    }
    if (currentGridItem.isWorthSaving) {
      this.setState({
        currentSavePromptInfo: {
          title: 'Save Previous Work To Continue',
          shouldShowPrompt: true,
          onSaveComplete: _ => {
            this.beatsItemListRequest()
            this.startLoadingBeatItem(selectedBeatObject)
            this.setState({ currentSavePromptInfo: ClosePromptInfo })
          },
        },
      })
    } else {
      this.startLoadingBeatItem(selectedBeatObject)
    }
  }

  /**
   * Sets the current grid to the selected beat and initiates the download process for the
   * samples it may contain.
   * @param {GridBeatObject} beatsObject
   */
  startLoadingBeatItem = beatsObject => {
    // [Bug] Issue-18:
    // Emptying out the samples here and relying on them being replaced after download completion
    // can lead to a bug where local information for a sample will be lost if the download fails.
    // A better approach would be replace the buffer of the downloaded samples in real-time.
    const samplesToDownload = beatsObject.samples
    beatsObject.samples = []
    beatsObject.isWorthSaving = true
    this.setState({
      currentGridItem: beatsObject,
      downloadSamples: samplesToDownload,
    })
  }

  /**
   * Load the selected sample onto the grid
   * @param {GridSampleObject} sampleObject
   */
  handleSampleItemClick = sampleObject => {
    // Sample are copied to overcome default pass-by-reference behavior in javascript
    let copySampleObject = {}
    Object.assign(copySampleObject, sampleObject)
    this.state.currentGridItem.isWorthSaving = true
    this.setState({ downloadSamples: [copySampleObject] })
  }

  // MARK : Network Request Handlers

  /**
   * Handles saving of samples being downloaded when they become available
   * @param {[GridSampleObject]} newSamples
   */
  handleSampleItemDownloaded = newSamples => {
    const { currentGridItem } = this.state
    currentGridItem.isWorthSaving = true
    this.setState({
      downloadSamples: null,
      currentGridItem: appendSamplesToBeat(newSamples, currentGridItem),
    })
  }

  /**
   * Fetches the most up to date list of a users beat library
   * @param {(data: [GridBeatObject]) => void} onCompletion
   */
  beatsItemListRequest = () => {
    this.props.setIsMakingNetworkActivity(true)
    RequestUserBeatItems(this.props.userInfo, data => {
      if (StudioPanelComponentMounted) {
        this.props.setIsMakingNetworkActivity(false)
        this.setState({ loadedBeats: data })
      }
    })
  }

  /**
   * Fetches the most up to date list of users sample library
   */
  sampleItemListRequest = () => {
    this.props.setIsMakingNetworkActivity(true)
    RequestUserSampleItems(this.props.userInfo, data => {
      if (StudioPanelComponentMounted) {
        this.props.setIsMakingNetworkActivity(false)
        this.setState({ loadedSamples: data })
      }
    })
  }

  // MARK : Helpers

  /**
   * @param {Boolean} isSynthesizingSample
   */
  setIsSynthesizingSample = isSynthesizingSample => {
    this.setState({ isSynthesizingSample: isSynthesizingSample })
  }

  renderSampleDownloader = () => {
    const { downloadSamples } = this.state
    if (downloadSamples == null) {
      return <></>
    } else {
      return (
        <SampleDownloader
          samples={downloadSamples}
          audioContext={StudioAudioContext}
          onComplete={this.handleSampleItemDownloaded}
          onError={() => this.setState({ downloadSamples: null })}
        ></SampleDownloader>
      )
    }
  }

  renderSynthesizer = () => {
    const { isSynthesizingSample } = this.state
    if (!isSynthesizingSample) {
      return <></>
    } else {
      return (
        <SampleSynthesizer
          customClassname={`${isSynthesizingSample ? '' : 'HideFullCover'}`}
          startSynthesizingStage={SynthesizingStage.Selecting}
          didSelectFinalSample={this.handleSaveSampleToDatabase}
        ></SampleSynthesizer>
      )
    }
  }

  render() {
    const { isSynthesizingSample } = this.state
    return (
      <div className={`StudioPanel ${this.state.customClass}`}>
        <VerticalListPanel
          customClassname="LeftColumn"
          title={VerticalListTitles.Beats}
          itemList={this.state.loadedBeats}
          onAddClick={this.handleBeatsAddClick}
          onItemClick={this.handleBeatsItemClick}
          itemListRequest={this.beatsItemListRequest}
        ></VerticalListPanel>
        <VerticalListPanel
          customClassname="MiddleColumn"
          title={VerticalListTitles.Samples}
          itemList={this.state.loadedSamples}
          onAddClick={this.handleSampleAddClick}
          onItemClick={this.handleSampleItemClick}
          itemListRequest={this.sampleItemListRequest}
        ></VerticalListPanel>
        <WorkstationPanel
          customClassname="RightColumn"
          title={WorkstationTitle}
          currentGridBeat={this.state.currentGridItem}
          setLoadedSampleList={newGridSamples => {
            const { currentGridItem } = this.state
            this.setState({ currentGridItem: updateBeatSamples(newGridSamples, currentGridItem) })
          }}
          onSaveCurrentGridBeat={this.handleSaveBeatToDatabase}
          setIsMakingNetworkActivity={this.props.setIsMakingNetworkActivity}
        ></WorkstationPanel>
        {this.renderSynthesizer()}
        {this.renderSampleDownloader()}
        <SaveBeatPromptWrapper
          promptInfo={this.state.currentSavePromptInfo}
          currentGridItem={this.state.currentGridItem}
          setIsMakingNetworkActivity={this.props.setIsMakingNetworkActivity}
          onSaveError={() => this.setState({ currentSavePromptInfo: ClosePromptInfo })}
        ></SaveBeatPromptWrapper>
      </div>
    )
  }
}

export { StudioPanel }
