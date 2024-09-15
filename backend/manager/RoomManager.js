import wrtc from 'wrtc';

export class Manager {
  constructor(servers) {
    this.offer = {};
    this.remoteConnection = new wrtc.RTCPeerConnection(servers);
    this.answer = {};
  }

  async createAnswer(offer) {
    await this.remoteConnection.setRemoteDescription(new wrtc.RTCSessionDescription(offer))
    const answer = await this.remoteConnection.createAnswer();
    await this.remoteConnection.setLocalDescription(answer);
    return answer;
  }

  async remoteICEcandidate(candidate) {
    this.remoteConnection.addIceCandidate(new wrtc.RTCIceCandidate(candidate))
  }

  async localICEcandidate() {
    this.remoteConnection.onicecandidate = (e) => {
      if (e.candidate) {
        return;
      }
    }
  }

  connectState() {
    return this.remoteConnection.connectionState === 'connected';
  }

  listen() {
    this.remoteConnection.ondatachannel = (e) => {
      const reviveChannal = e.channel;
      reviveChannal.onopen = () => {
        reviveChannal.send(`Hello this is server you are connected via webRTC!!`);
        console.log(`Data is channal open!`);
      }
      reviveChannal.onmessage = (e) => {
        console.log(`Message from client: ${e.data}`)
      }
    }
  }
}

