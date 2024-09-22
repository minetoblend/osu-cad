import { protocol, net } from 'electron';
import fs from 'node:fs/promises';
import { join, relative, resolve } from 'path';
import log from 'electron-log/main';
import { OsuStableInfo } from './loadOsuStableInfo.ts';
import createWorker from './BeatmapLoadWorker.ts?nodeWorker';
import { OsuBeatmap } from 'osu-db-parser';

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'osu-stable',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      bypassCSP: true,
      stream: true
    },
  },
]);

const worker = createWorker();

export function setupProtocol(osuPaths: OsuStableInfo | null) {
  const logger = log.create({ logId: 'osu-stable protocol handler' });

  protocol.handle('osu-stable', async (request) => {
    return await handle(request);
  });

  async function handle(request: Request): Promise<Response> {
    if (!osuPaths) {
      return new Response('Not found', { status: 404 });
    }

    // eslint-disable-next-line prefer-const
    let { host, pathname, searchParams } = new URL(request.url);

    pathname = decodeURI(pathname.slice(1));

    let basePath = osuPaths.installPath;

    switch (host) {
      case 'beatmap-index':
        if (!osuPaths.dbPath)
          return new Response('Not found', { status: 404 });

        const beatmaps = await loadBeatmaps(osuPaths);

        return new Response(JSON.stringify(beatmaps), { headers: { 'Content-Type': 'application/json' } });
      case 'songs':
        if (!osuPaths.songsPath)
          return new Response('Not found', { status: 404 });

        basePath = osuPaths.songsPath;
        break;
      case 'skins':
        if (!osuPaths.skinsPath)
          return new Response('Not found', { status: 404 });

        basePath = osuPaths.skinsPath;
        break;
      case 'root':
        basePath = osuPaths.installPath;
        break;
      default:
        logger.warn(`Unknown host: ${host}`);

        return new Response('Not found', { status: 404 });
    }

    pathname = searchParams.get('path') ?? pathname;

    const filePath = resolve(basePath, pathname);

    if (relative(basePath, filePath).startsWith('..')) {
      return new Response('Not found', { status: 404 });
    }

    try {
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        return net.fetch(`file://${filePath}`, {
          headers: request.headers,
        })
      }

      if (stats.isDirectory()) {
        if (searchParams.get('entries') !== null) {
          const entries = await fs.opendir(filePath);

          console.log('loading entries for ', basePath, filePath, pathname, osuPaths.skinsPath);

          const files: {
            name: string;
            isDirectory: boolean;
          }[] = [];

          for await (const entry of entries) {
            const file = entry.name;

            if (file.startsWith('.'))
              continue;

            files.push({
              name: file,
              isDirectory: entry.isDirectory(),
            });
          }

          return new Response(JSON.stringify(files), { headers: { 'Content-Type': 'application/json' } });
        }


        if (searchParams.get('load') !== null) {
          // We don't wanna load more than 500 MB of files at once
          const maxSize = 1024 * 1024 * 500;

          const formData = new FormData();

          let size = 0;

          for await (const entry of walk(filePath)) {
            const buffer = await fs.readFile(entry);

            size += buffer.byteLength;

            if (size > maxSize) {
              return new Response('Too large', { status: 413 });
            }

            formData.set(relative(filePath, entry), new Blob([buffer]));
          }

          return new Response(formData);
        }
      }


      logger.warn(`File not found: ${filePath}`);

    } catch (e) {
      logger.warn('Failed to load from osu directory', e);
    }

    return new Response('Not found', { status: 404 });
  }
}

async function* walk(dir: string): AsyncGenerator<string> {
  for await (const d of await fs.opendir(dir)) {
    const entry = join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else if (d.isFile()) yield entry;
  }
}

async function loadBeatmaps(osuPaths: OsuStableInfo): Promise<(OsuBeatmap)[] | null> {
  if (!osuPaths.dbPath)
    return null;

  worker.postMessage({
    dbPath: osuPaths.dbPath
  })

  return await new Promise(resolve => worker.once('message', resolve));
}
