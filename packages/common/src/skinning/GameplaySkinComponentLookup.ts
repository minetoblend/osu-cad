import type { ISkinComponentLookup } from './ISkinComponentLookup';

export class GameplaySkinComponentLookup<T> implements ISkinComponentLookup {
  constructor(readonly component: T) {
  }
}
