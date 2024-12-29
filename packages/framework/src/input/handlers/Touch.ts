import type { Vec2 } from '../../math';

export class Touch {
  constructor(
    readonly source: TouchSource,
    readonly position: Vec2,
  ) {}
}

export enum TouchSource {
  Touch1 = 0,
  Touch2 = 1,
  Touch3 = 2,
  Touch4 = 3,
  Touch5 = 4,
  Touch6 = 5,
  Touch7 = 6,
  Touch8 = 7,
  Touch9 = 8,
  Touch10 = 9,
}
