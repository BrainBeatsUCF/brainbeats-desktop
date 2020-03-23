import React from 'react';

import playButton from '../../images/playButton.png';
import pauseButton from '../../images/pauseButton.png';

import './HomeCards.css';

export default class HomeCards extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: {},
      publicSamples: [],
      publicBeats: [],
      myBeats: []
    }
  }

  renderSampleCard = (index, publicSample, playTarget) => {
    return (
      <div key={publicSample.owner + index} className="SampleCardContainer" onClick={() => playTarget(index)}>
        <div className="SampleCardBackgroundImage">
          <img src={publicSample.backgroundImage} height="100%" width="100%" className="SampleCardBackgroundImage"></img>
          <div className="SampleCardOverlay"></div>
        </div>
        <h5 className="SampleCardLabel">{publicSample.owner}</h5>
      </div>
    );
  }

  renderMyBeatCard = (index, myBeatObject, playTarget) => {
    let displayedTags = []
    for(let tagIndex = 0; tagIndex < Math.min(myBeatObject.tags.length, 5); tagIndex++) {
      displayedTags.push(<h5 key={myBeatObject.tags[tagIndex] + tagIndex} className="BeatsCardTag">{myBeatObject.tags[tagIndex]}</h5>);
    }

    const backgroundStyle = {
      backgroundImage: `url(${myBeatObject.backgroundImage})`
    }

    return (
      <div key={myBeatObject.title} className="BeatsContainer" style={backgroundStyle} onClick={() => playTarget(index)}>
        <div className="BeatsCardTagContainer">
          {displayedTags}
        </div>
        <div className="BeatsCardContainerOverlay">
          <h4>{myBeatObject.title}</h4>
        </div>
      </div>
    );
  }

  renderPublicBeatCard = (index, publicBeat, playTarget) => {
    const style = {
      backgroundImage: `url(${publicBeat.backgroundImage})`
    }

    return (
      <div key={publicBeat.title + index} className="PublicBeatsContainer" style={style}>
        <div className="PublicBeatsContentOverlay"></div>
        <div className="PublicBeatsContent">
          <img className="PublicBeatsOwnerImage" src={publicBeat.profileImage} height="60px" width="60px"></img>
          <div className="PublicBeatInfo">
            <h5 className="PublicBeatInfoLabel">{publicBeat.title}</h5>
            <div className="PublicBeatInfoContent">
              <img 
                className="PublicBeatActionButton" onClick={() => playTarget(index)}
                src={publicBeat.isPlaying ? pauseButton: playButton} 
                height="30px" width="30px"
              ></img>
              <div className="PublicBeatPlayInfo">
                <h5 className="PublicBeatInfoDesc">{publicBeat.owner}</h5>
                <h5 className="PublicBeatInfoDesc">{`${publicBeat.sampleCount} samples, ${publicBeat.playTime}`}</h5>
              </div>
            </div>
            <div className="PublicBeatVerticalSpacer"></div>
          </div>
        </div>
      </div>
    );
  }
}