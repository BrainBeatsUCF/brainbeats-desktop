const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const path = require("path");
const isDev = require("electron-is-dev");

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({ 
    width: 900, 
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + '/preload.js'
    }
  });
  
  mainWindow.loadURL(
    isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../build/index.html")}`
  );

  mainWindow.on("closed", () => (mainWindow = null));
  ipcMain.on('channel' , (event, msg)=>{
    console.log(msg)
    mainWindow.webContents.send('response' , {title : 'mymessage'  , data : 1 }) ; 
})
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});