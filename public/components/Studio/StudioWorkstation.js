import "./Studio.css";

import React from "react";
import whitePlayButton from "../../images/whitePlayButton.png";

export const WorkStationSection = (
  data, 
  play, 
  nameChange, 
  uploadImage, 
  save,
  renderCanvas
) => {
  return (
    <div className="StudioWorkstationContent">
      <div className="StudioSectionHeading">
        <h4 className="HomeHorizontalScrollMenuTitle">
          Workstation
        </h4>
      </div>
      <div className="SWContainer">
        {renderCanvas()}
      </div>
      <div className="SWButtonSection">
        <div className="SWButtonLeft">
          <img
            src={whitePlayButton}
            className="Studio Button StudioButtonLarge"
            onClick={() => play(data)}
          ></img>
          <input
            className="SWButton SWButtonGray SWButtonLong"
            placeholder="Beat Title"
            type="text"
            onChange={event => nameChange(event.target.value)}
          ></input>
          <input
            className="SWButton SWButtonGray SWButtonClick SWButtonMedium"
            value="Upload Beat Image"
            type="button"
            onClick={() => uploadImage()}
          ></input>
        </div>
        <div className="SWButtonRight">
          <input
            className="SWButton SWButtonBlue SWButtonClick SWButtonShort"
            value="Save"
            type="button"
            onClick={() => save(data)}
          ></input>
        </div>
      </div>
    </div>
  );
};