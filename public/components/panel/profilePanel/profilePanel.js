import React, { useState, useEffect } from 'react'
import { VerifiedUserInfo } from '../../requestService/authRequestService'
import { RequestUserProfileImage } from '../../requestService/requestService'
import BeatButton from '../../../images/beatButton.png'
import SampleButton from '../../../images/sampleButton.png'
import ShareButton from '../../../images/shareButton.png'
import './profilePanel.css'

const ProfileStatisticTitle = {
  Beats: 'Beats',
  Samples: 'Samples',
  Shares: 'Shares',
}

/**
 * @param {{
 * customClass: String
 * userProfileName: String,
 * userInfo: VerifiedUserInfo,
 * }} props
 */
const ProfilePanel = props => {
  const [numberOfBeatsCreated, setNumberOfBeatsCreated] = useState(0)
  const [numberOfSamplesCreated, setNumberOfSamplesCreated] = useState(0)
  const [numberOfUserBeatsShared, setNumberOfUserBeatsShared] = useState(0)
  const [userGeneratedProfileImage, setUserGeneratedProfileImage] = useState(null)
  const [hasProfileBeenFetched, setHasProfileBeenFetched] = useState(false)

  useEffect(() => {
    if (!hasProfileBeenFetched) {
      generateUserProfileImage()
    }
  })

  const generateUserProfileImage = () => {
    setUserGeneratedProfileImage(RequestUserProfileImage(props.userInfo))
    setHasProfileBeenFetched(true)
  }

  const getGeneratedUserProfileImage = () => {
    if (userGeneratedProfileImage == null || userGeneratedProfileImage == undefined) {
      const hiddenImageStyle = { display: 'none' }
      return <img style={hiddenImageStyle}></img>
    }
    return <img src={userGeneratedProfileImage} className="UserAccountSectionImage"></img>
  }

  const renderStatistic = (image, title, value) => {
    return (
      <div className="StatisticBackground">
        <img src={image} className="StatisticImage"></img>
        <div className="StatisticValues">
          <h3 className="StatisticValue">{title}</h3>
          <h3 className="StatisticValue">{value}</h3>
        </div>
      </div>
    )
  }

  return (
    <div className={`${props.customClass} UserAccountSection`}>
      {getGeneratedUserProfileImage()}
      <h3 className="UserAccountSectionLabel">{props.userProfileName}</h3>
      {renderStatistic(BeatButton, ProfileStatisticTitle.Beats, numberOfBeatsCreated)}
      {renderStatistic(SampleButton, ProfileStatisticTitle.Samples, numberOfSamplesCreated)}
      {renderStatistic(ShareButton, ProfileStatisticTitle.Shares, numberOfUserBeatsShared)}
    </div>
  )
}

export { ProfilePanel }
