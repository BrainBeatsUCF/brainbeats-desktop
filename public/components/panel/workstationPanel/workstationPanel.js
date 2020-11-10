import React, { useState, useEffect } from 'react'
import { DEFAULT_GRID_COLUMN_COUNT, PIXELS_PER_SECOND, CELL_WIDTH_IN_PIXELS } from './constants'
import { GridSampleObject, GridSampleMatrix, GridActivator, GridTimeRuler } from './gridComponents'
import { MenuButton, MenuButtonColor, MenuButtonSelectionState } from '../../input/input'
import { GridBeatObject, fixResizeOverCorrections } from './gridObjects'
import { SampleSequenceRenderer } from './sampleSequencePlayer'
import PauseButton from '../../../images/pauseButton.png'
import PlayButton from '../../../images/whitePlayButton.png'
import './workstationPanel.css'

// Dictates how many times the tracker is redrawn, this value can be changed to suite
// performance vs. smooth animation needs
const TrackLineFrameRate = 100

const PlayAudioContext = new AudioContext()
let tracklineIntervalID = null
let WorkstationPanelMounted = false

class WorkstationPanel extends React.Component {
  /**
   * @param {{
   * customClassname: String?,
   * title: String,
   * currentGridBeat: GridBeatObject,
   * setLoadedSampleList: (loadedSampleList: [GridSampleObject]) => void,
   * onSaveCurrentGridBeat: (beatObject: GridBeatObject) => void,
   * setIsMakingNetworkActivity: (Boolean) => void
   * }} props
   */
  constructor(props) {
    super(props)
    this.state = {
      customClass: props.customClass ?? '',
      numberOfRows: 0,
      isPlayingAudio: false,
      renderedAudioNode: null,
      trackLinePosition: -1,
    }
  }

  componentDidMount() {
    WorkstationPanelMounted = true
  }

  componentDidUpdate() {
    if (this.state.numberOfRows != this.props.currentGridBeat.samples.length) {
      this.setState({ numberOfRows: this.props.currentGridBeat.samples.length })
    }
  }

  componentWillUnmount() {
    this.stopAudioPlayback()
    WorkstationPanelMounted = false
  }

  resetPlaybackState = () => {
    clearInterval(tracklineIntervalID)
    this.setState({
      renderedAudioNode: null,
      trackLinePosition: -1,
      isPlayingAudio: false,
    })
  }

  stopAudioPlayback = () => {
    const { isPlayingAudio, renderedAudioNode } = this.state
    if (isPlayingAudio && renderedAudioNode != null) {
      renderedAudioNode.removeEventListener('ended', null)
      renderedAudioNode.stop()
      this.resetPlaybackState()
      return
    }
  }

  startAudioPlayback = audioBuffer => {
    let renderedAudioNodeSource = PlayAudioContext.createBufferSource()
    renderedAudioNodeSource.buffer = audioBuffer
    renderedAudioNodeSource.connect(PlayAudioContext.destination)
    this.setState({
      renderedAudioNode: renderedAudioNodeSource,
      isPlayingAudio: true,
    })
    renderedAudioNodeSource.addEventListener('ended', _ => {
      if (WorkstationPanelMounted) {
        this.resetPlaybackState()
      }
    })
    renderedAudioNodeSource.start()

    // Capture startTime and start animating tracker
    const startTime = PlayAudioContext.currentTime
    tracklineIntervalID = setInterval(() => {
      const playbackTime = PlayAudioContext.currentTime - startTime
      this.setState({ trackLinePosition: playbackTime * PIXELS_PER_SECOND })
    }, TrackLineFrameRate)
  }

  // MARK : Event handlers

  handlePlayStopButtonClick = () => {
    const { samples } = this.props.currentGridBeat
    // Stop audio if something playing
    if (this.state.isPlayingAudio) {
      this.stopAudioPlayback()
      return
    }

    if (samples.length == 0) {
      return
    }
    this.props.setIsMakingNetworkActivity(true)
    SampleSequenceRenderer(
      samples,
      renderedBuffer => {
        this.props.setIsMakingNetworkActivity(false)
        if (WorkstationPanelMounted) {
          this.startAudioPlayback(renderedBuffer)
        }
      },
      _ => {
        this.props.setIsMakingNetworkActivity(false)
      }
    )
  }

  handleSaveButtonClick = () => {
    const { currentGridBeat } = this.props
    if (currentGridBeat.isWorthSaving) {
      this.props.onSaveCurrentGridBeat(currentGridBeat)
    }
  }

  /**
   * @param {Number} index
   * @param {Number} newAudioDelay new position on grid
   */
  handleGridSampleDragEnd = (index, newAudioDelay) => {
    if (index < 0 || index >= this.props.currentGridBeat.samples.length) {
      return
    }
    let newValue = this.getLoadedSampleCopy()
    newValue[index].sampleAudioDelay = newAudioDelay
    fixResizeOverCorrections(newValue[index])
    this.props.setLoadedSampleList(newValue)
  }

  /**
   * @param {Number} index
   * @param {Number} durationDelta change in item length. can be +/-
   * @param {ResizeDirection} direction
   */
  handleGridSampleResizeEnd = (index, durationDelta, direction) => {
    if (index < 0 || index >= this.props.currentGridBeat.samples.length) {
      return
    }
    let newValue = this.getLoadedSampleCopy()
    let editedSample = newValue[index]

    if ('right' === direction) {
      editedSample.sampleAudioLength += durationDelta
    } else {
      editedSample.sampleAudioDelay -= durationDelta
      editedSample.sampleAudioStart -= durationDelta
      editedSample.sampleAudioLength += durationDelta
    }
    fixResizeOverCorrections(editedSample)
    this.props.setLoadedSampleList(newValue)
  }

  /**
   * @param {Number} index index of activator being toggled
   */
  handleActivatorToggle = index => {
    if (index < 0 || index >= this.props.currentGridBeat.samples.length) {
      return
    }
    let newValue = this.getLoadedSampleCopy()
    newValue[index].sampleIsActive = !newValue[index].sampleIsActive
    this.props.setLoadedSampleList(newValue)
  }

  // MARK : Helpers

  /**
   * @returns {[GridSampleObject]}
   */
  getLoadedSampleCopy = () => {
    let newValue = []
    Object.assign(newValue, this.props.currentGridBeat.samples)
    return newValue
  }

  render() {
    const { customClass, isPlayingAudio, numberOfRows, trackLinePosition } = this.state
    const { currentGridBeat } = this.props
    const loadedTitle =
      numberOfRows > 0 && currentGridBeat.sampleTitle !== '' ? ' - ' + currentGridBeat.sampleTitle : ''
    return (
      <div className={`WorkstationPanel ${customClass}`}>
        <div className="WorkstationPanelMenu">
          <h4 className="WorkstationPanelMenuTitle LeftSpot">
            {this.props.title}
            {loadedTitle}
          </h4>
          <MenuButton
            props={{
              color: MenuButtonColor.Blue,
              selectionState: MenuButtonSelectionState.Active,
              customClass: 'WorkstationPanelMenuButton MiddleSpot CenterSelf',
              title: `${isPlayingAudio ? 'Stop' : 'Play'}`,
              imageSource: isPlayingAudio ? PauseButton : PlayButton,
              imageHeight: '20px',
              imageWidth: '20px',
              onMenuButtonClick: () => {
                this.handlePlayStopButtonClick()
              },
            }}
          ></MenuButton>
          <MenuButton
            props={{
              color: MenuButtonColor.Blue,
              selectionState: MenuButtonSelectionState.Active,
              customClass: 'WorkstationPanelMenuButton RightSpot CenterSelf',
              title: 'Save',
              imageCustomClass: 'WorkstationPanelNoImageMenuButton',
              imageSource: PlayButton,
              imageHeight: '20px',
              imageWidth: '20px',
              onMenuButtonClick: () => {
                this.handleSaveButtonClick()
              },
            }}
          ></MenuButton>
        </div>
        <div className="GridContainer">
          <GridTimeRuler
            isHidden={numberOfRows <= 0}
            numberOfCols={DEFAULT_GRID_COLUMN_COUNT}
            columnWidth={CELL_WIDTH_IN_PIXELS}
            unit={CELL_WIDTH_IN_PIXELS / PIXELS_PER_SECOND}
          ></GridTimeRuler>
          <div className="GridComponentsContainer">
            <div className="GridActivators">
              <GridActivator
                activatorStates={this.props.currentGridBeat.samples}
                onActivatorClick={this.handleActivatorToggle}
              ></GridActivator>
            </div>
            <GridSampleMatrix
              loadedGridSampleItems={this.props.currentGridBeat.samples}
              trackLinePosition={trackLinePosition}
              numberOfCols={DEFAULT_GRID_COLUMN_COUNT}
              numberOfRows={numberOfRows}
              onItemDragStop={this.handleGridSampleDragEnd}
              onItemResizeStop={this.handleGridSampleResizeEnd}
            ></GridSampleMatrix>
          </div>
        </div>
      </div>
    )
  }
}

export { WorkstationPanel }
