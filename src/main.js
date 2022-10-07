const { app, BrowserWindow, desktopCapturer } = require("electron");
const path = require("path");

const createWindow = () =>{
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });
    desktopCapturer.getSources({ types: ['screen'] }).then(async sources => {
        for (const source of sources) {
            console.log(source);
            mainWindow.webContents.send('SET_SOURCE', source.id)
        }
      })

    mainWindow.loadFile(path.join(__dirname, "index.html"));
    mainWindow.webContents.openDevTools();
};


app.on("ready", createWindow);