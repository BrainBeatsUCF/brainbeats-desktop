## BrainBeats

### Development

You will need `npm` to install, run and build this project.

#### Ports

During development, the various parts of the application run in the following ports:

1. React: `localhost:3232`
2. Python Server: `localhost:5000`

#### Install

`npm install`

#### Run

`npm start`

#### Build

Note: Building the application transcribes all the components and plugins down to simple html and javascript files to
be used for distribution. It does **not** create the distribution binaries for the electron application. To create the
binaries, a separate setup such as electron forge, or electron builder should be used.

1. Build production files: `npm run build`
2. Build production files and start electron renderer on production files: `npm run buildStart`
3. Build production files and start distribution process: n/a

### Known Issues

- August 27, 2020
  - Only starts electron for mac right now. It's missing boot instructions for windows
