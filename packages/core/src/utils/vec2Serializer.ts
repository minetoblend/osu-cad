import type { ISerializer } from '@osucad/multiplayer';
import { Vec2 } from '@osucad/framework';

export const vec2Serializer: ISerializer<Vec2, [number, number]> = {
  serialize: (value: Vec2) => {
    return [
      Math.round(value.x * 1000) / 1000,
      Math.round(value.y * 1000) / 1000,
    ];
  },
  deserialize(plain: [number, number]): Vec2 {
    return new Vec2(plain[0], plain[1]);
  },
};
