import { SkinProvider, SkinStore } from '@osucad/editor';
import { IResourcesProvider } from '../../../../editor/src/io/IResourcesProvider';
import { ISkin } from '../../../../editor/src/skinning/ISkin';
import { StableSkin } from '../../../../editor/src/skinning/stable/StableSkin';
import { LazyStableResourceStore } from './LazyStableResourceStore';

export class ElectronSkinStore extends SkinStore {
  async load() {
    if (!window.api.stableDetected) {
      console.warn('Stable not detected, skipping skin load');
      return;
    }

    const skins = await window.api.loadSkins() ?? [];

    console.log(`Found ${skins.length} skins`);

    this.skins.value = skins.map(skinInfo => new StableSkinInfo(skinInfo));
  }
}

class StableSkinInfo extends SkinProvider {
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
