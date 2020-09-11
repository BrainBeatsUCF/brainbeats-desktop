import React, { useState, useEffect } from 'react'
import { LibraryPanel, ListKey } from '../libraryPanel/libraryPanel'
import { ProfilePanel } from '../profilePanel/profilePanel'
import { AudioPanel } from '../audioPanel/audioPanel'
import { VerifiedUserInfo } from '../../requestService/authRequestService'
import { UserInfo as RequestUserInfo, RequestHomeData, ResultStatus } from '../../requestService/requestService'
import {
	CardType,
	PersonalBeatObject,
	SampleCardObject,
	PublicBeatObject,
} from '../horizontalListPanel/horizontalListPanel'
import './homePanel.css'

let HomePanelMounted = false

/**
 * @param {{
 * customClass: String,
 * userInfo: VerifiedUserInfo,
 * setIsMakingNetworkActivity: (Boolean) => void
 * }} props
 */
const HomePanel = props => {
	const [audioPlaybackList, setAudioPlaybackList] = useState([])
	const [audioPlaybackListIndex, setAudioPlaybackListIndex] = useState(null)
	const [currentSelectedItemHash, setCurrentSelectedItemHash] = useState(null)
	const [hasDataBeenFetched, setHasDataBeenFetched] = useState(false)
	const [downloadedItems, setDownloadedItems] = useState({
		[ListKey.PersonalBeat]: [],
		[ListKey.PublicSample]: [],
		[ListKey.PublicBeat]: [],
	})

	// MARK: Audio Play

	/**
	 * @param {PersonalBeatObject | SampleCardObject | PublicBeatObject} item
	 * @param {Number} index
	 */
	const isPlayingItem = (item, index) => {
		return (
			currentSelectedItemHash != null &&
			currentSelectedItemHash != undefined &&
			currentSelectedItemHash == item.audioSource
		)
	}

	/**
	 * @param {PersonalBeatObject | SampleCardObject | PublicBeatObject} item
	 * @param {Number} index
	 * @param {CardType} type
	 */
	const shouldPlayItem = (item, index, type) => {
		createAudioPlaybackInputs(type, index)
	}

	const createAudioPlaybackInputs = (type, chosenIndex) => {
		let audioPlaybackList = []
		switch (type) {
			case CardType.PersonalBeat:
			case CardType.PublicBeat:
			case CardType.PublicSample:
				const searchKey =
					type == CardType.PersonalBeat
						? ListKey.PersonalBeat
						: type == CardType.PublicBeat
						? ListKey.PublicBeat
						: ListKey.PublicSample
				audioPlaybackList = downloadedItems[searchKey].map(item => {
					return {
						displayTitle: item.displayTitle,
						displayImage: item.displayImage,
						audioSourceURL: item.audioSource,
						audioType: type,
					}
				})
				break
			default:
				audioPlaybackList = []
		}
		setAudioPlaybackList(audioPlaybackList)
		setAudioPlaybackListIndex(chosenIndex)
	}

	const hasStartedPlayingItem = (item, index) => {
		setCurrentSelectedItemHash(item.audioSourceURL)
	}

	// MARK : Audio Stopped

	/**
	 * @param {PersonalBeatObject | SampleCardObject | PublicBeatObject} item
	 * @param {Number} index
	 * @param {CardType} type
	 */
	const shouldStopItem = (item, index, type) => {
		removeAudioPlaybackInputs()
	}

	const removeAudioPlaybackInputs = () => {
		setAudioPlaybackListIndex(null)
		setAudioPlaybackList([])
		setCurrentSelectedItemHash(null)
	}

	const hasStoppedPlayingItem = (item, index) => {
		removeAudioPlaybackInputs()
	}

	// MARK : Audio Pause

	const hasPausedPlayingItem = (item, index) => {
		setCurrentSelectedItemHash(null)
	}

	// MARK : Audio Next

	const shouldPlayNextItem = index => {
		const currentPlaybackList = audioPlaybackList
		index = index + 1 < audioPlaybackList.length ? index + 1 : 0
		if (currentPlaybackList.length <= 0 || currentPlaybackList != audioPlaybackList) {
			return
		}
		setAudioPlaybackList(currentPlaybackList)
		setAudioPlaybackListIndex(index)
	}

	// MARK : Audio Previous

	const shouldPlayPreviousItem = index => {
		const currentPlaybackList = audioPlaybackList
		index = index - 1 >= 0 ? index - 1 : currentPlaybackList.length - 1
		if (currentPlaybackList.length <= 0 || currentPlaybackList != audioPlaybackList) {
			return
		}
		setAudioPlaybackList(currentPlaybackList)
		setAudioPlaybackListIndex(index)
	}

	// MARK : Life Cycle

	useEffect(() => {
		HomePanelMounted = true
		if (!hasDataBeenFetched) {
			props.setIsMakingNetworkActivity(true)
			RequestHomeData(props.userInfo, (data, status) => {
				if (HomePanelMounted) {
					setDownloadedItems(data)
					setHasDataBeenFetched(true)
					props.setIsMakingNetworkActivity(false)
				}
			})
		}
		return function cleanup() {
			HomePanelMounted = false
		}
	})

	return (
		<div className={`HomePanel ${props.customClass}`}>
			<LibraryPanel
				customClass="MainSection"
				items={downloadedItems}
				isPlayingItem={isPlayingItem}
				shouldPlayItem={shouldPlayItem}
				shouldStopItem={shouldStopItem}
			></LibraryPanel>
			<ProfilePanel
				customClass="SideTopSection"
				userProfileName="Toph Beifong"
				userInfo={props.userInfo}
			></ProfilePanel>
			<div className="SideBottomSection"></div>
			<AudioPanel
				customClass="SideBottomSection"
				audioPlaylist={audioPlaybackList}
				audioPlaylistIndex={audioPlaybackListIndex}
				shouldPlayNextItem={shouldPlayNextItem}
				shouldPlayPreviousItem={shouldPlayPreviousItem}
				hasStartedPlayingItem={hasStartedPlayingItem}
				hasStoppedPlayingItem={hasStoppedPlayingItem}
				hasPausedPlayingItem={hasPausedPlayingItem}
			></AudioPanel>
		</div>
	)
}

export { HomePanel }
