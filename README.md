# BrainBeats Desktop

## Development

Primary Dependencies:

- [Node.js & npm](https://nodejs.org/en/)
- [Python 3+](https://www.python.org/)
- [Electron](https://www.electronjs.org/)

If working with the EEG headset:

- [OpenBCI GUI](https://openbci.com/index.php/downloads)

The desktop client was developed primarily on Mac with EEG integration done on Windows. If there are no intentions to use EEG dependent parts of the client, installation guidelines for python dependencies can be skipped.

### Ports

During development, the various parts of the application run in the following ports:

- React: `localhost:3232`

### Install

#### Max/Linux base package

- Run `npm install`

#### Windows base package

- Run `npm run install_windows`

#### Python dependencies (cross platorm)

Python dependencies can be installed on your system or within an environment (recommended).

- Optional: Create and activate environment
  1. Install virtualenv on your system
  - Mac/Linux: `python3 -m pip install --user virtualenv`
  - Windows: `py -m pip install --user virtualenv`
  2. Create environment
  - Max/Linux: `python3 -m venv env`
  - Windows: `py -m venv env`
  3. Activate environment
  - Mac/Linux: `source env/bin/activate`
  - Windows: `.\env\Scripts\activate`
  4. Check that environment has been activated
  - Mac/Linux: `which python` should print `.../env/bin/python` to terminal
  - Windows: `where python` should print `.../env/bin/python.exe` to console
- Install python dependencies: `pip install -r hardware/requirements.txt`

### Run

#### Mac/Linux

- Run `npm start`

#### Windows

- Open up two terminals
- In one terminal, run `npm run start_windows`
- In the other terminal window, run `electron .` in this same root directory

### Build

#### Mac/Linux

Building the application transcribes all the components and plugins down to simple html and javascript files to be used for distribution. It also copies over all the hardware and setup files to the production folder. It does **not** create the distribution binaries for the electron application. To create the binaries, a separate setup such as electron forge, or electron builder should be used.

1. Run `npm run stage_production` to build production files
2. Run `npm run start_production` to start up electron using built files. Running without staging files will error out.

- If you're planning on using the EEG headset, make sure [python dependencies](#python-dependencies-cross-platorm) have already been installed.

#### Windows

- N/A

### Known Issues
