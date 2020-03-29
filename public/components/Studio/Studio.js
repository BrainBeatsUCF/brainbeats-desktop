import "./Studio.css";
import "./SWCanvas.css";

import React from "react";
import checkGreen from "../../images/checkGreen.png";
import checkRed from "../../images/checkRed.png";

import { Rnd } from "react-rnd";
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
      samples: [
        { title: "Sassy Saxxy", subTitle: "Saxophone", length: 4 },
        { title: "Party Noise", subTitle: "Drums", length: 3 },
        { title: "DaVinci", subTitle: "Piano", length: 6 }
      ],
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
      length: this.state.samples[index].length
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

  handleResize = (index, delta) => {
    const lengthDelta = delta.width / 40;
    let row = this.state.workstation[index];
    row.length += lengthDelta;
    // this.setState(row)
  }

  handleDrag = (index, xPosition) => {
    const newXPosition = xPosition / 40;
    let row = this.state.workstation[index];
    row.col = newXPosition;
    // this.setState(row)
  }

  renderGridItems = () => {
    const style = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }

    return this.state.workstation.map((workItem, index) => {
      return (
        <Rnd
        key={`${index}${workItem.row}${workItem.col}`}
        className="SWGridItem"
        style={style}
        default={{
          x: 0,
          y: 40 * workItem.row,
          width: 40 * workItem.length,
          height: 40
        }}
        minHeight={40}
        maxHeight={40}
        maxWidth={MAX_GRID_WIDTH}
        minWidth={40}
        resizeGrid={[40,1]}
        dragGrid={[40,1]}
        dragAxis={"x"}
        bounds={"parent"}
        onResizeStop={(event, dir, ref, delta, position) => this.handleResize(index, delta)}
        onDragStop={(event, handler) => this.handleDrag(index, handler.lastX)}
        >
          <h5 className="SampleCardLabel NoMargins">{workItem.title}</h5>
        </Rnd>
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
