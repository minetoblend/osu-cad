import type { AssetInfo } from '@osucad/multiplayer';
import fs from 'node:fs/promises';
import { resolve } from 'node:path';
import { v4 as uuid } from 'uuid';

const beatmapDir = './beatmap';

const assetMap = new Map<string, string>();

export async function loadAssets() {
  const entries = await fs.readdir('./beatmap');

  for (const filename of entries) {
    const id = uuid();
    assetMap.set(id, filename);
  }

  console.log('Assets loaded');
}

export function getAssetPath(id: string): string | null {
  const path = assetMap.get(id);
  if (path)
    return resolve(beatmapDir, path);

  return null;
}

export function getAssets(): AssetInfo[] {
  return [...assetMap.entries()].map(([id, path]) => {
    return {
      id,
      path,
      filesize: 0,
    };
  });
}
