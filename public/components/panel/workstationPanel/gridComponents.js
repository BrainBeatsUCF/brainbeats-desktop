import React from 'react'
import { Rnd } from 'react-rnd'

import * as Constants from './constants.js'
import GreenCheckmark from '../../../images/checkGreen.png'
import RedCheckmark from '../../../images/checkRed.png'
import './grid.css'

const GridSampleObject = {
  sampleSource: '',
  sampleTitle: '',
  sampleSubtitle: '',
  sampleIsActive: true,
  sampleRowIndex: 0,
  sampleColIndex: 0,
  samplePlayLength: 1,
}

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
          minHeight: Constants.CELL_DIMENSION_IN_PIXELS,
          minWidth: Constants.CELL_DIMENSION_IN_PIXELS,
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
 * loadedGridSampleItems: [GridSampleObject]
 * numberOfRows: Number,
 * numberOfCols: Number,
 * onItemDragStop: (index: Number, newEditedCol: Number) => void,
 * onItemResizeStop: (index: Number, newEditedLength: Number) => void
 * }} props
 */
const GridSampleMatrix = props => {
  const handleDrag = (index, xPosition) => {
    props.onItemDragStop(index, xPosition / Constants.CELL_DIMENSION_IN_PIXELS - 1)
  }

  const handleResize = (index, delta) => {
    const lengthDelta = delta.width / Constants.CELL_DIMENSION_IN_PIXELS
    props.onItemResizeStop(index, lengthDelta)
  }

  const renderSampleGridItems = () => {
    return props.loadedGridSampleItems.map((gridSampleItem, index) => {
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
            x: Constants.CELL_DIMENSION_IN_PIXELS * gridSampleItem.sampleColIndex,
            y: Constants.CELL_DIMENSION_IN_PIXELS * gridSampleItem.sampleRowIndex + Constants.GRID_SCREEN_Y_OFFSET,
            width: Constants.CELL_DIMENSION_IN_PIXELS * gridSampleItem.samplePlayLength,
            height: Constants.CELL_DIMENSION_IN_PIXELS,
          }}
          minHeight={Constants.CELL_DIMENSION_IN_PIXELS}
          maxHeight={Constants.CELL_DIMENSION_IN_PIXELS}
          minWidth={Constants.CELL_DIMENSION_IN_PIXELS}
          maxWidth={Constants.MAXIMUM_GRID_COLUMN_COUNT * Constants.CELL_DIMENSION_IN_PIXELS}
          resizeGrid={[Constants.CELL_DIMENSION_IN_PIXELS, 1]}
          dragGrid={[Constants.CELL_DIMENSION_IN_PIXELS, 1]}
          dragAxis="x"
          bounds=".GridMatrix"
          onResizeStop={(event, dir, ref, delta, position) => handleResize(index, delta)}
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
        minHeight: Constants.CELL_DIMENSION_IN_PIXELS * props.numberOfRows,
        minWidth: Constants.CELL_DIMENSION_IN_PIXELS * props.numberOfCols,
        height: Constants.CELL_DIMENSION_IN_PIXELS * props.numberOfRows,
        width: Constants.CELL_DIMENSION_IN_PIXELS * props.numberOfCols,
      }}
    >
      {renderSampleGridItems()}
    </div>
  )
}

export { GridSampleObject, GridSampleMatrix, GridActivator }
