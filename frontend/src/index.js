import axios from 'axios';
const btn = document.querySelector('#btn')
const from = document.querySelector('#form');
const text = document.querySelector('#connection');

let dataChannel;
let localConnection;
const serverBaseURL = 'http://localhost:3000/api/';
const servers = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:5349',
        'stun:stun2.l.google.com:19302',
        'stun:stun4.l.google.com:5349',
      ],
    },
  ],
};

const init = async () => {
  localConnection = new RTCPeerConnection(servers);

  localConnection.onicecandidate = (e) => {
    if (e.candidate) {
      sendCandidateToServer(e.candidate);
    }
  };
  const offer = await localConnection.createOffer();
  await localConnection.setLocalDescription(offer);

  const { data } = await axios.post(`${serverBaseURL}RTCHandShake`, { offer });
  await localConnection.setRemoteDescription(new RTCSessionDescription(data.answer));

  localConnection.onconnectionstatechange = () => {
    if (localConnection.connectionState !== 'connected') {
      setInterval(async () => {
        try {
          await reciveIceCandidateFromSFU();
        } catch (e) { }
      }, 1000);
    }
  }
};

const sendCandidateToServer = async (candidate) => {
  try {
    await axios.post(`${serverBaseURL}sendCandidate`, {
      candidate: candidate,
    });
  } catch (e) { }
};

const reciveIceCandidateFromSFU = async () => {
  try {
    const { data } = await axios.get(`${serverBaseURL}reciveCandidate`);
    if (data.candidate) {
      await localConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  } catch (e) { }
};

init();

dataChannel = localConnection.createDataChannel('chat');
dataChannel.onopen = () => {
  text.innerHTML = 'webRTC connection established!';
  console.log('Data channel is open');
  dataChannel.send('Hello from the client!');
  btn.addEventListener('click', () => {
    if (from.value !== '') {
      dataChannel.send(JSON.stringify(form.value))
      form.value = '';
    }
  })
};
dataChannel.onmessage = (event) => {
  console.log('Message received from server: ', event.data);
};






