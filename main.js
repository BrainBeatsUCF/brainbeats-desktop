const { app, BrowserWindow, ipcMain } = require('electron')
const { PythonShell } = require('python-shell')
const path = require('path')

/// Keep reference to main window to allow communication with background
/// window processes
let mainWindow

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 680,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // load development environment values
  process.env.isElectronDevelopmentEnvironment = true

  // and load the index.html of the app.
  win.loadURL('http://localhost:3232')

  // Open the DevTools.
  win.webContents.openDevTools()
  mainWindow = win
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Event listeners for coordinating IPC between main and renderer threads
let pyshell

const endPyshell = _ => {
  if (pyshell == null || pyshell == undefined) {
    return
  }
  console.log('BACKGROUND DEBUG PRINT: Ending Script Child Process')
  pyshell.childProcess.kill(0)
  pyshell = null
}

const parsePyshellMessage = args => {
  try {
    const messageDetails = JSON.parse(args)
    if (messageDetails == undefined || messageDetails == null) {
      return
    }

    /// Handle sending emotion
    if (messageDetails.emotion != null && messageDetails.emotion != undefined) {
      console.log('BACKGROUND DEBUG PRINT: Emotion Predicted')
      mainWindow.webContents.send('HARDWARE_PROCESS_MESSAGE', messageDetails.emotion)
      return
    }

    /// Handle sending confirmation
    if (messageDetails.hasConfirmed != undefined && messageDetails.hasConfirmed != null) {
      console.log('BACKGROUND DEBUG PRINT: Connection Confirmed')
      return
    }
  } catch (error) {
    console.log(args)
  }
}

// Event to tell electron to create python script handler
ipcMain.on('HARDWARE_PROCESS_START', event => {
  endPyshell()
  let startScriptPath = path.join(__dirname, 'hardware/hardware_starter.py')
  pyshell = new PythonShell(startScriptPath, {
    pythonPath: 'python',
  })

  pyshell.on('message', function (results) {
    parsePyshellMessage(results)
  })

  pyshell.on('error', function (results) {
    console.log('BACKGROUND DEBUG PRINT: Script Error Exit')
    endPyshell()
  })

  pyshell.on('stderr', function (stderr) {
    endPyshell()
    console.log(stderr)
    mainWindow.webContents.send('HARDWARE_PROCESS_ERROR')
  })
})

// Event to shutdown python script handler
ipcMain.on('HARDWARE_PROCESS_SHUTDOWN', event => {
  endPyshell()
})
