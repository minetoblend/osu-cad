const { resolve } = require('node:path');
const regedit = require('regedit').promisified;

export class StablePaths {
  async load() {
    this.osuInstallPath = await this.getOsuInstallPath();
  }

  osuInstallPath: string | null = null;

  async getOsuInstallPath(): Promise<string | null> {
    if (process.platform === 'win32') {
      return this.getOsuInstallPathFromRegistry();
    }

    return null;
  }

  async getOsuInstallPathFromRegistry(): Promise<string | null> {
    const registryKey = 'HKCR\\osu!\\shell\\open\\command';
    const results = await regedit.list(registryKey);
    const result = results[registryKey];
    if (result.exists) {
      return result.values[''].value
        .replace(/"/g, '')
        .split(' ')[0]
        .replace(/osu!.exe/, '');
    }

    return null;
  }

  #resolve(path: string): string | null {
    if (this.osuInstallPath === null) {
      return null;
    }

    return resolve(this.osuInstallPath, path);
  }

  get osuDBPath(): string | null {
    return this.#resolve('osu!.db');
  }

  get songsPath(): string | null {
    return this.#resolve('songs');
  }

  get skinsPath(): string | null {
    return this.#resolve('skins');
  }
}
