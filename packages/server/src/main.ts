import http from 'node:http';
import config from 'config';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import { getAssetPath, loadAssets } from './assets';
import { Gateway } from './Gateway';

// region config

const port = config.get('deployment.port');

// endregion

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  transports: ['websocket'],

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
  await loadAssets();
  await gateway.init();

  server.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

run().then();
