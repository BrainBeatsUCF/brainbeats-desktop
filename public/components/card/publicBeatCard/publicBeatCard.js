import React from 'react'
import playButton from './../../../images/playButton.png'
import pauseButton from './../../../images/pauseButton.png'

import './publicBeatCard.css'

const PublicBeatObject = {
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
 * onClick: (item: PublicBeatObject, index: Number) => void
 * }} props
 */
const PublicBeatCard = props => {
	const { ownerProfileImage, displayImage, displayTitle, displayOwner } = props.item
	const { sampleCount, playTime } = props.item
	const overrideClassName = props.customClass ?? ''

	const style = {
		backgroundImage: `url(${displayImage})`,
	}

	return (
		<div key={displayTitle + props.index} className={`PublicBeatsContainer ${overrideClassName}`} style={style}>
			<div className="PublicBeatsContentOverlay"></div>
			<div className="PublicBeatsContent">
				<img className="PublicBeatsOwnerImage" src={ownerProfileImage} height="60px" width="60px"></img>
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
							<h5 className="PublicBeatInfoDesc">{`${sampleCount} samples, ${playTime}`}</h5>
						</div>
					</div>
					<div className="PublicBeatVerticalSpacer"></div>
				</div>
			</div>
		</div>
	)
}

export { PublicBeatObject, PublicBeatCard }
