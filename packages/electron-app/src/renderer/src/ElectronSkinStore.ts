import { LoadableSkin, SkinStore } from '@osucad/editor';
import { LazyStableResourceStore } from './LazyStableResourceStore';
import { IResourcesProvider, ISkin, StableSkin } from '@osucad/common';

export class ElectronSkinStore extends SkinStore {
  async load() {
    if (!window.api.stableDetected) {
      console.warn('Stable not detected, skipping skin load');
      return;
    }

    const skins = await window.api.loadSkins() ?? [];

    skins.sort((a, b) => a.name.localeCompare(b.name))

    console.log(`Found ${skins.length} skins`);

    this.skins.value = skins.map(skinInfo => new StableSkinInfo(skinInfo));
  }
}

class StableSkinInfo extends LoadableSkin {
  constructor(skinInfo: ElectronSkinInfo) {
    super(skinInfo.name);

    this.path = skinInfo.path;
  }

  path: string;

  async loadSkin(resources: IResourcesProvider): Promise<ISkin> {
    const store = await LazyStableResourceStore.create(this.path);

    const skin = new StableSkin({ name: this.name, creator: '' }, resources, store ?? undefined);

    performance.mark('loadSkin')

    await skin.load();

    performance.measure('loadSkin', 'loadSkin')

    return skin;
  }
}
