import React from 'react';

import redAddButton from '../../images/redAddButton.png';
import whiteAddButton from '../../images/whiteAddButton.png';

import './Studio.css';

export const StudioSection = (isBeatSection, dataList, handleCreateButtonTapped, handleLoadButtonTapped) => {

  const style = {
    display: isBeatSection ? "none" : ""
  };

  const options = dataList.map((data, index) => {
    return (
      <div 
        key={data.title + data.subTitle + index} 
        className="StudioSectionOptionBackground"
        onClick={() => handleLoadButtonTapped(index)}
      >
        <div>
          <h5 className="PublicBeatInfoLabel">{data.title}</h5>
          <h5 className="PublicBeatInfoDesc">{data.subTitle}</h5>
        </div>
        <img src={whiteAddButton} style={style} className="StudioButton StudioButtonSmall"></img>
      </div>
    );
  });

  return (
    <div className="StudioSectionBackground">
      <div className="StudioSectionHeading">
        <h4 className="HomeHorizontalScrollMenuTitle">{isBeatSection ? "Beats" : "Samples"}</h4>
        <img 
          src={redAddButton} 
          className="StudioButton StudioButtonMedium"
          onClick={() => handleCreateButtonTapped()}
        ></img>
      </div>
      <input 
        className="HomeHorizontalScrollSearchButton" type="text" 
        placeholder="Search" name={isBeatSection ? "BeatSearchField" : "SampleSearchField"}
      ></input>
      {options}
    </div>
  );
}