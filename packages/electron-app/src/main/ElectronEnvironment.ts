import { ipcMain } from 'electron';
import { readFile, readdir } from 'node:fs/promises';
import OsuDBParser, { OsuBeatmap } from 'osu-db-parser';
import { OsuStableInfo } from './loadOsuStableInfo.ts';
import path from 'node:path';

export async function setupEnvironment(osuPaths: OsuStableInfo | null) {
  ipcMain.on('stableDetected', (event) => {
    event.returnValue = !!osuPaths
  });

  ipcMain.on('argv', (event) => {
    event.returnValue = process.argv;
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
}

async function loadSkins(osuPaths: OsuStableInfo): Promise<ElectronSkinInfo[]> {
  if (!osuPaths.skinsPath)
    return [];


  const skins: ElectronSkinInfo[] = []

  try {
    const dirs = await readdir(osuPaths.skinsPath);

    for (const dir of dirs) {
      let name = dir;

      try {
        const ini = await readFile(path.join(osuPaths.skinsPath, dir, 'skin.ini'), 'utf-8');

        const match = ini.match(/Name:(.*)/);
        if (match) {
          name = match[1].trim();
        }
      } catch (e) {
        // this can fail if the file isn't there
      }

      skins.push({
        name,
        path: `osu-stable://skins?path=${encodeURIComponent(dir)}`,
      });
    }

    return skins;
  } catch(e) {
    console.error('Failed to load skins', e);
    return []
  }
}

async function loadBeatmaps(osuPaths: OsuStableInfo): Promise<(OsuBeatmap)[] | null> {
  if (!osuPaths.dbPath)
    return null;

  try {
    const buffer = await readFile(osuPaths.dbPath);
    const osuDB = new OsuDBParser(buffer);

    const data = osuDB.getOsuDBData();

    return data.beatmaps.filter(it => it.mode === 0);
  } catch (e) {
    console.error('Failed to load beatmaps', e);

    return null;
  }
}
