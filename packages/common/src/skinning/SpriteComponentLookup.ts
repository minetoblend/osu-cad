import type { Vec2 } from 'osucad-framework';

export class SpriteComponentLookup {
  constructor(
    readonly lookupName: string,
    readonly maxSize: Vec2,
  ) {}
}
