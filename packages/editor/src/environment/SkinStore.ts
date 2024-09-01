import { Bindable } from 'osucad-framework';
import type { ISkin } from '../skinning/ISkin';
import type { IResourcesProvider } from '../io/IResourcesProvider';

export abstract class SkinStore {
  protected abstract loadSkins(): Promise<SkinProvider[]>;

  async load() {
    try {
      this.skins.value = [...await this.loadSkins()];
    }
    catch (e) {
      console.error('Failed to load skins', e);
    }
  }

  readonly skins = new Bindable<SkinProvider[]>([]);
}

export abstract class SkinProvider {
  protected constructor(public name: string) {
  }

  abstract loadSkin(resources: IResourcesProvider): Promise<ISkin>;
}
