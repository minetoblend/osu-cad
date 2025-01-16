import type { ISerializer } from '@osucad/multiplayer';
import { Vec2 } from 'osucad-framework';

export const vec2Serializer: ISerializer<Vec2, [number, number]> = {
  serialize: (value: Vec2) => [value.x, value.y],
  deserialize(plain: [number, number]): Vec2 {
    return new Vec2(plain[0], plain[1]);
  },
};
