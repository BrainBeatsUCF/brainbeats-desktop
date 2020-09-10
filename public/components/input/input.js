import React from 'react'
import './input.css'

const MenuButtonColor = {
	Blue: 'InputMenuButtonBlue',
	Red: 'InputMenuButtonRed',
}

const MenuButtonSelectionState = {
	Active: 'InputMenuButtonActive',
	Inactive: '',
}

/**
 * @param {{
 * color: MenuButtonColor,
 * selectionState: MenuButtonSelectionState,
 * customClass: String,
 * imageCustomClass: String?,
 * title: String,
 * imageSource: String,
 * imageHeight: Number,
 * imageWidth: Number,
 * onMenuButtonClick: () => ()
 * }} props
 */
const MenuButton = props => {
	props = props.props
	const imageCustomClass = props.imageCustomClass ?? ''
	return (
		<div
			className={`InputMenuButton ${props.color} ${props.selectionState} ${props.customClass}`}
			onClick={() => props.onMenuButtonClick()}
		>
			<label style={{ cursor: 'pointer' }}>{props.title}</label>
			<img
				className={imageCustomClass}
				alt={props.title}
				src={props.imageSource}
				height={props.imageHeight}
				width={props.imageWidth}
			></img>
		</div>
	)
}

export { MenuButtonColor, MenuButtonSelectionState, MenuButton }
