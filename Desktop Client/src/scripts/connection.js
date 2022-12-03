const firebase = require("firebase/app");
const firestore = require("firebase/firestore")
console.log("Connection Started.")

const videoStreamElement = document.getElementById("video");

const firebaseConfig = {
    apiKey: "AIzaSyBHev1hbPlkTFCmKIaXfYoLAXs-jhkVD6Y",
    authDomain: "webrtc-remote-desktop.firebaseapp.com",
    projectId: "webrtc-remote-desktop",
    storageBucket: "webrtc-remote-desktop.appspot.com",
    messagingSenderId: "668531995243",
    appId: "1:668531995243:web:77fca6979ced1e6b81f72e",
    measurementId: "G-7LBKY1R73D"
  };
if (!firebase.default.apps.length) {
    firebase.default.initializeApp(firebaseConfig);
}
const db = firebase.default.firestore();
  
const servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
};
  
  // Global State
const pc = new RTCPeerConnection(servers);
let receiveChannel = pc.createDataChannel("dataChannel");
/*
let dataChannel = pc.createDataChannel("dataChannel");

dataChannel.addEventListener('message', event => {
    const message = event;
    console.log(message)
});
dataChannel.onerror = (error) => {
    console.log("Data Channel Error:", error);
};
dataChannel.onmessage = (event) => {
    console.log("Got Data Channel Message:", event);
};
dataChannel.onopen = () => {
    console.log("Data channel opened")
};

dataChannel.onclose = () => {
    console.log("The Data Channel is Closed");
};
*/
pc.ondatachannel = receiveChannelCallback;
function receiveChannelCallback(event) {
    console.log('Receive Channel Callback');
    receiveChannel = event.channel;
    receiveChannel.onmessage = onReceiveMessageCallback;

  }
  function onReceiveMessageCallback(event) {
    console.log(event.data);
  }


const shareBtn = document.getElementById("shareBtn");
shareBtn.onclick = shareConnectionStream;


async function shareConnectionStream(){
    const callDoc = db.collection("calls").doc();
    const offerCandidates = callDoc.collection('offerCandidates');
    const answerCandidates = callDoc.collection('answerCandidates');

    console.log(callDoc.id);

    const videoStream = videoStreamElement.srcObject;
    videoStream.getTracks().forEach((track) => {        //untested snippet
        pc.addTrack(track, videoStream);
    });

    pc.onicecandidate = (event) => {
        event.candidate && offerCandidates.add(event.candidate.toJSON());
    };
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);
    const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
    };
    await callDoc.set({ offer });

    //below untested
    callDoc.onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (!pc.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          pc.setRemoteDescription(answerDescription);
        }
    });
    answerCandidates.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.addIceCandidate(candidate);
          }
        });
    });

    
}