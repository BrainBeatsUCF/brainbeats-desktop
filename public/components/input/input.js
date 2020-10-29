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
  const buttonColor = props.color == null || props.color == undefined ? MenuButtonColor.Blue : props.color
  const selectionState =
    props.selectionState == null || props.selectionState == undefined
      ? MenuButtonSelectionState.Active
      : props.selectionState
  const getButtonImage = _ => {
    if (props.imageSource == null || props.imageSource == undefined) {
      return <></>
    } else {
      return (
        <img
          className={imageCustomClass}
          alt={props.title}
          src={props.imageSource}
          height={props.imageHeight}
          width={props.imageWidth}
        ></img>
      )
    }
  }

  return (
    <div
      className={`InputMenuButton ${buttonColor} ${selectionState} ${props.customClass}`}
      onClick={() => props.onMenuButtonClick()}
    >
      <label style={{ cursor: 'pointer' }}>{props.title}</label>
      {getButtonImage()}
    </div>
  )
}

export { MenuButtonColor, MenuButtonSelectionState, MenuButton }
