import React from 'react'
import playButton from './../../../images/playButton.png'
import pauseButton from './../../../images/pauseButton.png'
import redHeartButton from './../../../images/redHeartButton.png'
import whiteHeartButton from './../../../images/whiteHeartButton.png'

import './publicBeatCard.css'

const PublicBeatObject = {
  id: '',
  ownerProfileImage: '',
  displayImage: '',
  displayTitle: '',
  displayOwner: '',
  audioSource: '',
  sampleCount: 0,
  formattedPlayTime: '',
}

/**
 * @param {{
 * customClass: String,
 * isPlaying: boolean,
 * index: Number,
 * item: PublicBeatObject,
 * isLiked: Boolean,
 * shouldToggleLike: (isLiked: Boolean, beatId: String) => void,
 * onClick: (item: PublicBeatObject, index: Number) => void
 * }} props
 */
const PublicBeatCard = props => {
  const { ownerProfileImage, displayImage, displayTitle, displayOwner } = props.item
  const { sampleCount, formattedPlayTime } = props.item
  const overrideClassName = props.customClass ?? ''

  const style = {
    backgroundImage: `url(${displayImage})`,
  }

  const getProfileImage = _ => {
    if (ownerProfileImage != null || ownerProfileImage !== '') {
      return <img className="PublicBeatsOwnerImage" src={ownerProfileImage} height="60px" width="60px"></img>
    } else {
      return <img className="PublicBeatsOwnerImage" height="60px" width="60px"></img>
    }
  }

  return (
    <div key={displayTitle + props.index} className={`PublicBeatsContainer ${overrideClassName}`} style={style}>
      <div className="PublicBeatsContentOverlay"></div>
      <div className="PublicBeatsContent">
        {getProfileImage()}
        <div className="PublicBeatInfo">
          <h5 className="PublicBeatInfoLabel">{displayTitle}</h5>
          <div className="PublicBeatInfoContent">
            <img
              className="PublicBeatActionButton"
              onClick={() => props.onClick(props.item, props.index)}
              src={props.isPlaying ? pauseButton : playButton}
              height="30px"
              width="30px"
            ></img>
            <div className="PublicBeatPlayInfo">
              <h5 className="PublicBeatInfoDesc">{displayOwner}</h5>
              <h5 className="PublicBeatInfoDesc">{`${sampleCount} ${
                sampleCount === 1 ? 'sample' : 'samples'
              }, ${formattedPlayTime}`}</h5>
            </div>
          </div>
          <div className="PublicBeatVerticalSpacer"></div>
        </div>
        <img
          className="PublicBeatsLikeButton"
          src={props.isLiked ? redHeartButton : whiteHeartButton}
          height="30px"
          width="30px"
          onClick={_ => {
            props.shouldToggleLike(!props.isLiked, props.item.id)
          }}
        ></img>
      </div>
    </div>
  )
}

export { PublicBeatObject, PublicBeatCard }
