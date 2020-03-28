import "./Studio.css";

import React from "react";
import whitePlayButton from "../../images/whitePlayButton.png";
import { StudioSection } from "./StudioSection";

export default class Studio extends React.Component {
  constructor(props) {
    super();
    this.state = {
      beats: [
        { title: "First Mix", subTitle: "11 samples, 1 min 20 secs" },
        { title: "First Mix", subTitle: "11 samples, 1 min 20 secs" },
        { title: "First Mix", subTitle: "11 samples, 1 min 20 secs" }
      ],
      samples: [{ title: "Sassy Saxxy", subTitle: "Saxophone" }],
      workstation: null
    };
  }

  handleCreateSample = () => {
    console.log("create sample");
  };

  handleCreateWorkspace = () => {
    console.log("create workspace");
  };

  handleLoadWorkspace = index => {
    console.log("load workspace", index);
  };

  handleLoadSample = index => {
    console.log("load sample", index);
  };

  handlePlayWorkstation = (editingBeat) => {
    console.log("play");
  }

  handleUploadImage = () => {
    console.log("upload image");
  }

  handleNameChange = (value) => {
    console.log(value);
  }

  handleSaveBeat = (editingBeat) => {
    console.log("save beat")
  }

  renderWorkStation = (data, play, nameChange, uploadImage, save) => {
    return (
      <div className="StudioWorkstationContent">
        <div className="StudioSectionHeading">
          <h4 className="HomeHorizontalScrollMenuTitle">
            Workstation
          </h4>
        </div>
        <div className="SWContainer">
          <div className="SWActivators">

          </div>
          <div className="SWCanvasContainer">

          </div>
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
              className="SWButton SWButtonGray SWButtonMedium"
              value="Upload Beat Image"
              type="button"
              onClick={() => uploadImage()}
            ></input>
          </div>
          <div className="SWButtonRight">
            <input
              className="SWButton SWButtonBlue SWButtonShort"
              value="Save"
              type="button"
              onClick={() => save()}
            ></input>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="StudioBackground">
        {StudioSection(
          true,
          this.state.beats,
          this.handleCreateWorkspace,
          this.handleLoadWorkspace
        )}{" "}
        {StudioSection(
          false,
          this.state.samples,
          this.handleCreateSample,
          this.handleLoadSample
        )}
        <div className="StudioWorkstationBackground">
          {this.renderWorkStation(
            {},
            this.handlePlayWorkstation,
            this.handleNameChange,
            this.handleUploadImage,
            this.handleSaveBeat
          )}
        </div>
      </div>
    );
  }
}
