import "./Studio.css";
import "./SWCanvas.css";

import React from "react";
import checkGreen from "../../images/checkGreen.png";
import checkRed from "../../images/checkRed.png";
import { StudioSection } from "./StudioSection";
import { WorkStationSection } from './StudioWorkstation';

const MAX_GRID_WIDTH = "3840px";

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
      workstation: []
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
    let workstation = this.state.workstation;
    workstation.push({
      isActive: true, 
      title: this.state.samples[index].title,
      row: workstation.length,
      col: 0,
      length: 4,
      isTracking: false
    });
    this.setState(workstation);
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

  handleToggleActiveRow = (index) => {
    let row = this.state.workstation[index];
    row.isActive = !row.isActive;
    this.setState(row);
  }

  renderActivators = () => {
    return this.state.workstation.map((single, index) => {
      return (
        <div 
          key={`${index}${single.isActive}`} 
          className="SWActivatorContainer"
        >
          <img
            src={single.isActive ? checkGreen : checkRed}
            height="25px"
            width="25px"
            onClick={() => this.handleToggleActiveRow(index)}
          ></img>
        </div>
      );
    });
  }

  handleMouseDown = index => {
    let row = this.state.workstation[index];
    row.isTracking = true;
    this.setState(row);
  }

  handleMouseUp = index => {
    let row = this.state.workstation[index];
    row.isTracking = false;
    this.setState(row);
  }

  handleMouseMove = (event, index) => {
    if(!this.state.workstation[index].isTracking) {
      return;
    }

    console.log(event.clientX, event.clientY);
  }

  renderGridItems = () => {
    return this.state.workstation.map((workItem, index) => {
      const position = {
        top: `${40 * workItem.row}px`,
        left: "0px"
      }
      return (
        <div 
          onMouseDown={() => this.handleMouseDown(index)}
          onMouseMove={event => this.handleMouseMove(event, index)}
          onMouseUp={() => this.handleMouseUp(index)}
          key={`${index}${workItem.col}${workItem.row}${workItem.title}`}
          className="SWGridItem" 
          style={position}
        >
          <h5 className="SampleCardLabel NoMargins">{workItem.title}</h5>
        </div>
      );
    });
  }

  renderCanvas = () => {
    const gridDimensions = {
      width: MAX_GRID_WIDTH,
      height: `${this.state.workstation.length * 40}px`
    }

    return (
      <div className="SWCanvasMainContainer">
        <div className="SWCanvasActivators"> 
          {this.renderActivators()}
        </div>
        <div className="SWCanvasGridContainer">
          <div
            className="SWCanvasGrid"
            style={gridDimensions}
          > 
            {this.renderGridItems()}
          </div>
        </div>
        <div className="ScrollCover"></div>
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
          {WorkStationSection(
            {},
            this.handlePlayWorkstation,
            this.handleNameChange,
            this.handleUploadImage,
            this.handleSaveBeat,
            this.renderCanvas
          )}
        </div>
      </div>
    );
  }
}
