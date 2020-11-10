import React from 'react'
import './personalBeatCard.css'

const PersonalBeatObject = {
  id: '',
  displayImage: '',
  displayTitle: '',
  audioSource: '',
  displayTags: [''],
}

/**
 * @param {{
 * customClass: String,
 * index: Number,
 * item: PersonalBeatObject,
 * displayTagLimit: Number,
 * onClick: (item: PersonalBeatObject, index: Number?) => void
 * }} props
 */
const PersonalBeatCard = props => {
  const overrideClassName = props.customClass ?? ''
  const { displayImage, displayTitle } = props.item
  const tagLength = props.displayTagLimit ?? props.item.displayTags.length
  const displayedTags = props.item.displayTags.slice(0, tagLength).map((tagValue, tagIndex) => {
    return (
      <h5 key={tagValue + tagIndex} className="BeatsCardTag">
        {tagValue}
      </h5>
    )
  })

  const displayedTagsContainer =
    props.item.displayTags.length > 0 && props.item.displayTags[0].length > 0 ? (
      <div className="BeatsCardTagContainer">{displayedTags}</div>
    ) : (
      <></>
    )

  const backgroundStyle = {
    backgroundImage: `url(${displayImage})`,
  }

  return (
    <div
      key={displayTitle + props.index}
      className={`BeatsContainer ${overrideClassName}`}
      style={backgroundStyle}
      onClick={() => props.onClick(props.item, props.index)}
    >
      {displayedTagsContainer}
      <div className="BeatsCardContainerOverlay">
        <h4 className="BeatsCardDisplayTitle">{displayTitle}</h4>
      </div>
    </div>
  )
}

export { PersonalBeatObject, PersonalBeatCard }
