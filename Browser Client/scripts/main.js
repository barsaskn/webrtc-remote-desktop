import firebase from 'firebase/app';
import 'firebase/firestore';


const remoteVideo = document.getElementById('remoteVideo');
const connectBtn = document.getElementById('connectBtn');
const callKey = document.getElementById("callKey");
connectBtn.onclick = startStream;

const firebaseConfig = {
    apiKey: "AIzaSyBHev1hbPlkTFCmKIaXfYoLAXs-jhkVD6Y",
    authDomain: "webrtc-remote-desktop.firebaseapp.com",
    projectId: "webrtc-remote-desktop",
    storageBucket: "webrtc-remote-desktop.appspot.com",
    messagingSenderId: "668531995243",
    appId: "1:668531995243:web:77fca6979ced1e6b81f72e",
    measurementId: "G-7LBKY1R73D"
  };

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();

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



let remoteStream = new MediaStream();


pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
};
remoteVideo.srcObject = remoteStream;
remoteVideo.onmousemove = function(e) {
    var rect = e.target.getBoundingClientRect();
    let data = {x: parseInt(e.clientX-rect.left), y: parseInt(e.clientY-rect.top)}
}
async function startStream(){
    const callId = callKey.value;
    const callDoc = firestore.collection('calls').doc(callId);
    const answerCandidates = callDoc.collection('answerCandidates');
    const offerCandidates = callDoc.collection('offerCandidates');

    pc.onicecandidate = (event) => {
        event.candidate && answerCandidates.add(event.candidate.toJSON());
      };
    
      const callData = (await callDoc.get()).data();
      const offerDescription = callData.offer;
      await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
    
      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);
    
      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };
    
      await callDoc.update({ answer });

      offerCandidates.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          console.log(change);
          if (change.type === 'added') {
            let data = change.doc.data();
            pc.addIceCandidate(new RTCIceCandidate(data));
          }
        });
    });
    let dataChannel = pc.createDataChannel("dataChannel");
    dataChannel.onerror = (error) => {
        console.log("Data Channel Error:", error);
    };
  
    dataChannel.onmessage = (event) => {
        console.log("Got Data Channel Message:", event.data);
    };
  
    dataChannel.onopen = () => {
        console.log("DATA CHANNEL ARRIVED")
    };
  
    dataChannel.onclose = () => {
        console.log("The Data Channel is Closed");
    };
    remoteVideo.onmousemove = function(e){
            var rect = e.target.getBoundingClientRect();
            var x = e.clientX - rect.left; //x position within the element. yatay
            var y = e.clientY - rect.top;  //y position within the element. dikey
            let data = {
                positionX:x,
                positionY:y,
                sizeHeight: rect.height,
                sizeWidth: rect.width
            }
            dataChannel.send(JSON.stringify(data), "dataChannel");
            console.log(data); //datayı yollaa
    }
}

