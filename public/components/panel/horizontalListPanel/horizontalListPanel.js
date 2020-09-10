import React, { useState } from 'react'
import { PersonalBeatObject, PersonalBeatCard } from '../../card/personalBeatCard/personalBeatCard'
import { PublicBeatObject, PublicBeatCard } from '../../card/publicBeatCard/publicBeatCard'
import { SampleCardObject, SampleCard } from '../../card/sampleCard/sampleCard'
import './horizontalListPanel.css'

const CardType = {
	PersonalBeat: 'personalBeat',
	PublicBeat: 'publicBeat',
	PublicSample: 'publicSample',
}

const ListTitle = {
	PersonalBeat: 'My Beats',
	PublicBeat: 'Public Beats',
	PublicSample: 'Public Samples',
}

const ListKey = {
	PersonalBeat: 'PersonalBeatListKey',
	PublicBeat: 'PublicBeatListKey',
	PublicSample: 'PublicSampleListKey',
}

/**
 * @param {{
 * customClass: String,
 * items: [PersonalBeatObject | SampleCardObject | PublicBeatObject],
 * title: String,
 * itemType: CardType,
 * isPlayingItem: (item: PersonalBeatObject | SampleCardObject | PublicBeatObject, index: Number) => boolean,
 * shouldPlayItem: (item: PersonalBeatObject | SampleCardObject | PublicBeatObject, index: Number, type: CardType) => void,
 * shouldStopItem: (item: PersonalBeatObject | SampleCardObject | PublicBeatObject, index: Number, type: CardType) => void,
 * }} props
 */
const HorizontalListPanel = props => {
	const [query, setQuery] = useState('')
	const overrideClassName = props.customClass ?? ''

	const isQueryEmpty = () => {
		return query == null || query == undefined || query === ''
	}

	/**
	 * @param {PersonalBeatObject | SampleCardObject | PublicBeatObject} item
	 */
	const filterIncludeItem = item => {
		if (isQueryEmpty()) {
			return true
		}
		switch (props.itemType) {
			case CardType.PersonalBeat:
			case CardType.PublicSample:
			case CardType.PublicBeat:
				return item.displayTitle.toLowerCase().includes(query.toLowerCase())
			default:
				return false
		}
	}

	/**
	 * @param {PersonalBeatObject | SampleCardObject | PublicBeatObject} item
	 * @param {Number} index
	 */
	const handleItemClick = (item, index) => {
		if (!props.isPlayingItem(item)) {
			props.shouldPlayItem(item, index, props.itemType)
		} else {
			props.shouldStopItem(item, index, props.itemType)
		}
	}

	const renderCards = () => {
		return props.items
			.filter(item => {
				return filterIncludeItem(item)
			})
			.map((item, index) => {
				switch (props.itemType) {
					case CardType.PersonalBeat:
						return (
							<PersonalBeatCard
								key={index + item.displayTitle}
								index={index}
								item={item}
								displayTagLimit={5}
								onClick={(clickItem, clickIndex) => handleItemClick(clickItem, clickIndex)}
							></PersonalBeatCard>
						)
					case CardType.PublicSample:
						return (
							<SampleCard
								key={index + item.displayTitle}
								index={index}
								item={item}
								onClick={(clickItem, clickIndex) => handleItemClick(clickItem, clickIndex)}
							></SampleCard>
						)
					case CardType.PublicBeat:
						return (
							<PublicBeatCard
								key={index + item.displayTitle}
								isPlaying={props.isPlayingItem(item)}
								index={index}
								item={item}
								onClick={(clickItem, clickIndex) => handleItemClick(clickItem, clickIndex)}
							></PublicBeatCard>
						)
					default:
						return <div></div>
				}
			})
	}

	return (
		<div className={`HorizontalListPanel ${overrideClassName}`}>
			<div className="HorizontalListMenuPanel">
				<h4 className="HorizontalListMenuPanelTitle">{props.title}</h4>
				<input
					type="text"
					className="HorizontalListMenuPanelSearch"
					placeholder="Search"
					onChange={event => setQuery(event.target.value)}
				></input>
			</div>
			<hr className="HorizontalListMenuPanelSeparator"></hr>
			<div className="HorizontalListPanelContent">
				{renderCards()}
				<div className="HorizontalListPanelContentSpacer"></div>
			</div>
		</div>
	)
}

export { CardType, ListTitle, ListKey, PersonalBeatObject, PublicBeatObject, SampleCardObject, HorizontalListPanel }
