import "./Navigation.css";

import React from "react";

import HomeImage from "../../images/HomeImage.png";
import LogoutImage from "../../images/LogoutImage.png";
import StudioImage from "../../images/StudioImage.png";

export default class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isDisplayingHomePage: props.isDisplayingHomePage };
  }

  renderButton(title, src, height, width, target, isActive, isLogout) {
    return (
      <div
        className={`NavigationInput ${
          isActive ? "NavigationInputActive" : ""
        } ${isLogout ? "NavigationLogoutInput" : ""}`}
        onClick={target}
      >
        <label>{title}</label>
        <img src={src} alt={title} height={height} width={width}></img>
      </div>
    );
  }

  handleSwitchToHome() {
    this.setState({ isDisplayingHomePage: true });
    this.props.handleHomeButtonTapped();
  }

  handleSwitchToStudio() {
    this.setState({ isDisplayingHomePage: false });
    this.props.handleStudioButtonTapped();
  }

  handleLogout() {
    this.props.handleLogoutUser();
  }

  render() {
    return (
      <div className="NavigationBackground">
        <div className="NavigationBackgroundLeft">
          {this.renderButton(
            "Home",
            HomeImage,
            18,
            22,
            () => this.handleSwitchToHome(),
            this.state.isDisplayingHomePage,
            false
          )}
          {this.renderButton(
            "Studio",
            StudioImage,
            18,
            22,
            () => this.handleSwitchToStudio(),
            !this.state.isDisplayingHomePage,
            false
          )}
        </div>
        {this.renderButton(
          "Logout",
          LogoutImage,
          18,
          19,
          () => this.handleLogout(),
          false,
          true
        )}
      </div>
    );
  }
}
