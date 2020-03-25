import React from 'react';

import PauseButton from '../../images/pauseButton.png';

import './Studio.css';

const StudioSection = (isBeatSection, dataList, handleCreateButtonTapped, handleAddButtonTapped) => {

  const style = {
    display: isBeatSection ? "none" : ""
  }

  const options = dataList.map(data => {
    return (
      <div key={data.title + data.subTitle} className="StudioSectionOptionBackground">
        <div>
          <h5 className="PublicBeatInfoLabel">{data.title}</h5>
          <h5 className="PublicBeatInfoDesc">{data.subTitle}</h5>
        </div>
        <img src={PauseButton} style={style} className="StudioButton StudioButtonMedium"></img>
      </div>
    );
  })

  return (
    <div className="StudioSectionBackground">
      <div className="StudioSectionHeading">
        <h4 className="HomeHorizontalScrollMenuTitle">{isBeatSection ? "Beats" : "Samples"}</h4>
        <img src={PauseButton} className="StudioButton StudioButtonMedium"></img>
      </div>
      <input 
        className="HomeHorizontalScrollSearchButton" type="text" 
        placeholder="Search" name={isBeatSection ? "BeatSearchField" : "SampleSearchField"}
      ></input>
      {options}
    </div>
  );
}

export default class Studio extends React.Component {
  
  constructor(props) {
    super();
    this.state = {
      beats: [
        {
          title: "First Mix",
          subTitle: "11 samples, 1 min 20 secs"
        }
      ],
      samples: [
        {
          title: "Sassy Saxxy",
          subTitle: "Saxophone"
        }
      ],
      workstation: null
    };
  }

  render() {
    return (
      <div className="StudioBackground">
        {StudioSection(true, this.state.beats)}
        {StudioSection(false, this.state.samples)}
        <div className="StudioWorkstationBackground">

        </div>
      </div>
    );
  }
}