import React from 'react';
import { StudioSection } from './StudioSection';

import './Studio.css';

export default class Studio extends React.Component {
  
  constructor(props) {
    super();
    this.state = {
      beats: [
        {
          title: "First Mix",
          subTitle: "11 samples, 1 min 20 secs"
        },
        {
          title: "First Mix",
          subTitle: "11 samples, 1 min 20 secs"
        },
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

  handleCreateSample = () => {
    console.log("create sample");
  }

  handleCreateWorkspace = () => {
    console.log("create workspace");
  }

  handleLoadWorkspace = (index) => {
    console.log("load workspace", index);
  }

  handleLoadSample = (index) => {
    console.log("load sample", index);
  }

  render() {
    return (
      <div className="StudioBackground">
        {StudioSection(true, this.state.beats, this.handleCreateWorkspace, this.handleLoadWorkspace)}
        {StudioSection(false, this.state.samples, this.handleCreateSample, this.handleLoadSample)}
        <div className="StudioWorkstationBackground">

        </div>
      </div>
    );
  }
}