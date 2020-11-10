# BrainBeats Desktop

## Development

Primary Dependencies:

- [Node.js & npm](https://nodejs.org/en/)
- [Python 3+](https://www.python.org/)
- [Electron](https://www.electronjs.org/)

If working with the EEG headset:

- [OpenBCI GUI](https://openbci.com/index.php/downloads)

The desktop client was developed primarily on Mac with EEG integration done on Windows.

### Ports

During development, the various parts of the application run in the following ports:

- React: `localhost:3232`

### Install

**Mac/Linux**
`npm install`

**Windows**
`npm run install_windows`

**Python dependencies (cross platorm)**
`pip install -r hardware/requirements.txt`

### Run

**Mac/Linux**
`npm start`

**Windows**

- Open up two terminals
- In one terminal, run `npm run start_windows`
- In the other terminal window, run `electron .` in this same root directory

### Known Issues
