import React, { useState, useEffect } from 'react'
import { DEFAULT_GRID_COLUMN_COUNT } from './constants'
import { GridSampleObject, GridSampleMatrix, GridActivator } from './gridComponents'
import { GridBeatObject } from './gridObjects'
import { MenuButton, MenuButtonColor, MenuButtonSelectionState } from '../../input/input'
import { fixResizeOverCorrections, commitBeatIfNecessary } from './gridObjects'
import { SampleSequenceRenderer } from './sampleSequencePlayer'

import PlayButton from '../../../images/whitePlayButton.png'
import './workstationPanel.css'

const PlayAudioContext = new AudioContext()

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
const WorkstationPanel = props => {
  const customClass = props.customClass ?? ''
  const [numberOfRows, setNumberOfRows] = useState(0)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [renderedAudioNode, setRenderedAudioNode] = useState(null)

  // MARK : Life Cycle

  useEffect(() => {
    // update number of rows if necessary
    if (numberOfRows != props.currentGridBeat.samples.length) {
      setNumberOfRows(props.currentGridBeat.samples.length)
    }
  })

  // MARK : Event handlers

  const handlePlayButtonClick = () => {
    const { samples } = props.currentGridBeat
    // Stop audio if something playing
    if (isPlayingAudio && renderedAudioNode != null) {
      renderedAudioNode.stop()
      renderedAudioNode.removeEventListener('ended', null)
      return
    }

    if (samples.length == 0) {
      return
    }
    props.setIsMakingNetworkActivity(true)
    SampleSequenceRenderer(
      samples,
      renderedBuffer => {
        props.setIsMakingNetworkActivity(false)
        let renderedAudioNodeSource = PlayAudioContext.createBufferSource()
        renderedAudioNodeSource.buffer = renderedBuffer
        renderedAudioNodeSource.connect(PlayAudioContext.destination)
        setRenderedAudioNode(renderedAudioNodeSource)
        setIsPlayingAudio(true)
        renderedAudioNodeSource.start()
        renderedAudioNodeSource.addEventListener('ended', _ => setIsPlayingAudio(false))
      },
      _ => {
        props.setIsMakingNetworkActivity(false)
      }
    )
  }

  const handleSaveButtonClick = () => {
    const { currentGridBeat } = props
    if (!currentGridBeat.isWorthSaving) {
      return
    }
    const didPerformSave = commitBeatIfNecessary(currentGridBeat)
    if (!didPerformSave) {
      return
    }
    props.onSaveCurrentGridBeat(currentGridBeat)
  }

  /**
   * @param {Number} index
   * @param {Number} newAudioDelay new position on grid
   */
  const handleGridSampleDragEnd = (index, newAudioDelay) => {
    if (index < 0 || index >= props.currentGridBeat.samples.length) {
      return
    }
    let newValue = getLoadedSampleCopy()
    newValue[index].sampleAudioDelay = newAudioDelay
    fixResizeOverCorrections(newValue[index])
    props.setLoadedSampleList(newValue)
  }

  /**
   * @param {Number} index
   * @param {Number} durationDelta change in item length. can be +/-
   * @param {ResizeDirection} direction
   */
  const handleGridSampleResizeEnd = (index, durationDelta, direction) => {
    if (index < 0 || index >= props.currentGridBeat.samples.length) {
      return
    }
    let newValue = getLoadedSampleCopy()
    let editedSample = newValue[index]

    if ('right' === direction) {
      editedSample.sampleAudioLength += durationDelta
    } else {
      editedSample.sampleAudioDelay -= durationDelta
      editedSample.sampleAudioStart -= durationDelta
      editedSample.sampleAudioLength += durationDelta
    }
    fixResizeOverCorrections(editedSample)
    props.setLoadedSampleList(newValue)
  }

  /**
   * @param {Number} index index of activator being toggled
   */
  const handleActivatorToggle = index => {
    if (index < 0 || index >= props.currentGridBeat.samples.length) {
      return
    }
    let newValue = getLoadedSampleCopy()
    newValue[index].sampleIsActive = !newValue[index].sampleIsActive
    props.setLoadedSampleList(newValue)
  }

  // MARK : Helpers

  /**
   * @returns {[GridSampleObject]}
   */
  const getLoadedSampleCopy = () => {
    let newValue = []
    Object.assign(newValue, props.currentGridBeat.samples)
    return newValue
  }

  return (
    <div className={`WorkstationPanel ${customClass}`}>
      <div className="WorkstationPanelMenu">
        <h4 className="WorkstationPanelMenuTitle LeftSpot">{props.title}</h4>
        <MenuButton
          props={{
            color: MenuButtonColor.Blue,
            selectionState: MenuButtonSelectionState.Active,
            customClass: 'WorkstationPanelMenuButton MiddleSpot CenterSelf',
            title: `${isPlayingAudio ? 'Stop' : 'Play'}`,
            imageSource: PlayButton,
            imageHeight: '20px',
            imageWidth: '20px',
            onMenuButtonClick: () => {
              handlePlayButtonClick()
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
              handleSaveButtonClick()
            },
          }}
        ></MenuButton>
      </div>
      <div className="GridContainer">
        <div className="GridActivators">
          <GridActivator
            activatorStates={props.currentGridBeat.samples}
            onActivatorClick={handleActivatorToggle}
          ></GridActivator>
        </div>
        <GridSampleMatrix
          loadedGridSampleItems={props.currentGridBeat.samples}
          numberOfCols={DEFAULT_GRID_COLUMN_COUNT}
          numberOfRows={numberOfRows}
          onItemDragStop={handleGridSampleDragEnd}
          onItemResizeStop={handleGridSampleResizeEnd}
        ></GridSampleMatrix>
      </div>
    </div>
  )
}

export { WorkstationPanel }
