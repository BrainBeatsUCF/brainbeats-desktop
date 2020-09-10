import React, { useState } from 'react'
import AudioPlayer from 'react-h5-audio-player'
import PlayButton from '../../../images/playButton.png'
import PauseButton from '../../../images/pauseButton.png'
import ForwardButton from '../../../images/forwardButton.png'
import BackButton from '../../../images/backButton.png'
import 'react-h5-audio-player/lib/styles.css'
import './audioPanel.css'

const NO_HEADER_TITLE = ' '
const AUDIO_BUTTON_HEIGHT = '30px'
const AUDIO_BUTTON_WIDTH = '30px'
const MAXIMUM_AUDIO_HEADER_LENGTH = 20
const NO_IMAGE_REPLACEMENT_COLOR = '#faebd7'

const AudioPlaybackInfo = {
	displayTitle: '',
	displayImage: '',
	audioSourceURL: '',
	audioType: '',
}

/**
 * @param {{
 * customClass: String?,
 * audioPlaylistIndex: Number?,
 * audioPlaylist: [AudioPlaybackInfo],
 * shouldPlayNextItem: (index: Number) => void,
 * shouldPlayPreviousItem: (index: Number) => void,
 * hasStoppedPlayingItem: (item: AudioPlaybackInfo, index: Number) => void,
 * hasPausedPlayingItem: (item: AudioPlaybackInfo, index: Number) => void,
 * hasStartedPlayingItem: (item: AudioPlaybackInfo, index: Number) => void
 * }} props
 */
const AudioPanel = props => {
	const customClass = props.customClass ?? ''
	const [isAudioPlayerInSession, setIsAudioPlayerInSession] = useState(false)
	const [headerTitle, setHeaderTitle] = useState(NO_HEADER_TITLE)

	const audioPlayerOnPlay = () => {
		setIsAudioPlayerInSession(true)
		setHeaderTitleOnPlay()
		props.hasStartedPlayingItem({ audioSourceURL: audioPlaybackSource() }, props.audioPlaylistIndex)
	}

	const audioPlayerOnEnd = () => {
		props.hasStoppedPlayingItem({ audioSourceURL: audioPlaybackSource() }, props.audioPlaylistIndex)
		setHeaderTitle(NO_HEADER_TITLE)
		setIsAudioPlayerInSession(false)
	}

	const audioPlayerOnPause = () => {
		props.hasPausedPlayingItem({ audioSourceURL: audioPlaybackSource() }, props.audioPlaylistIndex)
		setIsAudioPlayerInSession(false)
	}

	const audioPlayerOnNext = () => {
		const { audioPlaylistIndex } = props
		props.shouldPlayNextItem(audioPlaylistIndex)
	}

	const audioPlayerOnPrevious = () => {
		const { audioPlaylistIndex } = props
		props.shouldPlayPreviousItem(audioPlaylistIndex)
	}

	const audioPlaybackSource = () => {
		const { audioPlaylist, audioPlaylistIndex } = props
		if (audioPlaylistIndex == null || audioPlaylistIndex == undefined) {
			return ''
		}
		if (audioPlaylistIndex >= audioPlaylist.length || audioPlaylistIndex < 0) {
			return ''
		}
		return audioPlaylist[audioPlaylistIndex].audioSourceURL
	}

	const setHeaderTitleOnPlay = () => {
		const { audioPlaylist, audioPlaylistIndex } = props
		if (
			audioPlaylistIndex == null ||
			audioPlaylistIndex == undefined ||
			audioPlaylistIndex >= audioPlaylist.length ||
			audioPlaylistIndex < 0
		) {
			return
		}
		const givenHeader = audioPlaylist[audioPlaylistIndex].displayTitle
		const truncatedHeader =
			givenHeader.length >= MAXIMUM_AUDIO_HEADER_LENGTH
				? givenHeader.substring(0, MAXIMUM_AUDIO_HEADER_LENGTH) + '...'
				: givenHeader
		setHeaderTitle(truncatedHeader)
	}

	const audioPlaybackImage = () => {
		const { audioPlaylist, audioPlaylistIndex } = props
		const audioPlaybackImageClasses = 'AudioPlayerImage'
		const noBackgroundStyle = { backgroundColor: NO_IMAGE_REPLACEMENT_COLOR }
		const emptyImage = <div src="" className={audioPlaybackImageClasses} style={noBackgroundStyle}></div>
		if (audioPlaylistIndex == null || audioPlaylistIndex == undefined) {
			return emptyImage
		}
		if (audioPlaylistIndex >= audioPlaylist.length || audioPlaylistIndex < 0) {
			return emptyImage
		}
		const audioPlaybackImageSource = audioPlaylist[audioPlaylistIndex].displayImage
		if (audioPlaybackImageSource == null || audioPlaybackImageSource == undefined) {
			return emptyImage
		}
		return <img src={audioPlaybackImageSource} className={audioPlaybackImageClasses}></img>
	}

	return (
		<div className={`AudioPlayerSection ${customClass}`}>
			<div className={`AudioPlayerImageContainer ${isAudioPlayerInSession ? 'GlowingBorder' : ''}`}>
				{audioPlaybackImage()}
			</div>
			<AudioPlayer
				header={headerTitle}
				src={audioPlaybackSource()}
				showSkipControls={true}
				showJumpControls={false}
				customVolumeControls={[]}
				customAdditionalControls={[]}
				autoPlayAfterSrcChange={true}
				onPlay={audioPlayerOnPlay}
				onPause={audioPlayerOnPause}
				onEnded={audioPlayerOnEnd}
				onClickNext={audioPlayerOnNext}
				onClickPrevious={audioPlayerOnPrevious}
				customIcons={{
					play: <img src={PlayButton} height={AUDIO_BUTTON_HEIGHT} width={AUDIO_BUTTON_WIDTH}></img>,
					pause: <img src={PauseButton} height={AUDIO_BUTTON_HEIGHT} width={AUDIO_BUTTON_WIDTH}></img>,
					next: <img src={ForwardButton} height={AUDIO_BUTTON_HEIGHT} width={AUDIO_BUTTON_WIDTH}></img>,
					previous: <img src={BackButton} height={AUDIO_BUTTON_HEIGHT} width={AUDIO_BUTTON_WIDTH}></img>,
				}}
			/>
		</div>
	)
}

export { AudioPanel, AudioPlaybackInfo }
