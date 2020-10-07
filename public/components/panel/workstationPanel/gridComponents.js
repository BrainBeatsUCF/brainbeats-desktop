import React from 'react'
import { Rnd } from 'react-rnd'
import { GridSampleObject } from './gridObjects'
import * as Constants from './constants.js'
import GreenCheckmark from '../../../images/checkGreen.png'
import RedCheckmark from '../../../images/checkRed.png'
import './grid.css'

/// Provides the CSS styling for horizontal lines for the grid matrix
const backgroundCellHeight = `
  repeating-linear-gradient(
    0deg, 
    transparent 1px, 
    transparent ${Constants.CELL_HEIGHT_IN_PIXELS - 1}px, 
    #707070 ${Constants.CELL_HEIGHT_IN_PIXELS}px, 
    #707070 ${Constants.CELL_HEIGHT_IN_PIXELS + 1}px)`

/// Provides the CSS styling for vertical lines for the grid matrix
const backgroundCellWidth = `
  repeating-linear-gradient(
    -90deg, 
    transparent 1px, 
    transparent ${Constants.CELL_WIDTH_IN_PIXELS - 1}px, 
    #707070 ${Constants.CELL_WIDTH_IN_PIXELS}px, 
    #707070 ${Constants.CELL_WIDTH_IN_PIXELS + 1}px)`

/**
 * @param {{
 * activatorStates: [GridSampleObject],
 * onActivatorClick: (index) => void
 * }} props
 */
const GridActivator = props => {
  return props.activatorStates.map((value, index) => {
    return (
      <div
        key={Constants.ACTIVATOR_KEY_PREFIX + index}
        className="GridActivator"
        style={{
          minHeight: Constants.CELL_HEIGHT_IN_PIXELS,
          minWidth: Constants.CELL_HEIGHT_IN_PIXELS,
        }}
      >
        <img
          className="GridActivatorImage"
          src={value.sampleIsActive == true ? GreenCheckmark : RedCheckmark}
          height={Constants.ACTIVATOR_IMAGE_LENGTH_IN_PIXELS}
          width={Constants.ACTIVATOR_IMAGE_LENGTH_IN_PIXELS}
          onClick={() => props.onActivatorClick(index)}
        ></img>
      </div>
    )
  })
}

/**
 * @param {{
 * trackLinePosition: Number,
 * loadedGridSampleItems: [GridSampleObject]
 * numberOfRows: Number,
 * numberOfCols: Number,
 * onItemDragStop: (index: Number, newEditedCol: Number) => void,
 * onItemResizeStop: (index: Number, durationDelta: Number, direction: ResizeDirection) => void
 * }} props
 */
const GridSampleMatrix = props => {
  const maxGridLength = Constants.MAXIMUM_GRID_COLUMN_COUNT * Constants.CELL_WIDTH_IN_PIXELS
  const totalGridHeight = Constants.CELL_HEIGHT_IN_PIXELS * props.numberOfRows
  const totalGridWidth = Constants.CELL_WIDTH_IN_PIXELS * props.numberOfCols

  const handleDrag = (index, xPosition) => {
    const dragInSeconds = xPosition / Constants.PIXELS_PER_SECOND
    props.onItemDragStop(index, Math.abs(dragInSeconds))
  }

  const handleResize = (index, delta, direction) => {
    const durationDeltaInSeconds = Math.round(delta.width / Constants.PIXELS_PER_SECOND)
    props.onItemResizeStop(index, durationDeltaInSeconds, direction)
  }

  const renderTrackLine = () => {
    const { trackLinePosition } = props
    if (trackLinePosition == undefined || trackLinePosition == null || trackLinePosition < 0) {
      return <></>
    } else {
      return (
        <svg height={totalGridHeight} width={totalGridWidth} className="GridTimelineTrack">
          <line
            x1={trackLinePosition}
            y1={0}
            x2={trackLinePosition}
            y2={totalGridHeight}
            className="GridTimelineTrackLine"
          />
        </svg>
      )
    }
  }

  const renderSampleGridItems = () => {
    return props.loadedGridSampleItems.map((gridSampleItem, index) => {
      const maxAudioLength = gridSampleItem.sampleAudioBuffer.duration * Constants.PIXELS_PER_SECOND
      const currentAudioLength = gridSampleItem.sampleAudioLength * Constants.PIXELS_PER_SECOND
      const rndMaximumLength = maxAudioLength < maxGridLength ? maxAudioLength : maxGridLength
      return (
        <Rnd
          key={Constants.SAMPLE_GRID_ITEM_KEY_PREFIX + index}
          className="SampleGridItem"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          default={{
            x: Constants.PIXELS_PER_SECOND * gridSampleItem.sampleAudioDelay,
            y: Constants.CELL_HEIGHT_IN_PIXELS * index + Constants.GRID_SCREEN_Y_OFFSET,
            width: currentAudioLength < rndMaximumLength ? currentAudioLength : rndMaximumLength,
            height: Constants.CELL_HEIGHT_IN_PIXELS,
          }}
          enableResizing={{
            left: true,
            right: true,
            top: false,
            topLeft: false,
            topRight: false,
            bottom: false,
            bottomLeft: false,
            bottomRight: false,
          }}
          minHeight={Constants.CELL_HEIGHT_IN_PIXELS}
          maxHeight={Constants.CELL_HEIGHT_IN_PIXELS}
          minWidth={Constants.CELL_MINIMUM_WIDTH_IN_PIXELS}
          maxWidth={rndMaximumLength}
          resizeGrid={[Constants.PIXELS_PER_SECOND, 1]}
          dragGrid={[Constants.PIXELS_PER_SECOND, 1]}
          dragAxis="x"
          bounds=".GridMatrix"
          onResizeStop={(event, dir, ref, delta, position) => handleResize(index, delta, dir)}
          onDragStop={(event, handler) => handleDrag(index, handler.lastX)}
        >
          <h5 className="SampleGridItemTitle">{gridSampleItem.sampleTitle}</h5>
        </Rnd>
      )
    })
  }

  return (
    <div
      className="GridMatrix"
      style={{
        minHeight: Constants.CELL_HEIGHT_IN_PIXELS * props.numberOfRows,
        minWidth: Constants.CELL_WIDTH_IN_PIXELS * props.numberOfCols,
        height: Constants.CELL_HEIGHT_IN_PIXELS * props.numberOfRows,
        width: Constants.CELL_WIDTH_IN_PIXELS * props.numberOfCols,
        backgroundSize: `${Constants.CELL_WIDTH_IN_PIXELS}px ${Constants.CELL_HEIGHT_IN_PIXELS}px`,
        backgroundImage: `${backgroundCellWidth}, ${backgroundCellHeight}`,
      }}
    >
      {renderSampleGridItems()}
      {renderTrackLine()}
    </div>
  )
}

export { GridSampleObject, GridSampleMatrix, GridActivator }
