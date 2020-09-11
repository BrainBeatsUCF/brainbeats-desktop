import React from 'react'
import HomeImage from '../../images/HomeImage.png'
import LogoutImage from '../../images/LogoutImage.png'
import StudioImage from '../../images/StudioImage.png'
import NetworkActivityAnimation from '../../images/network_activity.gif'
import { MenuButton, MenuButtonColor, MenuButtonSelectionState } from '../input/input'
import './navigation.css'

const NavigationPage = {
  Home: 'home',
  Studio: 'studio',
  Logout: 'logout',
}

/**
 * @param {{
 * customClass: String
 * currentPage: NavigationPage,
 * isMakingNetworkActivity: Boolean,
 * onPageChange: (navigationPage: NavigationPage) => void
 * }} props
 */
const Navigation = props => {
  const shouldShowNetworkIndicator = {
    display: props.isMakingNetworkActivity ?? false ? '' : 'none',
  }

  return (
    <div className={`Navigation ${props.customClass}`}>
      <MenuButton
        props={{
          color: MenuButtonColor.Blue,
          selectionState:
            props.currentPage == NavigationPage.Home
              ? MenuButtonSelectionState.Active
              : MenuButtonSelectionState.Inactive,
          customClass: 'NavigationButton1',
          title: 'Home',
          imageSource: HomeImage,
          imageHeight: '18px',
          imageWidth: '22px',
          onMenuButtonClick: () => props.onPageChange(NavigationPage.Home),
        }}
      ></MenuButton>
      <MenuButton
        props={{
          color: MenuButtonColor.Blue,
          selectionState:
            props.currentPage == NavigationPage.Studio
              ? MenuButtonSelectionState.Active
              : MenuButtonSelectionState.Inactive,
          customClass: 'NavigationButton2',
          title: 'Studio',
          imageSource: StudioImage,
          imageHeight: '18px',
          imageWidth: '22px',
          onMenuButtonClick: () => props.onPageChange(NavigationPage.Studio),
        }}
      ></MenuButton>
      <div className="NavigationButton3 NetworkActivityContainer" style={shouldShowNetworkIndicator}>
        <img src={NetworkActivityAnimation} height="20px" width="20px"></img>
      </div>
      <MenuButton
        props={{
          color: MenuButtonColor.Red,
          selectionState: MenuButtonSelectionState.Inactive,
          customClass: 'NavigationButton4',
          title: 'Logout',
          imageSource: LogoutImage,
          imageHeight: '18px',
          imageWidth: '19px',
          onMenuButtonClick: () => props.onPageChange(NavigationPage.Logout),
        }}
      ></MenuButton>
    </div>
  )
}

export { Navigation, NavigationPage }
