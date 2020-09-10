import React, { useState, useEffect } from 'react'
import { DEFAULT_GRID_COLUMN_COUNT } from './constants'
import { GridSampleObject, GridSampleMatrix, GridActivator } from './gridComponents'
import { MenuButton, MenuButtonColor, MenuButtonSelectionState } from '../../input/input'

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
