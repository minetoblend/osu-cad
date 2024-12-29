import { promisified as regedit } from 'regedit';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import log from 'electron-log/main';

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

async function searchPathForOsuInstall(defaultPath: string) {
  if (await isDir(defaultPath) && await canAccess(path.join(defaultPath, 'osu!.db')))
    return defaultPath;

  log.warn(`No osu! install directory found at ${defaultPath}`);

  return null;
}

async function findOsuInstallPathWin32() {
  try {
    const registryKey = 'HKCR\\osu!\\shell\\open\\command';

    log.info(`Checking for osu! install path in windows registry`);

    const results = await regedit.list([registryKey]);
    const result = results[registryKey];

    if (result.exists && typeof result.values[''].value === 'string') {
      const installPath = result.values[''].value
        .replace(/"/g, '')
        .split(' ')[0]
        .replace(/osu!.exe/, '');

      log.info(`Found osu! install path in windows registry at: ${installPath}`);

      // Trying to access the install path to make sure it's valid
      if (await isDir(installPath) && await canAccess(path.join(installPath, 'osu!.db')))
        return installPath;

      log.warn(`osu! install path from registry was not a valid osu! install directory`)
    }
  } catch (e) {
    log.error('Error when checking for osu! install path in registry', e);
  }

  const username = os.userInfo().username;

  const fallbackPath = `C:\\Users\\${username}\\AppData\\Local\\osu!`;

  log.info(`Falling back to osu! install path at ${fallbackPath}`);

  return await searchPathForOsuInstall(fallbackPath);
}

async function findOsuInstallPathLinux() {
  const defaultPath = path.join(os.homedir(), '.local/share/osu-wine/osu!');

  return await searchPathForOsuInstall(defaultPath);
}

async function findOsuInstallPathDarwin() {
  const defaultPath = '/Applications/osu!.app/Contents/Resources/drive_c/osu!';

  return await searchPathForOsuInstall(defaultPath);
}

async function findOsuInstallPath() {
  switch (process.platform) {
    case 'win32':
      return findOsuInstallPathWin32();
    case 'linux':
      return findOsuInstallPathLinux();
    case 'darwin':
      return findOsuInstallPathDarwin();
    default:
      return null;
  }
}

async function findOsuSongsPath(installPath: string) {
  const username = os.userInfo().username;

  const cfgPath = path.join(installPath, `osu!.${username}.cfg`);

  let songsPath = path.join(installPath, 'Songs');

  try {
    log.info(`Checking for osu! songs path in ${cfgPath}`);

    const cfg = await fs.readFile(cfgPath, 'utf-8');

    const match = cfg.match(/BeatmapDirectory = (.*)/);
    if (match) {
      const songDir = match[1].trim();

      if (path.isAbsolute(songDir))
        songsPath = songDir;
      else
        songsPath = path.join(installPath, songDir);

      if (await isDir(songsPath))
        return songsPath;

      log.warn(`osu! songs path in ${cfgPath} was invalid`);
    }
  } catch (e) {
    console.error(`Failed to read osu!.${username}.cfg`, e);
  }

  if (await isDir(songsPath))
    return songsPath;

  log.warn(`No osu! songs path found at default location: ${songsPath}`);

  return null;
}

async function findOsuSkinsPath(installPath: string) {
  const skinsPath = path.join(installPath, 'Skins');
  if (await isDir(skinsPath))
    return skinsPath;

  log.warn(`osu! skins path not found at default location: ${skinsPath}`);

  return null;
}

async function findOsuDBPath(installPath: string) {
  const dbPath = path.join(installPath, 'osu!.db');
  if (await canAccess(dbPath))
    return dbPath;

  log.warn(`osu! database file not found at default location: ${dbPath}`);

  return null;
}

export async function loadOsuStableInfo(): Promise<OsuStableInfo | null> {
  if (process.platform !== 'win32')
    return null;

  const installPath = await findOsuInstallPath();

  if (!installPath)
    return null;

  log.info(`Detected osu! install path at: ${installPath}`);

  const songsPath = await findOsuSongsPath(installPath);
  const skinsPath = await findOsuSkinsPath(installPath);
  const dbPath = await findOsuDBPath(installPath);

  if (songsPath)
    log.info(`Detected osu! songs path at: ${songsPath}`);

  if (skinsPath)
    log.info(`Detected osu! skins path at: ${skinsPath}`);

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
