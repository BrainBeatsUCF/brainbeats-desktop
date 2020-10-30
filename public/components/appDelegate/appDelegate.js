import React, { useState, useEffect } from 'react'
import { Navigation, NavigationPage } from '../navigation/navigation'
import { VerifiedUserInfo } from '../requestService/authRequestService'
import { HomePanel } from '../panel/homePanel/homePanel'
import { StudioPanel } from '../panel/studioPanel/studioPanel'
import { GridBeatObject } from '../panel/workstationPanel/gridObjects'
import './appDelegate.css'

let DefaultGridObject = GridBeatObject
DefaultGridObject.samples = []

/**
 * @param {{
 * onLogoutClick: () => void,
 * userInfo: VerifiedUserInfo,
 * }} props
 */
const AppDelegate = props => {
  const [navigationPage, setNavigationPage] = useState(NavigationPage.Studio)
  const [isMakingNetworkActivity, setIsMakingNetworkActivity] = useState(false)
  const [currentGridItem, setCurrentGridItem] = useState(DefaultGridObject)

  const handleLogout = () => {
    if (navigationPage == NavigationPage.Logout) {
      props.onLogoutClick()
    }
  }

  const handlePanelSelection = () => {
    switch (navigationPage) {
      case NavigationPage.Home:
        return (
          <HomePanel
            customClass="AppBody"
            userInfo={props.userInfo}
            setIsMakingNetworkActivity={setIsMakingNetworkActivity}
          ></HomePanel>
        )
      case NavigationPage.Studio:
        return (
          <StudioPanel
            customClass="AppBody"
            currentGridItem={currentGridItem}
            setIsMakingNetworkActivity={setIsMakingNetworkActivity}
            setCurrentGridItem={setCurrentGridItem}
          ></StudioPanel>
        )
      default:
        return <div></div>
    }
  }

  useEffect(() => {
    handleLogout()
  })

  return (
    <div className="AppDelegate">
      <Navigation
        customClass="AppHeader"
        currentPage={navigationPage}
        isMakingNetworkActivity={isMakingNetworkActivity}
        onPageChange={setNavigationPage}
      ></Navigation>
      {handlePanelSelection()}
    </div>
  )
}

export { AppDelegate }
