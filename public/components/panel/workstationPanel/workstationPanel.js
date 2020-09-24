import React, { useState, useEffect } from 'react'
import { DEFAULT_GRID_COLUMN_COUNT } from './constants'
import { GridSampleObject, GridSampleMatrix, GridActivator } from './gridComponents'
import { MenuButton, MenuButtonColor, MenuButtonSelectionState } from '../../input/input'
import { SampleSequencePlayer } from './sampleSequencePlayer'

import PlayButton from '../../../images/whitePlayButton.png'
import './workstationPanel.css'

/**
 * @param {{
 * customClassname: String?,
 * title: String,
 * loadedSampleList: [GridSampleObject],
 * setLoadedSampleList: (loadedSampleList: [GridSampleObject]) => void,
 * onSaveWork: () => void,
 * setIsMakingNetworkActivity: (Boolean) => void
 * }} props
 */
const WorkstationPanel = props => {
  const customClass = props.customClass ?? ''
  const [numberOfRows, setNumberOfRows] = useState(0)
  // const [loadedSampleList, setLoadedSampleList] = useState([])

  // MARK : Life Cycle
  useEffect(() => {
    // update number of rows if necessary
    if (numberOfRows != props.loadedSampleList.length) {
      setNumberOfRows(props.loadedSampleList.length)
    }
  })

  // MARK : Event handlers

  const handlePlayButtonClick = () => {
    const { loadedSampleList } = props
    // let sampleSequencePlayer = SampleSequencePlayer(loadedSampleList)
    const testSampleObjects = [
      {
        sampleSource: 'https://tribeofnoisestorage.blob.core.windows.net/music/30b3d365e7b15b0b6d2e6ba270dc2142.mp3',
        sampleAudioDelay: 5,
        sampleAudioStart: 30,
        sampleAudioLength: 10,
      },
      {
        sampleSource: 'https://tribeofnoisestorage.blob.core.windows.net/music/736d17f0b30c8eb02eebbedf9c593443.mp3',
        sampleAudioDelay: 10,
        sampleAudioStart: 60,
        sampleAudioLength: 30,
      },
      {
        sampleSource: 'https://tribeofnoisestorage.blob.core.windows.net/music/736d17f0b30c8eb02eebbedf9c593443.mp3',
        sampleAudioDelay: 0,
        sampleAudioStart: 12,
        sampleAudioLength: 10,
      },
      {
        sampleSource: 'https://tribeofnoisestorage.blob.core.windows.net/music/3224dee000f1a0cc6709b62f6988927e.mp3',
        sampleAudioDelay: 0,
        sampleAudioStart: 0,
        sampleAudioLength: 2.5,
      },
      {
        sampleSource: 'https://tribeofnoisestorage.blob.core.windows.net/music/3224dee000f1a0cc6709b62f6988927e.mp3',
        sampleAudioDelay: 15,
        sampleAudioStart: 0,
        sampleAudioLength: 2.5,
      },
      {
        sampleSource: 'https://tribeofnoisestorage.blob.core.windows.net/music/3224dee000f1a0cc6709b62f6988927e.mp3',
        sampleAudioDelay: 16.5,
        sampleAudioStart: 0,
        sampleAudioLength: 2.5,
      },
    ]
    SampleSequencePlayer(testSampleObjects, null)
    // TODO: Merge arranged grid samples into single audio file and initiate playback
  }

  const handleSaveButtonClick = () => {
    // TODO: Pull up save popup
  }

  /**
   * @param {Number} index
   * @param {Number} newEditedCol new position on grid
   */
  const handleGridSampleDragEnd = (index, newEditedCol) => {
    if (index < 0 || index >= props.loadedSampleList.length) {
      return
    }
    let newValue = getLoadedSampleCopy()
    newValue[index].sampleColIndex = newEditedCol
    props.setLoadedSampleList(newValue)
  }

  /**
   * @param {Number} index
   * @param {Number} lengthDelta change in item length. can be +/-
   */
  const handleGridSampleResizeEnd = (index, lengthDelta) => {
    if (index < 0 || index >= props.loadedSampleList.length) {
      return
    }
    let newValue = getLoadedSampleCopy()
    newValue[index].samplePlayLength += lengthDelta
    props.setLoadedSampleList(newValue)
  }

  /**
   * @param {Number} index index of activator being toggled
   */
  const handleActivatorToggle = index => {
    if (index < 0 || index >= props.loadedSampleList.length) {
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
    Object.assign(newValue, props.loadedSampleList)
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
            title: 'Play',
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
            activatorStates={props.loadedSampleList}
            onActivatorClick={handleActivatorToggle}
          ></GridActivator>
        </div>
        <GridSampleMatrix
          loadedGridSampleItems={props.loadedSampleList}
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
