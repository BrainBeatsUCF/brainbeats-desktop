import React from 'react'
import {
  CardType,
  ListTitle,
  ListKey,
  HorizontalListPanel,
  PersonalBeatObject,
  PublicBeatObject,
  SampleCardObject,
} from '../horizontalListPanel/horizontalListPanel'
import './libraryPanel.css'

/**
 * @param {{
 * customClass: String
 * items: {ListKey: [PersonalBeatObject | PublicBeatObject | SampleCardObject]}
 * isPlayingItem: (item: any, index: Number) => boolean,
 * shouldPlayItem: (item: any, index: Number, type: CardType) => void,
 * shouldStopItem: (item: any, index: Number, type: CardType) => void,
 * }} props
 */
const LibraryPanel = props => {
  const personalBeatHorizontalList = _ => {
    if (props.items[ListKey.PersonalBeat].length == 0) {
      return <></>
    }
    return (
      <HorizontalListPanel
        key={ListKey.PersonalBeat}
        items={props.items[ListKey.PersonalBeat]}
        title={ListTitle.PersonalBeat}
        itemType={CardType.PersonalBeat}
        isPlayingItem={props.isPlayingItem}
        shouldPlayItem={props.shouldPlayItem}
        shouldStopItem={props.shouldStopItem}
      ></HorizontalListPanel>
    )
  }

  const publicSampleHorizontalList = _ => {
    if (props.items[ListKey.PublicSample].length == 0) {
      return <></>
    }
    return (
      <HorizontalListPanel
        key={ListKey.PublicSample}
        items={props.items[ListKey.PublicSample]}
        title={ListTitle.PublicSample}
        itemType={CardType.PublicSample}
        isPlayingItem={props.isPlayingItem}
        shouldPlayItem={props.shouldPlayItem}
        shouldStopItem={props.shouldStopItem}
      ></HorizontalListPanel>
    )
  }

  const recommendedBeatHorizontalList = _ => {
    if (props.items[ListKey.RecommendedBeats].length == 0) {
      return <></>
    }
    return (
      <HorizontalListPanel
        key={ListKey.RecommendedBeats}
        items={props.items[ListKey.RecommendedBeats]}
        title={ListTitle.RecommendedBeats}
        itemType={CardType.PublicBeat}
        isPlayingItem={props.isPlayingItem}
        shouldPlayItem={props.shouldPlayItem}
        shouldStopItem={props.shouldStopItem}
      ></HorizontalListPanel>
    )
  }

  const publicBeatHorizontalList = _ => {
    if (props.items[ListKey.PublicBeat].length == 0) {
      return <></>
    }
    return (
      <HorizontalListPanel
        key={ListKey.PublicBeat}
        customClass="ListBottomPaddingInjection"
        items={props.items[ListKey.PublicBeat]}
        title={ListTitle.PublicBeat}
        itemType={CardType.PublicBeat}
        isPlayingItem={props.isPlayingItem}
        shouldPlayItem={props.shouldPlayItem}
        shouldStopItem={props.shouldStopItem}
      ></HorizontalListPanel>
    )
  }

  return (
    <div className={`LibraryPanel ${props.customClass}`}>
      <div className="LibraryPanelSection">
        {personalBeatHorizontalList()}
        {recommendedBeatHorizontalList()}
        {publicSampleHorizontalList()}
        {publicBeatHorizontalList()}
      </div>
      <div className="LibraryPanelOverlaySection"></div>
    </div>
  )
}

export { CardType, ListKey, PersonalBeatObject, PublicBeatObject, SampleCardObject, LibraryPanel }
