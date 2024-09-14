import { Bindable } from 'osucad-framework';
import type { ISkin } from '../skinning/ISkin';
import type { IResourcesProvider } from '../io/IResourcesProvider';

export abstract class SkinStore {
  readonly skins = new Bindable<SkinProvider[]>([]);
}

export abstract class SkinProvider {
  protected constructor(public name: string) {
  }

  abstract loadSkin(resources: IResourcesProvider): Promise<ISkin>;
}
