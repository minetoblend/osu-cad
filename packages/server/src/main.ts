import http from 'node:http';
import config from 'config';
import express from 'express';
import { Server } from 'socket.io';
import { getAssetPath, loadAssets } from './assets';
import { Gateway } from './Gateway';

// region config

const port = config.get('deployment.port');

// endregion

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  transports: ['webtransport', 'websocket'],
  perMessageDeflate: true,
});

const gateway = new Gateway(io);

app.get('/assets/:id', (req, res) => {
  const path = getAssetPath(req.params.id);
  if (!path) {
    res.sendStatus(404);
    return;
  }

  res.sendFile(path);
});

async function run() {
  await Promise.all([
    gateway.init(),
    loadAssets(),
  ]);

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

run().then();
