import React from 'react'
import { ListObjectType, VerticalListPanel } from '../verticalListPanel/verticalListPanel'
import { WorkstationPanel } from '../workstationPanel/workstationPanel'
import { SampleDownloader } from './sampleDownloader'
import { SaveBeatPromptWrapper, ClosePromptInfo } from './saveBeatPrompt'
import { ItemContextPromptWrapper, CloseContextPromptInfo } from './itemContextPrompt'
import { RequestUserBeatItems, RequestUserSampleItems } from '../../requestService/requestService'
import { SynthesizerWrapper, HideSynthesizerInfo } from './synthesizerPanel/synthesizerPanel'
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
   * currentGridItem: GridBeatObject,
   * userInfo: VerifiedUserInfo,
   * setIsMakingNetworkActivity: (Boolean) => void
   * setCurrentGridItem: (GridBeatObject) => void
   * }} props
   */
  constructor(props) {
    super(props)
    this.state = {
      customClass: props.customClass ?? '',
      downloadSamples: null,
      currentSavePromptInfo: ClosePromptInfo,
      currentItemContextPromptInfo: CloseContextPromptInfo,
      currentSynthesizerInfo: HideSynthesizerInfo,
      loadedBeats: [],
      loadedSamples: [GridSampleObject],
    }

    // Hacky way of adding autocomplete to state through VSCode intellisense
    this.state.loadedSamples = []
  }

  // MARK : Life Cycle

  componentDidMount() {
    StudioPanelComponentMounted = true
  }

  componentWillUnmount() {
    StudioPanelComponentMounted = false
  }

  closeContextPromptInfo() {
    this.setState({ currentItemContextPromptInfo: CloseContextPromptInfo })
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
          this.setState({ currentSavePromptInfo: ClosePromptInfo })
          this.props.setCurrentGridItem(savedGridObject)
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
    const { currentGridItem } = this.props
    if (currentGridItem.isWorthSaving) {
      this.setState({
        currentSavePromptInfo: {
          title: 'Save Previous Work To Continue',
          shouldShowPrompt: true,
          onSaveComplete: _ => {
            this.beatsItemListRequest()
            this.setState({ currentSavePromptInfo: ClosePromptInfo })
            this.props.setCurrentGridItem(getEmptyBeat())
          },
        },
      })
    } else {
      this.props.setCurrentGridItem(getEmptyBeat())
    }
  }

  /**
   * Opens up synthesizer component to start EEG -> Sample flow
   */
  handleSampleAddClick = () => {
    this.setState({
      currentSynthesizerInfo: {
        shouldShowSynthesizer: true,
        onSynthesizerClose: _ => {
          this.setState({ currentSynthesizerInfo: HideSynthesizerInfo })
        },
      },
    })
  }

  /**
   * Responds to beat being clicked in vertical list
   * @param {GridBeatObject} selectedBeatObject
   */
  handleBeatsItemClick = selectedBeatObject => {
    this.setState({
      currentItemContextPromptInfo: {
        title: selectedBeatObject.sampleTitle,
        shouldShowPrompt: true,
        value: selectedBeatObject,
        type: ListObjectType.Beat,
        onLoadItemToGrid: _ => {
          this.shouldLoadBeatObject(selectedBeatObject)
          this.closeContextPromptInfo()
        },
        onItemDeleted: _ => {
          this.beatsItemListRequest()
          this.closeContextPromptInfo()
          // clear out current grid if it was the item deleted
          if (selectedBeatObject.beatID === this.props.currentGridItem.beatID) {
            this.props.setCurrentGridItem(getEmptyBeat())
          }
        },
        onCancel: _ => this.closeContextPromptInfo(),
      },
    })
  }

  /**
   * Load the samples of the selected beat and position in grid
   * if there's a beat already loaded, a save sequence is triggered and the next selected
   * beat will be loaded if and only if the user saves their previous work.
   * @param {GridBeatObject} selectedBeatObject
   */
  shouldLoadBeatObject = selectedBeatObject => {
    const { currentGridItem } = this.props
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
    this.props.setCurrentGridItem(beatsObject)
    this.setState({ downloadSamples: samplesToDownload })
  }

  /**
   * Responds to sample being clicked in vertical list
   * @param {GridSampleObject} sampleObject
   */
  handleSampleItemClick = sampleObject => {
    this.setState({
      currentItemContextPromptInfo: {
        title: sampleObject.sampleTitle,
        shouldShowPrompt: true,
        value: sampleObject,
        type: ListObjectType.Sample,
        onLoadItemToGrid: _ => {
          this.shouldLoadSampleItem(sampleObject)
          this.closeContextPromptInfo()
        },
        onItemDeleted: _ => {
          this.sampleItemListRequest()
          this.closeContextPromptInfo()
        },
        onCancel: _ => this.closeContextPromptInfo(),
      },
    })
  }

  /**
   * Load the selected sample onto the grid
   * @param {GridSampleObject} sampleObject
   */
  shouldLoadSampleItem = sampleObject => {
    // Sample are copied to overcome default pass-by-reference behavior in javascript
    let copySampleObject = {}
    Object.assign(copySampleObject, sampleObject)
    this.props.currentGridItem.isWorthSaving = true
    this.setState({ downloadSamples: [copySampleObject] })
  }

  // MARK : Network Request Handlers

  /**
   * Handles saving of samples being downloaded when they become available
   * @param {[GridSampleObject]} newSamples
   */
  handleSampleItemDownloaded = newSamples => {
    const { currentGridItem } = this.props
    currentGridItem.isWorthSaving = true
    this.setState({ downloadSamples: null })
    this.props.setCurrentGridItem(appendSamplesToBeat(newSamples, currentGridItem))
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

  render() {
    return (
      <div className={`StudioPanel ${this.state.customClass}`}>
        <VerticalListPanel
          customClassname="LeftColumn"
          title={VerticalListTitles.Beats}
          itemList={this.state.loadedBeats}
          onAddClick={this.handleBeatsAddClick}
          onItemClick={this.handleBeatsItemClick}
          onItemDelete={this.handleDeleteBeat}
          itemListRequest={this.beatsItemListRequest}
        ></VerticalListPanel>
        <VerticalListPanel
          customClassname="MiddleColumn"
          title={VerticalListTitles.Samples}
          itemList={this.state.loadedSamples}
          onAddClick={this.handleSampleAddClick}
          onItemClick={this.handleSampleItemClick}
          onItemDelete={this.handleDeleteSample}
          itemListRequest={this.sampleItemListRequest}
        ></VerticalListPanel>
        <WorkstationPanel
          customClassname="RightColumn"
          title={WorkstationTitle}
          currentGridBeat={this.props.currentGridItem}
          setLoadedSampleList={newGridSamples => {
            const { currentGridItem } = this.props
            this.props.setCurrentGridItem(updateBeatSamples(newGridSamples, currentGridItem))
          }}
          onSaveCurrentGridBeat={this.handleSaveBeatToDatabase}
          setIsMakingNetworkActivity={this.props.setIsMakingNetworkActivity}
        ></WorkstationPanel>
        <SynthesizerWrapper {...this.state.currentSynthesizerInfo}></SynthesizerWrapper>
        {this.renderSampleDownloader()}
        <SaveBeatPromptWrapper
          promptInfo={this.state.currentSavePromptInfo}
          currentGridItem={this.props.currentGridItem}
          setIsMakingNetworkActivity={this.props.setIsMakingNetworkActivity}
          onSaveError={() => this.setState({ currentSavePromptInfo: ClosePromptInfo })}
        ></SaveBeatPromptWrapper>
        <ItemContextPromptWrapper
          promptInfo={this.state.currentItemContextPromptInfo}
          setIsMakingNetworkActivity={this.props.setIsMakingNetworkActivity}
        ></ItemContextPromptWrapper>
      </div>
    )
  }
}

export { StudioPanel }
