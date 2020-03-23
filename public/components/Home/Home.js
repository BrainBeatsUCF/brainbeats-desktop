import React from 'react';
import HomeCards from './HomeCards';

import BeatButton from '../../images/beatButton.png';
import SampleButton from '../../images/sampleButton.png';
import ShareButton from '../../images/shareButton.png';

// Audio Buttons
import PlayButton from '../../images/playButton.png';
import PauseButton from '../../images/pauseButton.png';
import ForwardButton from '../../images/forwardButton.png';
import BackButton from '../../images/backButton.png';

import HomeTestData from './HomeTestData.json';
import './Home.css';

const DataListKey = {
  PublicSample: "publicSamples",
  PublicBeat: "publicBeats",
  MyBeat: "myBeats"
}

let ctx = null;
let audio = null;
let audioPlayer = null;

export default class Home extends HomeCards {
  constructor(props) {
    super(props);
    this.state = HomeTestData;
    ctx = new AudioContext();
  }

  componentWillUnmount() {
    ctx.close()
  }

  handleBackButton = () => {
    let audioControls = this.state.currentAudio;
    const previousIndex = audioControls.dataIndex - 1;
    switch(audioControls.dataListKey) {
      case DataListKey.PublicSample:
        this.handleSampleAudio(previousIndex);
        return;
      case DataListKey.MyBeat:
        this.handleMyBeatAudioClipSelected(previousIndex)
        return
      case DataListKey.PublicBeat:
        this.handlePublicBeatAudioClipSelected(previousIndex)
        return
      default:
        return
    }
  }

  handleForwardButton = () => {
    let audioControls = this.state.currentAudio;
    const nextIndex = audioControls.dataIndex + 1;
    switch(audioControls.dataListKey) {
      case DataListKey.PublicSample:
        this.handleSampleAudio(nextIndex);
        return;
      case DataListKey.MyBeat:
        this.handleMyBeatAudioClipSelected(nextIndex)
        return
      case DataListKey.PublicBeat:
        this.handlePublicBeatAudioClipSelected(nextIndex)
        return
      default:
        return
    }
  }

  handlePauseButton = () => {
    let currentAudio = this.state.currentAudio

    if(currentAudio.isPlaying) {
      if(audioPlayer != null) {
        audioPlayer.stop();
        audioPlayer.disconnect(ctx.destination);
      }
    }

    currentAudio.isPlaying = false
    this.setState(currentAudio);
    this.updatePausePublicBeatsIfNecessary();
  }

  handleResumeButton = () => {
    this.handlePauseButton();
    let currentAudio = this.state.currentAudio
    
    fetch('https://cors-anywhere.herokuapp.com/' + currentAudio.audio)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
      .then((decodeAudio) => {
        audio = decodeAudio;

        audioPlayer = ctx.createBufferSource();
        audioPlayer.buffer = audio;
        audioPlayer.connect(ctx.destination);
        audioPlayer.start(ctx.currentTime);
        audioPlayer.addEventListener('ended', () => {
          this.handlePauseButton();
        })

        currentAudio.isPlaying = true
        this.setState(currentAudio);
        this.updatePublicBeatsIfNecessary();
      });
  }

  updatePublicBeatsIfNecessary() {
    if(this.state.currentAudio.dataListKey != DataListKey.PublicBeat) {
      return;
    }

    if(this.state.publicBeats[this.state.currentAudio.dataIndex].isPlaying) {
      return;
    }

    let publicBeat = this.state.publicBeats[this.state.currentAudio.dataIndex];
    publicBeat.isPlaying = true;
    this.setState(publicBeat);
  }

  updatePausePublicBeatsIfNecessary() {
    if(this.state.currentAudio.dataListKey != DataListKey.PublicBeat) {
      return;
    }

    if(!this.state.publicBeats[this.state.currentAudio.dataIndex].isPlaying) {
      return;
    }

    let publicBeat = this.state.publicBeats[this.state.currentAudio.dataIndex];
    publicBeat.isPlaying = false;
    this.setState(publicBeat);
  }

  handlePublicBeatAudioClipSelected = (index) => {
    if(index < 0 || index >= this.state.publicBeats.length) return;
    let newPublicBeats = this.state.publicBeats;

    // Change play/pause button
    newPublicBeats.forEach((value, currIndex) => {
      if(currIndex != index) {
        newPublicBeats[currIndex].isPlaying = false
        return
      }

      newPublicBeats[currIndex].isPlaying = !newPublicBeats[currIndex].isPlaying;
    });
    this.setState({publicBeats: newPublicBeats})

    // continue if playing
    if(this.state.publicBeats[index].isPlaying) {
      // Send to audio players
      const beat = this.state.publicBeats[index];
      let currentAudio = this.state.currentAudio;
      currentAudio.dataIndex = index;
      currentAudio.dataListKey = DataListKey.PublicBeat;
      currentAudio.background = beat.backgroundImage;
      currentAudio.title = beat.title;
      currentAudio.owner = beat.owner;
      currentAudio.audio = beat.audio;
      this.setState(currentAudio);
      this.handleResumeButton();
    } else {
      this.handlePauseButton();
    }
  }

  handleMyBeatAudioClipSelected = (index) => {
    if(index < 0 || index >= this.state.myBeats.length) return;
    const beat = this.state.myBeats[index];
    let currentAudio = this.state.currentAudio;
    currentAudio.dataIndex = index;
    currentAudio.dataListKey = DataListKey.MyBeat;
    currentAudio.background = beat.backgroundImage;
    currentAudio.title = beat.title;
    currentAudio.owner = "Self";
    currentAudio.audio = beat.audio;
    this.setState(currentAudio);
    this.handleResumeButton();
  }

  handleSampleAudio = (index) => {
    if(index < 0 || index >= this.state.publicSamples.length) return;
    const sample = this.state.publicSamples[index];
    let currentAudio = this.state.currentAudio;
    currentAudio.dataIndex = index;
    currentAudio.dataListKey = DataListKey.PublicSample;
    currentAudio.background = sample.backgroundImage;
    currentAudio.title = "";
    currentAudio.owner = sample.owner;
    currentAudio.audio = sample.audio;
    this.setState(currentAudio);
    this.handleResumeButton();
  }

  renderHorizontalScrollSection(title, data, cardRenderer, playTarget, searchTarget) {
    const renderedCards = data.map((singleEntry, index) => {
      return cardRenderer(index, singleEntry, playTarget);
    })

    return (
      <div className="HomeHorizontalScrollSection">
        <div className="HomeHorizontalScrollMenu">
          <h4 className="HomeHorizontalScrollMenuTitle">{title}</h4>
          <input className="HomeHorizontalScrollSearchButton" type="text" placeholder="Search"></input>
        </div>
        <hr></hr>
        <div className="HomeHorizontalScrollCardContainer">
          {renderedCards}
          <h1 className="Spacer">some space</h1>
        </div>
      </div>
    );
  }

  renderMainContent() {
    return (
      <div className="HomeMainContentBackground">
        <div className="HomeMainContentOverlay"></div>
        <div className="HomeMainContent">
          {this.renderHorizontalScrollSection("My Beats", this.state.myBeats, this.renderMyBeatCard, this.handleMyBeatAudioClipSelected, null)}
          {this.renderHorizontalScrollSection("Public Samples", this.state.publicSamples, this.renderSampleCard, this.handleSampleAudio, null)}
          {this.renderHorizontalScrollSection("Public Beats", this.state.publicBeats, this.renderPublicBeatCard, this.handlePublicBeatAudioClipSelected, null)}
        </div>
      </div>
    );
  }

  renderStat = (image, title, value) => {
    return(
      <div className="StatisticBackground">
        <img src={image} className="StatisticImage"></img>
        <div className="StatisticValues">
          <h3>{title}</h3>
          <h3>{value}</h3>
        </div>
      </div>
    );
  }

  renderSideBar = () => {
    const audioControls = this.state.currentAudio.isPlaying
      ? (
        <div>
          <h6 className="AudioLabelTitle">{this.state.currentAudio.title}</h6>
          <h6 className="AudioLabelDesc">{this.state.currentAudio.owner}</h6>
          <div className="AudioPlayerControls">
            <img src={BackButton} className="AudioPlayerButton" onClick={() => this.handleBackButton()}></img>
            <img src={PauseButton} className="AudioPlayerButton" onClick={() => this.handlePauseButton()}></img>
            <img src={ForwardButton} className="AudioPlayerButton" onClick={() => this.handleForwardButton()}></img>
          </div>
        </div>
      )
      : (
        <div className="AudioPlayerControls">
          <img src={PlayButton} className="AudioPlayerButton" onClick={() => this.handleResumeButton()}></img>
        </div>
      );

    return (
      <div className="HomeSideBarBackground">
        <div className="UserAccountSection">
          <img src={this.state.userData.profileImage} className="UserAccountSectionImage"></img>
          <h3 className="UserAccountSectionLabel">{this.state.userData.username}</h3>
          {this.renderStat(BeatButton, "Beats", this.state.userData.beatCount)}
          {this.renderStat(SampleButton, "Samples", this.state.userData.sampleCount)}
          {this.renderStat(ShareButton, "Shares", this.state.userData.shareCount)}
        </div>
        <div className="AudioPlayerSection">
          <div className={`AudioPlayerImageContainer ${this.state.currentAudio.isPlaying ? "GlowingBorder" : ""}`}>
            <img src={this.state.currentAudio.background} className="AudioPlayerImage"></img>
          </div>
          {audioControls}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="HomeBackground">
        {this.renderMainContent()}
        {this.renderSideBar()}
      </div>
    );
  }
}