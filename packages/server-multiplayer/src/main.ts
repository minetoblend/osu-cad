import http from 'node:http';
import config from 'config';
import cors from 'cors';
import express from 'express';
import request from 'request';
import { getAssetPath, loadAssets } from './assets';
import { Gateway } from './Gateway';
import { createRedis } from './redis';
import { createSocketIo } from './socketIo';

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

const redis = createRedis(config.get('redis'));

const io = createSocketIo({
  server,
  redis,
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
  await gateway.init(redis);

  server.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

run().then();
