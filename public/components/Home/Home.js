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

import './Home.css';

const DataListKey = {
  PublicSample: "publicSamples",
  PublicBeat: "publicBeats",
  MyBeat: "myBeats"
}

export default class Home extends HomeCards {
  constructor(props) {
    super(props);
    this.state = {
      currentAudio: {
        isPlaying: false,
        dataListKey: "",
        dataIndex: 0,
        background: "https://www.positive.news/wp-content/uploads/2019/03/feat-1800x0-c-center.jpg",
        title: "Some Popular Beat",
        owner: "Mr.beatsguy"
      },
      userData: {
        profileImage: "https://www.attractivepartners.co.uk/wp-content/uploads/2017/06/profile.jpg",
        username: "Toph Beifong",
        beatCount: 16,
        sampleCount: 106,
        shareCount: 213
      },
      publicSamples: [
        {
          owner: "Mr.beatsguy",
          backgroundImage: "https://previews.123rf.com/images/drawkman/drawkman1804/drawkman180400012/99517388-cartoon-vector-illustration-of-acoustic-guitar-or-ukulele-cartoon-clip-art-musical-instrument-icon-.jpg"
        },
        {
          owner: "McFacington Long Namington",
          backgroundImage: "https://paintingvalley.com/drawings/sax-drawing-13.jpg"
        },
        {
          owner: "Shorty",
          backgroundImage: "https://image.shutterstock.com/image-vector/electronic-musical-keyboard-cartoon-vector-260nw-243210448.jpg"
        }
      ],
      publicBeats: [
        {
          backgroundImage: "https://www.positive.news/wp-content/uploads/2019/03/feat-1800x0-c-center.jpg",
          profileImage: "https://image.shutterstock.com/image-photo/portrait-smiling-red-haired-millennial-260nw-1194497251.jpg",
          title: "Some Popular Beat",
          owner: "Mr.beatsguy",
          isPlaying: false,
          sampleCount: 11,
          playTime: "1 min 22 secs"
        },
        {
          backgroundImage: "https://www.positive.news/wp-content/uploads/2019/03/feat-1800x0-c-center.jpg",
          profileImage: "https://image.shutterstock.com/image-photo/portrait-smiling-red-haired-millennial-260nw-1194497251.jpg",
          title: "Basic Beat",
          owner: "Other Mr.beatsguy",
          isPlaying: false,
          sampleCount: 8,
          playTime: "2 min 22 secs"
        }
      ],
      myBeats: [
        {
          backgroundImage: "https://www.positive.news/wp-content/uploads/2019/03/feat-1800x0-c-center.jpg",
          title: "First Mix",
          tags: ["Clap", "Saxophone", "Heavy Guitar", "Drums", "Snare"]
        },
        {
          backgroundImage: "https://www.positive.news/wp-content/uploads/2019/03/feat-1800x0-c-center.jpg",
          title: "Vibing, Not a Phone in Sight",
          tags: ["Clap", "Saxophone", "Heavy Guitar", "Drums", "Snare", "Heavy Guitar", "Drums"]
        },
        {
          backgroundImage: "https://www.positive.news/wp-content/uploads/2019/03/feat-1800x0-c-center.jpg",
          title: "Phone in Sight",
          tags: ["Clap", "Drums", "Snare"]
        },
        {
          backgroundImage: "https://www.positive.news/wp-content/uploads/2019/03/feat-1800x0-c-center.jpg",
          title: "Sight",
          tags: ["Clap", "Saxophone", "Drums", "Snare"]
        }
      ]
    }
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
    currentAudio.isPlaying = false
    this.setState(currentAudio);
  }

  handleResumeButton = () => {
    let currentAudio = this.state.currentAudio
    currentAudio.isPlaying = true
    this.setState(currentAudio);
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

    // Send to audio players
    const beat = this.state.publicBeats[index];
    let currentAudio = this.state.currentAudio;
    currentAudio.dataIndex = index;
    currentAudio.dataListKey = DataListKey.PublicBeat;
    currentAudio.background = beat.backgroundImage;
    currentAudio.title = beat.title;
    currentAudio.owner = beat.owner;
    this.setState(currentAudio);
    this.handleResumeButton();
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