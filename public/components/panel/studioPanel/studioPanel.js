import React from 'react'
import { ListObjectType, VerticalListPanel } from '../verticalListPanel/verticalListPanel'
import { WorkstationPanel } from '../workstationPanel/workstationPanel'
import { SampleDownloadPromptWrapper, CloseSampleDownloadPrompt } from './sampleDownloader'
import { SaveBeatPromptWrapper, ClosePromptInfo } from './saveBeatPrompt'
import { ItemContextPromptWrapper, CloseContextPromptInfo } from './itemContextPrompt'
import { GetUserAuthInfo } from '../../requestService/authRequestService'
import { RequestGetOwnedBeats, RequestGetOwnedSamples } from '../../requestService/itemRequestService'
import { HideSynthesizerInfo } from './synthesizerPanel/synthesizerPanel'
import { SynthesizerManager } from './synthesizerPanel/synthesizerManagerPanel'
import { BeatDownloadPromptWrapper, CloseBeatDownloadPrompt } from './beatDownloadPrompt'
import {
  GridBeatObject,
  GridSampleObject,
  updateBeatSamples,
  appendSamplesToBeat,
  getEmptyBeat,
} from '../workstationPanel/gridObjects'
import './studioPanel.css'

let StudioPanelComponentMounted = false
const StudioAudioContext = new AudioContext({ sampleRate: 44100 })
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
   * setIsMakingNetworkActivity: (Boolean) => void
   * setCurrentGridItem: (GridBeatObject) => void
   * }} props
   */
  constructor(props) {
    super(props)
    this.state = {
      customClass: props.customClass ?? '',
      currentSavePromptInfo: ClosePromptInfo,
      currentItemContextPromptInfo: CloseContextPromptInfo,
      currentSynthesizerInfo: HideSynthesizerInfo,
      currentBeatDownloadInfo: CloseBeatDownloadPrompt,
      currentSampleDownloadInfo: CloseSampleDownloadPrompt,
      loadedBeats: [],
      loadedSamples: [],
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
          /// Important! Replace buffers since we lose them after decoding-encoding
          beatObject.samples.forEach((sample, index) => {
            savedGridObject.samples[index].sampleAudioBuffer = sample.sampleAudioBuffer
          })
          this.props.setCurrentGridItem(savedGridObject)
        },
        onCloseBeat: _ => {
          this.beatsItemListRequest()
          this.setState({ currentSavePromptInfo: ClosePromptInfo })
          this.props.setCurrentGridItem(getEmptyBeat())
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
          onCloseBeat: _ => {
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
          this.sampleItemListRequest()
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
          onCloseBeat: _ => {
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
    this.setState({
      currentBeatDownloadInfo: {
        shouldShowPrompt: true,
        beatObject: beatsObject,
        audioContext: StudioAudioContext,
        onDownloadComplete: downloadedBeatObject => {
          downloadedBeatObject.isWorthSaving = true
          this.setState({ currentBeatDownloadInfo: CloseBeatDownloadPrompt })
          this.props.setCurrentGridItem(downloadedBeatObject)
        },
        onDownloadError: _ => {
          // Nothing is loaded on download fail
          console.error('Failed to download some sample')
        },
      },
    })
  }

  /**
   * Responds to sample being clicked in vertical list
   * @param {GridSampleObject} sampleObject
   */
  handleSampleItemClick = sampleObject => {
    let canDeleteSample = true
    this.props.currentGridItem.samples.forEach(singleSample => {
      if (singleSample.sampleID === sampleObject.sampleID) {
        canDeleteSample = false
      }
    })
    this.setState({
      currentItemContextPromptInfo: {
        title: sampleObject.sampleTitle,
        shouldShowPrompt: true,
        canDeleteSample: canDeleteSample,
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
    this.setState({
      currentBeatDownloadInfo: {
        shouldShowPrompt: true,
        sampleObjects: [sampleObject],
        audioContext: StudioAudioContext,
        onDownloadComplete: this.handleSampleItemDownloaded,
        onDownloadError: _ => {
          // Nothing is loaded on download fail
          console.error(`Failed to download ${sampleObject.sampleTitle} sample`)
        },
      },
    })
  }

  // MARK : Network Request Handlers

  /**
   * Handles saving of samples being downloaded when they become available
   * @param {[GridSampleObject]} newSamples
   */
  handleSampleItemDownloaded = newSamples => {
    const { currentGridItem } = this.props
    currentGridItem.isWorthSaving = true
    this.props.setCurrentGridItem(appendSamplesToBeat(newSamples, currentGridItem))
  }

  /**
   * Fetches the most up to date list of a users beat library
   * @param {(data: [GridBeatObject]) => void} onCompletion
   */
  beatsItemListRequest = () => {
    this.props.setIsMakingNetworkActivity(true)
    RequestGetOwnedBeats(
      GetUserAuthInfo(),
      data => {
        if (StudioPanelComponentMounted) {
          this.props.setIsMakingNetworkActivity(false)
          this.setState({ loadedBeats: data })
        }
      },
      _ => {
        /* Request Error */
      }
    )
  }

  /**
   * Fetches the most up to date list of users sample library
   */
  sampleItemListRequest = () => {
    this.props.setIsMakingNetworkActivity(true)
    RequestGetOwnedSamples(
      GetUserAuthInfo(),
      data => {
        if (StudioPanelComponentMounted) {
          this.props.setIsMakingNetworkActivity(false)
          this.setState({ loadedSamples: data })
        }
      },
      _ => {
        /* Error Callback */
      }
    )
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
        <SynthesizerManager {...this.state.currentSynthesizerInfo}></SynthesizerManager>
        <BeatDownloadPromptWrapper promptInfo={this.state.currentBeatDownloadInfo}></BeatDownloadPromptWrapper>
        <SampleDownloadPromptWrapper promptInfo={this.state.currentSampleDownloadInfo}></SampleDownloadPromptWrapper>
        <SaveBeatPromptWrapper
          userInfo={GetUserAuthInfo()}
          promptInfo={this.state.currentSavePromptInfo}
          currentGridItem={this.props.currentGridItem}
          setIsMakingNetworkActivity={this.props.setIsMakingNetworkActivity}
          onSaveError={() => this.setState({ currentSavePromptInfo: ClosePromptInfo })}
        ></SaveBeatPromptWrapper>
        <ItemContextPromptWrapper
          userInfo={GetUserAuthInfo()}
          promptInfo={this.state.currentItemContextPromptInfo}
          setIsMakingNetworkActivity={this.props.setIsMakingNetworkActivity}
        ></ItemContextPromptWrapper>
      </div>
    )
  }
}

export { StudioPanel }
