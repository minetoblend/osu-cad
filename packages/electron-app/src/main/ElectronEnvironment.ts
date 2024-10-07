import { ipcMain } from 'electron';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { OsuBeatmap } from 'osu-db-parser';
import { OsuStableInfo } from './loadOsuStableInfo';
import path from 'node:path';
import log from 'electron-log/main';
// @ts-expect-error importing a worker
import createWorker from './BeatmapLoadWorker.ts?nodeWorker';

export async function setupEnvironment(osuPaths: OsuStableInfo | null) {
  ipcMain.on('stableDetected', (event) => {
    event.returnValue = !!osuPaths
  });

  ipcMain.on('argv', (event) => {
    event.returnValue = process.argv;
  });

  ipcMain.on('osuPaths', (event) => {
    event.returnValue = osuPaths;
  });

  ipcMain.handle('loadBeatmaps', async () => {
    if (!osuPaths) {
      return null;
    }

    return await loadBeatmaps(osuPaths);
  });

  ipcMain.handle('loadSkins', async () => {
    if (!osuPaths) {
      return [];
    }

    return await loadSkins(osuPaths);
  });

  ipcMain.handle('saveBeatmap', async (_, beatmap: string, filename: string, content: string) => {
    if (!osuPaths?.songsPath)
      return false;

    const beatmapDirectory = path.join(osuPaths.songsPath, beatmap);

    const backupPath = path.join(beatmapDirectory, '.osucad/backups')

    try {
      await mkdir(backupPath, {
        recursive: true
      })

      log.info(
        'Creating backup for ',
        path.resolve(beatmapDirectory, filename),
        ' in ',
        path.resolve(backupPath, `${new Date().toString()}_${filename}`)
      )

      const originalFileContents = await readFile(path.resolve(beatmapDirectory, filename), 'utf-8')

      await writeFile(
        path.resolve(backupPath, `${new Date().getTime()}_${filename}.backup`),
        originalFileContents,
      )

      await writeFile(path.resolve(beatmapDirectory, filename), content)

      log.info(`Successfully saved ${filename}`)

      return true
    } catch (e) {
      log.error(e)
      return false
    }
  })
}

async function loadSkins(osuPaths: OsuStableInfo): Promise<ElectronSkinInfo[]> {
  if (!osuPaths.skinsPath)
    return [];

  try {
    const dirs = await readdir(osuPaths.skinsPath);

    return dirs.map(dirname => ({
      name: dirname,
      path: `osu-stable://skins?path=${encodeURIComponent(dirname)}`,
    }));
  } catch(e) {
    console.error('Failed to load skins', e);
    return []
  }
}

const worker = createWorker();

async function loadBeatmaps(osuPaths: OsuStableInfo): Promise<(OsuBeatmap)[] | null> {
  if (!osuPaths.dbPath)
    return null;

  worker.postMessage({
    dbPath: osuPaths.dbPath
  })

  return await new Promise(resolve => worker.once('message', resolve));
}
