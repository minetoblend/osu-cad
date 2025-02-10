import type { SharedObject } from '@osucad/multiplayer';

export class SharedObjectChangeEvent {
  constructor(
    readonly object: SharedObject,
    readonly propertyName: string,
  ) {
  }
}
