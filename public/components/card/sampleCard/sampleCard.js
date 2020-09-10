import React from 'react'
import './sampleCard.css'

const SampleCardObject = {
	displayImage: '',
	displayTitle: '',
	displayOwner: '',
	audioSource: '',
	className: '',
}

/**
 * @param {{
 * customClass: String,
 * index: Number,
 * item: SampleCardObject,
 * onClick: (item: SampleCardObject, index: Number) => void
 * }} props
 */
const SampleCard = props => {
	const overrideClassName = props.customClass ?? ''
	const { displayOwner, displayTitle, displayImage } = props.item
	const index = props.index
	return (
		<div
			key={displayOwner + index}
			className={`SampleCardContainer ${overrideClassName}`}
			onClick={() => props.onClick(props.item, props.index)}
		>
			<div className="SampleCardBackgroundImage">
				<img src={displayImage} height="100%" width="100%" className="SampleCardBackgroundImage"></img>
				<div className="SampleCardOverlay"></div>
			</div>
			<h5 className="SampleCardLabel">{displayTitle}</h5>
		</div>
	)
}

export { SampleCardObject, SampleCard }
