## BrainBeats

### Development
They were some complicated integrations that had to be made. As a result, you will need both `yarn` and `npm` to install, run and build this project.

#### Ports
During development, the various parts of the application run in the following ports:
1. React: `localhost:3000`
2. Electron Window: `localhost:4000`
3. Python Server: `localhost:5000`

#### Install
```npm install```

#### Run
```npm run start```

#### Build
```npm run build```

### Known Road Bumps
* Install is failing because my create-react-up is outdate
  - Uninstall `create-react-app` globally with `npm uninstall -g create-react-app`
  - Reclone project
  - Restart process

* Build process is failing
  - Make sure you have both `yarn` and `npm` installed
