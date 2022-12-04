const { app, BrowserWindow, desktopCapturer, ipcMain, screen } = require("electron");
const path = require("path");
const robot = require("@jitsi/robotjs")


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
            mainWindow.webContents.send('SET_SOURCE', source.id)
        }
      })
      
    mainWindow.loadFile(path.join(__dirname, "index.html"));
    mainWindow.webContents.openDevTools();
};


app.on("ready", createWindow);
ipcMain.on("mousePosition", (event,data) => {
    const pcHeight = screen.getPrimaryDisplay().size.height;
    const pcWidth = screen.getPrimaryDisplay().size.width;
    data = JSON.parse(data)
    const xVar = (pcWidth/Math.trunc(data.sizeWidth))*Math.trunc(data.positionX);
    const yVar = (pcHeight/Math.trunc(data.sizeHeight))*Math.trunc(data.positionY);
    robot.moveMouse(Math.trunc(xVar),Math.trunc(yVar));
    if(data.clicked){
        robot.mouseClick()
    }

    console.log("x="+Math.trunc(xVar) + "y="+Math.trunc(yVar));

});