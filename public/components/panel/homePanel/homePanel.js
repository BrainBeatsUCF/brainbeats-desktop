import React, { useState, useEffect } from 'react'
import { LibraryPanel, ListKey } from '../libraryPanel/libraryPanel'
import { ProfilePanel } from '../profilePanel/profilePanel'
import { AudioPanel } from '../audioPanel/audioPanel'
import { GetUserAuthInfo, VerifiedUserInfo } from '../../requestService/authRequestService'
import { RequestGetAllBeats, RequestGetAllSamples, RequestGetOwnedBeats } from '../../requestService/itemRequestService'
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
  const [personalBeats, setPersonalBeats] = useState([]) /// Type is PersonalBeatObject
  const [publicBeats, setPublicBeats] = useState([]) /// Type is PublicBeatObject
  const [publicSamples, setPublicSamples] = useState([]) /// Type is PublicSample

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
        const sourceList =
          type === CardType.PersonalBeat ? personalBeats : type === CardType.PublicBeat ? publicBeats : publicSamples
        audioPlaybackList = sourceList.map(item => {
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
    if (HomePanelMounted) {
      setAudioPlaybackList(audioPlaybackList)
      setAudioPlaybackListIndex(chosenIndex)
    }
  }

  const hasStartedPlayingItem = (item, index) => {
    if (HomePanelMounted) {
      setCurrentSelectedItemHash(item.audioSourceURL)
    }
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
    if (HomePanelMounted) {
      setAudioPlaybackListIndex(null)
      setAudioPlaybackList([])
      setCurrentSelectedItemHash(null)
    }
  }

  const hasStoppedPlayingItem = (item, index) => {
    removeAudioPlaybackInputs()
  }

  // MARK : Audio Pause

  const hasPausedPlayingItem = (item, index) => {
    if (HomePanelMounted) {
      setCurrentSelectedItemHash(null)
    }
  }

  // MARK : Audio Next

  const shouldPlayNextItem = index => {
    const currentPlaybackList = audioPlaybackList
    index = index + 1 < audioPlaybackList.length ? index + 1 : 0
    if (currentPlaybackList.length <= 0 || currentPlaybackList != audioPlaybackList) {
      return
    }
    if (HomePanelMounted) {
      setAudioPlaybackList(currentPlaybackList)
      setAudioPlaybackListIndex(index)
    }
  }

  // MARK : Audio Previous

  const shouldPlayPreviousItem = index => {
    const currentPlaybackList = audioPlaybackList
    index = index - 1 >= 0 ? index - 1 : currentPlaybackList.length - 1
    if (currentPlaybackList.length <= 0 || currentPlaybackList != audioPlaybackList) {
      return
    }
    if (HomePanelMounted) {
      setAudioPlaybackList(currentPlaybackList)
      setAudioPlaybackListIndex(index)
    }
  }

  // MARK : Life Cycle

  const fetchBeats = _ => {
    RequestGetOwnedBeats(
      GetUserAuthInfo(),
      beatObjects => {
        const myBeats = beatObjects.map(beatObject => {
          return {
            id: beatObject.beatID,
            displayImage: beatObject.image,
            displayTitle: beatObject.sampleTitle,
            audioSource: beatObject.savedAudio,
            displayTags: beatObject.sampleSubtitle.split(',').map(value => value.trim()),
          }
        })
        if (HomePanelMounted) {
          setPersonalBeats(myBeats)
        }
        let myBeatIds = new Set()
        myBeats.forEach(beatObject => myBeatIds.add(beatObject.id))
        fetchAllBeats(myBeatIds)
      },
      _ => {}
    )
  }

  /**
   * @param {Number} duration
   */
  const getFormattedString = durationValue => {
    const minutes = Math.floor(durationValue / 60)
    const seconds = durationValue % 60
    let durationString = ''
    if (minutes > 0 && seconds == 0) {
      durationString = `${minutes} min${minutes > 0 ? 's' : ''}`
    } else if (minutes > 0 && seconds > 0) {
      durationString = `${minutes} mins${minutes > 0 ? 's' : ''}, ${seconds} sec${seconds > 0 ? 's' : ''}`
    } else if (minutes == 0 && seconds > 0) {
      durationString = `${seconds} sec${seconds > 0 ? 's' : ''}`
    } else {
      durationString = `0 sec`
    }
    return durationString
  }

  /**
   * @param {Set} myBeatIds
   */
  const fetchAllBeats = myBeatIds => {
    RequestGetAllBeats(
      GetUserAuthInfo(),
      beatObjects => {
        const publicBeats = beatObjects
          .filter(beatObject => !myBeatIds.has(beatObject.beatID))
          .map(beatObject => {
            return {
              id: beatObject.beatID,
              displayOwner: 'Username not available',
              displayImage: beatObject.image,
              displayTitle: beatObject.sampleTitle,
              audioSource: beatObject.savedAudio,
              sampleCount: beatObject.sampleSubtitle.split(',').length,
              ownerProfileImage: '',
              formattedPlayTime: getFormattedString(parseInt(beatObject.duration)),
            }
          })
        if (HomePanelMounted) {
          setPublicBeats(publicBeats)
        }
      },
      _ => {}
    )
  }

  const fetchSamples = _ => {
    RequestGetAllSamples(
      GetUserAuthInfo(),
      sampleObjects => {
        const availableSamples = sampleObjects
          .filter(sample => sample.sampleID != undefined && sample.sampleID != null && sample.sampleID !== '')
          .map(sample => {
            return {
              id: sample.sampleID,
              displayImage: sample.sampleImage,
              displayTitle: sample.sampleTitle,
              displayOwner: 'Username not available',
              audioSource: sample.sampleSource,
              className: '',
            }
          })
        if (HomePanelMounted) {
          setPublicSamples(availableSamples)
        }
      },
      _ => {}
    )
  }

  useEffect(() => {
    HomePanelMounted = true
    fetchBeats()
    fetchSamples()
    return function cleanup() {
      HomePanelMounted = false
    }
  }, [])

  return (
    <div className={`HomePanel ${props.customClass}`}>
      <LibraryPanel
        customClass="MainSection"
        items={{
          PersonalBeatListKey: personalBeats,
          PublicBeatListKey: publicBeats,
          PublicSampleListKey: publicSamples,
        }}
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
