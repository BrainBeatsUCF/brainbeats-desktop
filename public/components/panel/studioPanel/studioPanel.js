import React from 'react'
import { ListObjectType, VerticalListPanel } from '../verticalListPanel/verticalListPanel'
import { WorkstationPanel } from '../workstationPanel/workstationPanel'
import { GridSampleObject } from '../workstationPanel/gridComponents'
import { SampleDownloader } from './sampleDownloader'
import { RequestUserBeatItems, RequestUserSampleItems } from '../../requestService/requestService'
import { SampleSynthesizer, SynthesizingStage } from '../sampleSynthesizerPanel/sampleSynthesizerPanel'
import { GridBeatObject, updateBeatSamples, appendSamplesToBeat } from '../workstationPanel/gridObjects'
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

  handleBeatsAddClick = () => {
    // TODO: Start a new slate on grid
    // If content already exists in grid, ask user to save then close
    // else close right away and renew slate
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
   * @param {GridBeatObject} beatsObject
   */
  handleBeatsItemClick = beatsObject => {
    // TODO: Prompt save of current work if grid is occupied

    const samplesToDownload = beatsObject.samples
    beatsObject.samples = []
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
    this.setState({ downloadSamples: [sampleObject] })
  }

  // MARK : Network Request Handlers

  /**
   * @param {[GridSampleObject]} newSamples
   */
  handleSampleItemDownloaded = newSamples => {
    const { currentGridItem } = this.state
    this.setState({
      downloadSamples: null,
      currentGridItem: appendSamplesToBeat(newSamples, currentGridItem),
    })
  }

  beatsItemListRequest = onCompletion => {
    RequestUserBeatItems(this.props.userInfo, data => {
      if (StudioPanelComponentMounted) {
        onCompletion(data)
        this.setState({ loadedBeats: data })
      }
    })
  }

  /**
   *
   * @param {(data: GridSampleObject) => void} onCompletion
   */
  sampleItemListRequest = onCompletion => {
    RequestUserSampleItems(this.props.userInfo, data => {
      if (StudioPanelComponentMounted) {
        onCompletion(data)
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
          onAddClick={this.handleBeatsAddClick}
          onItemClick={this.handleBeatsItemClick}
          setIsMakingNetworkActivity={this.props.setIsMakingNetworkActivity}
          itemListRequest={this.beatsItemListRequest}
        ></VerticalListPanel>
        <VerticalListPanel
          customClassname="MiddleColumn"
          title={VerticalListTitles.Samples}
          onAddClick={this.handleSampleAddClick}
          onItemClick={this.handleSampleItemClick}
          setIsMakingNetworkActivity={this.props.setIsMakingNetworkActivity}
          itemListRequest={this.sampleItemListRequest}
        ></VerticalListPanel>
        <WorkstationPanel
          customClassname="RightColumn"
          title={WorkstationTitle}
          currentGridBeat={this.state.currentGridItem}
          setLoadedSampleList={newGridSamples => {
            const { currentGridItem } = this.state
            this.setState({ currentGridBeat: updateBeatSamples(newGridSamples, currentGridItem) })
          }}
          setIsMakingNetworkActivity={this.props.setIsMakingNetworkActivity}
        ></WorkstationPanel>
        {this.renderSynthesizer()}
        {this.renderSampleDownloader()}
      </div>
    )
  }
}

export { StudioPanel }
