import React, { useState, useEffect } from 'react'
import { LibraryPanel, ListKey } from '../libraryPanel/libraryPanel'
import { ProfilePanel } from '../profilePanel/profilePanel'
import { AudioPanel } from '../audioPanel/audioPanel'
import { GridBeatObject } from '../workstationPanel/gridObjects'
import { GetUserAuthInfo, VerifiedUserInfo } from '../../requestService/authRequestService'
import {
  RequestGetLikedBeats,
  RequestLikeUnlikeBeat,
  RequestGetAllBeats,
  RequestGetAllSamples,
  RequestGetOwnedBeats,
  RequestGetRecommendedBeats,
  RequestGetOwnedSamples,
} from '../../requestService/itemRequestService'
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
  const [likedBeatIDs, setLikedBeatIDs] = useState(new Set())
  const [personalBeats, setPersonalBeats] = useState([]) /// Type is PersonalBeatObject
  const [publicBeats, setPublicBeats] = useState([]) /// Type is PublicBeatObject
  const [publicSamples, setPublicSamples] = useState([]) /// Type is PublicSample
  const [recommendedBeats, setRecommendedBeats] = useState([]) /// Type is PublicBeatObject
  const [numberOfUserBeats, setNumberOfUserBeats] = useState(0)
  const [numberOfUserSamples, setNumberOfUserSamples] = useState(0)
  const [numberOfBeatsShared, setNumberOfBeatsShared] = useState(0)
  const [numberOfSamplesShared, setNumberOfSamplesShared] = useState(0)

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
      case CardType.RecommendedBeat:
        const sourceList =
          type === CardType.PersonalBeat
            ? personalBeats
            : type === CardType.PublicBeat
            ? publicBeats
            : type === CardType.RecommendedBeat
            ? recommendedBeats
            : publicSamples
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

  // MARK : Network Calls

  /// We fetch personal beats before making other calls to prevent having multiple failed requests
  /// due to congestion. This order also prevents multiple attempts to refresh an expired
  /// user token
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
          setNumberOfUserBeats(beatObjects.length)
          setNumberOfBeatsShared(beatObjects.filter(beat => beat.isPrivate === false).length)
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
      durationString = `${minutes} min${minutes > 1 ? 's' : ''}`
    } else if (minutes > 0 && seconds > 0) {
      durationString = `${minutes} min${minutes > 1 ? 's' : ''}, ${seconds} sec${seconds > 1 ? 's' : ''}`
    } else if (minutes == 0 && seconds > 0) {
      durationString = `${seconds} sec${seconds > 1 ? 's' : ''}`
    } else {
      durationString = `0 sec`
    }
    return durationString
  }

  /**
   * @param {GridBeatObject} beatObject
   * @return {PublicBeatObject}
   */
  const getPublicBeatObject = beatObject => {
    return {
      id: beatObject.beatID,
      displayOwner: beatObject.ownerName,
      displayImage: beatObject.image,
      displayTitle: beatObject.sampleTitle,
      audioSource: beatObject.savedAudio,
      sampleCount: beatObject.sampleSubtitle.split(',').length,
      ownerProfileImage: '',
      formattedPlayTime: getFormattedString(parseInt(beatObject.duration)),
    }
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
          .map(beatObject => getPublicBeatObject(beatObject))
        if (HomePanelMounted) {
          setPublicBeats(publicBeats)
        }
      },
      _ => {}
    )
  }

  const fetchRecommendedBeats = _ => {
    RequestGetRecommendedBeats(
      GetUserAuthInfo(),
      beatObjects => {
        const availableBeats = beatObjects.map(beatObject => getPublicBeatObject(beatObject))
        if (HomePanelMounted) {
          setRecommendedBeats(availableBeats)
        }
      },
      () => {}
    )
  }

  const fetchLikedBeatIDs = _ => {
    RequestGetLikedBeats(
      GetUserAuthInfo(),
      likedBeatIDs => {
        if (HomePanelMounted) {
          setLikedBeatIDs(likedBeatIDs)
        }
      },
      false
    )
  }

  const fetchSamples = _ => {
    RequestGetAllSamples(
      GetUserAuthInfo(),
      sampleObjects => {
        const availableSamples = sampleObjects
          .filter(
            sample =>
              sample.sampleID != undefined &&
              sample.sampleID != null &&
              sample.sampleID !== '' &&
              sample.isPrivate != undefined &&
              sample.isPrivate != null &&
              sample.isPrivate === false
          )
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
          fetchOwnedSamples()
        }
      },
      _ => {}
    )
  }

  const fetchOwnedSamples = _ => {
    RequestGetOwnedSamples(
      GetUserAuthInfo(),
      sampleObjects => {
        const myPublicSamples = sampleObjects.filter(sample => sample.isPrivate === false)
        if (HomePanelMounted) {
          setNumberOfUserSamples(sampleObjects.length)
          setNumberOfSamplesShared(myPublicSamples.length)
        }
      },
      _ => {}
    )
  }

  const toggleLike = (isLiked, beatId) => {
    RequestLikeUnlikeBeat(
      GetUserAuthInfo(),
      beatId,
      isLiked,
      () => {
        let newLikedBeatIDs = new Set(likedBeatIDs)
        if (isLiked) {
          newLikedBeatIDs.add(beatId)
        } else {
          newLikedBeatIDs.delete(beatId)
        }
        setLikedBeatIDs(newLikedBeatIDs)
      },
      false
    )
  }

  // MARK : Life Cycle

  useEffect(() => {
    HomePanelMounted = true
    fetchBeats()
    fetchLikedBeatIDs()
    fetchSamples()
    fetchRecommendedBeats()
    return function cleanup() {
      HomePanelMounted = false
    }
  }, [])

  return (
    <div className={`HomePanel ${props.customClass}`}>
      <LibraryPanel
        customClass="MainSection"
        likedIds={likedBeatIDs}
        items={{
          PersonalBeatListKey: personalBeats,
          PublicBeatListKey: publicBeats,
          PublicSampleListKey: publicSamples,
          RecommendedBeatListKey: recommendedBeats,
        }}
        isPlayingItem={isPlayingItem}
        shouldPlayItem={shouldPlayItem}
        shouldStopItem={shouldStopItem}
        shouldToggleLike={toggleLike}
      ></LibraryPanel>
      <ProfilePanel
        customClass="SideTopSection"
        userProfileName="Toph Beifong"
        userInfo={props.userInfo}
        numberOfBeatsCreated={numberOfUserBeats}
        numberOfSamplesCreated={numberOfUserSamples}
        numberOfUserBeatsShared={numberOfBeatsShared}
        numberOfUserSamplesShared={numberOfSamplesShared}
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
