import { promisified as regedit } from 'regedit';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

async function canAccess(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch (e) {
    return false;
  }
}

async function isDir(path: string) {
  try {
    const stats = await fs.stat(path);
    return stats.isDirectory();
  } catch (e) {
    return false;
  }
}

async function findOsuInstallPath() {
  try {
    const registryKey = 'HKCR\\osu!\\shell\\open\\command';

    const results = await regedit.list([registryKey]);
    const result = results[registryKey];

    if (result.exists && typeof result.values[''].value === 'string') {
      const installPath = result.values[''].value
        .replace(/"/g, '')
        .split(' ')[0]
        .replace(/osu!.exe/, '');

      // Trying to access the install path to make sure it's valid
      if (await isDir(installPath))
        return installPath;

    }
  } catch (e) {
    console.error('Error when detecting osu! install path', e);
  }

  return null;
}

async function findOsuSongsPath(installPath: string) {
  const username = os.userInfo().username;

  const cfgPath = path.join(installPath, 'osu!.cfg');

  let songsPath = path.join(installPath, 'Songs');

  try {
    const cfg = await fs.readFile(cfgPath, 'utf-8');

    const match = cfg.match(/BeatmapDirectory = (.*)/);
    if (match) {
      songsPath = path.join(installPath, match[1]);
    }
  } catch (e) {
    console.error(`Failed to read osu!.${username}.cfg`, e);
  }

  if (await isDir(songsPath))
    return songsPath;

  return null;
}

async function findOsuSkinsPath(installPath: string) {
  const skinsPath = path.join(installPath, 'Skins');
  if (await isDir(skinsPath))
    return skinsPath;

  return null;
}

async function findOsuDBPath(installPath: string) {
  const dbPath = path.join(installPath, 'osu!.db');
  if (await canAccess(dbPath))
    return dbPath;

  return null;
}

export async function loadOsuStableInfo(): Promise<OsuStableInfo | null> {
  if (process.platform !== 'win32')
    return null;

  const installPath = await findOsuInstallPath();

  if (!installPath)
    return null;

  console.log(`Detected osu! install path at: ${installPath}`);

  const songsPath = await findOsuSongsPath(installPath);
  const skinsPath = await findOsuSkinsPath(installPath);
  const dbPath = await findOsuDBPath(installPath);

  if (!songsPath)
    console.warn('Failed to detect osu! songs path');

  if (!skinsPath)
    console.warn('Failed to detect osu! skins path');

  return {
    installPath,
    songsPath,
    skinsPath,
    dbPath,
  };
}

export interface OsuStableInfo {
  installPath: string;
  songsPath: string | null;
  skinsPath: string | null;
  dbPath: string | null;
}
