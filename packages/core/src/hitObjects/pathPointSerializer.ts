import type { ISerializer } from '@osucad/multiplayer';
import type { PathType } from './PathType';
import { Vec2 } from '@osucad/framework';
import { PathPoint } from './PathPoint';

export const pathPointSerializer: ISerializer<PathPoint, [number, number, PathType | null]> = {
  serialize(value) {
    return [Math.round(value.position.x * 10) / 10, Math.round(value.position.y * 10) / 10, value.type];
  },
  deserialize(value) {
    return new PathPoint(new Vec2(value[0], value[1]), value[2]);
  },
};
