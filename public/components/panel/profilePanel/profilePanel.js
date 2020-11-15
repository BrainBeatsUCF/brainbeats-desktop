import React, { useState, useEffect } from 'react'
import { VerifiedUserInfo } from '../../requestService/authRequestService'
import { RequestUserProfileImage, RequestUserProfileInfo } from '../../requestService/requestService'
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
 * numberOfBeatsCreated: Number,
 * numberOfSamplesCreated: Number,
 * numberOfUserBeatsShared: Number,
 * numberOfUserSamplesShared: Number,
 * }} props
 */
const ProfilePanel = props => {
  const [userDisplayName, setUserDisplayName] = useState('')
  const [userGeneratedProfileImage, setUserGeneratedProfileImage] = useState(null)
  const [hasProfileBeenFetched, setHasProfileBeenFetched] = useState(false)

  useEffect(() => {
    RequestUserProfileInfo((firstName, lastName) => {
      setUserDisplayName(firstName + ' ' + lastName)
    })
    if (!hasProfileBeenFetched) {
      generateUserProfileImage()
    }
  }, [])

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
      <h3 className="UserAccountSectionLabel">{userDisplayName}</h3>
      {renderStatistic(BeatButton, ProfileStatisticTitle.Beats, props.numberOfBeatsCreated)}
      {renderStatistic(SampleButton, ProfileStatisticTitle.Samples, props.numberOfSamplesCreated)}
      {renderStatistic(
        ShareButton,
        ProfileStatisticTitle.Shares,
        props.numberOfUserBeatsShared + props.numberOfUserSamplesShared
      )}
    </div>
  )
}

export { ProfilePanel }
