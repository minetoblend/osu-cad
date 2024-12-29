import type { IResourcesProvider, Skin } from '@osucad/common';
import { Bindable } from 'osucad-framework';

export abstract class SkinStore {
  readonly skins = new Bindable<LoadableSkin[]>([]);
}

export abstract class LoadableSkin {
  protected constructor(public name: string) {
  }

  abstract loadSkin(resources: IResourcesProvider): Promise<Skin>;
}
