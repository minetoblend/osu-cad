import fs from 'node:fs/promises';
import path from 'node:path';
import type { Skin } from '../skinning/Skin';
import { SkinProvider, SkinStore } from '../environment/SkinStore';
import { StableSkin } from '../skinning/stable/StableSkin';
import type { IResourcesProvider } from '../io/IResourcesProvider';
import { ElectronResourceStore } from './ElectronResourceStore';

export class ElectronSkinStore extends SkinStore {
  constructor(readonly directory: string) {
    super();
  }

  protected override async loadSkins() {
    const skins: SkinProvider[] = [];

    try {
      const dir = await fs.opendir(this.directory);

      for await (const dirent of dir) {
        if (!dirent.isDirectory())
          continue;

        skins.push(new StableSkinInfo(dirent.name, path.join(this.directory, dirent.name)));
      }
    }
    catch (e) {
      console.error('Failed to load skins', e);
    }

    return skins;
  }
}

class StableSkinInfo extends SkinProvider {
  constructor(name: string, readonly path: string) {
    super(name);
  }

  async loadSkin(resources: IResourcesProvider): Promise<Skin> {
    const store = new ElectronResourceStore(this.path);
    await store.load();
    const skin = new StableSkin({ name: 'Default', creator: '' }, resources, store);
    await skin.load();
    return skin;
  }
}
