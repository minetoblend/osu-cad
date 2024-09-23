import type { IResourceStore } from '../../io/stores/IResourceStore.ts';
import type { Sample } from './Sample.ts';

export interface ISampleStore extends IResourceStore<Sample> {
  addExtension: (extension: string) => void;
}
