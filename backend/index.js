import express from 'express';
import cors from 'cors';
import { Manager } from './manager/RoomManager.js';

const app = express();
app.use(cors());
app.use(express.json());

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

const manager = new Manager(servers);

app.post('/api/RTCHandShake', async (req, res) => {
  const { offer } = req.body;
  try {
    const answer = await manager.createAnswer(offer);
    res.json({ answer });
  } catch (error) {
    res.status(500).send('Error during RTC handshake');
  }
});

app.post('/api/sendCandidate', async (req, res) => {
  const { candidate } = req.body;
  await manager.remoteICEcandidate(candidate);
})

app.get('/api/reciveCandidate', async (req, res) => {
  let iceC = manager.localICEcandidate()
  res.json({ iceC });
})

manager.listen();

app.listen(3000, () => {
  console.log('Server started at http://localhost:3000');
});













