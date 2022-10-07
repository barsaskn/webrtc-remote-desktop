const electron = require("electron");
const { ipcRenderer } = electron;
const firebase = require("firebase/app")
const { getFirestore, collection, getDocs } = require('firebase/firestore');
console.log("connected")
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBHev1hbPlkTFCmKIaXfYoLAXs-jhkVD6Y",
    authDomain: "webrtc-remote-desktop.firebaseapp.com",
    projectId: "webrtc-remote-desktop",
    storageBucket: "webrtc-remote-desktop.appspot.com",
    messagingSenderId: "668531995243",
    appId: "1:668531995243:web:77fca6979ced1e6b81f72e",
    measurementId: "G-7LBKY1R73D"
  };

const videoElement = document.getElementById("video");
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
    let firebaseApp;
    if(!firebase.getApps.length){
        firebaseApp = firebase.initializeApp(firebaseConfig);
    }
    const firestore = getFirestore(firebaseApp);
    
    const servers = {
        iceServers: [
          {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
          },
        ],
        iceCandidatePoolSize: 10,
    };
    
    let pc = new RTCPeerConnection(servers);

    let localstream = stream;

    localstream.getTracks().forEach((track) => {
        pc.addTrack(track, localstream);
    })
    //const callDoc = firestore.collection("calls").doc().then( e =>{console.log(callDoc.id);})
    // const offerCandidates = callDoc.collection("offerCandidates");
    // const answerCandidates = callDoc.collection("answerCandidates");
    // console.log(callDoc.id);


    // pc.onicecandidate = event =>{
    //     event.candidate && offerCandidates.add(event.candidate.toJSON());
    // };

    // const offerDescription = await pc.createOffer();
    // await pc.setLocalDescription(offerDescription);
    // const offer = {
    //     sdp: offerDescription.sdp,
    //     type: offerDescription.type,
    // };
    // await callDoc.set({ offer })

    // callDoc.onSnapshot((snapshot) =>{
    //     const data = snapshot.data();
    //     if(!pc.currentRemoteDescription && data?.answer){
    //         const answerDescription = new RTCSessionDescription(data.answer);
    //         pc.setRemoteDescription(answerDescription);
    //     }
    // }); 
};
