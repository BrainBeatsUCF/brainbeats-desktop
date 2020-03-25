import React from 'react';

import './Studio.css';

export default class Studio extends React.Component {
  
  constructor(props) {
    super();
    this.state = {
      beats: [
        {
          title: "First Mix",
          sampleCount: 11,
          audioLength: "1 min, 20 secs"
        }
      ],
      samples: [
        {
          instrument: "saxophone",
          title: "Sassy Saxxy"
        }
      ],
      workstation: null
    };
  }

  render() {
    return (
      <div className="StudioBackground">
        <div className="StudioSectionBackground">

        </div>
        <div className="StudioSectionBackground">

        </div>
        <div className="StudioWorkstationBackground">

        </div>
      </div>
    );
  }
}