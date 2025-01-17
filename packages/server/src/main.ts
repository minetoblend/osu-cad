import http from 'node:http';
import config from 'config';
import cors from 'cors';
import express from 'express';
import request from 'request';
import { Server } from 'socket.io';
import { getAssetPath, loadAssets } from './assets';
import { Gateway } from './Gateway';

// region config

const port = config.get('deployment.port');

// endregion

const app = express();
app.use(cors({

}));

app.use((req, res, next) => {
  console.log(req.originalUrl);
  next();
});

const server = http.createServer(app);
const io = new Server(server, {
  transports: ['websocket'],
  cors: {
    origin: true,
  },
});

const gateway = new Gateway(io);

app.get('/api/assets/:id', (req, res) => {
  const path = getAssetPath(req.params.id);
  if (!path) {
    res.sendStatus(404);
    return;
  }

  res.sendFile(path);
});

app.get('/api/users/:id/avatar', async (req, res) => {
  request(`https://a.ppy.sh/${req.params.id}?1717782343.jpeg`).pipe(res);
});

async function run() {
  await loadAssets();
  await gateway.init();

  server.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

run().then();
