const electron = require("electron");
const { ipcRenderer } = electron;

const videoElement = document.querySelector("video");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

let screenId = null;

startBtn.onclick = startStream;

ipcRenderer.on("SET_SOURCE", (e, id) => {
    screenId = id;
})

async function startStream(){
    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: screenId,
            }
        }
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;
    videoElement.play();
}
