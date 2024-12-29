import type { ControlPointGroup } from '../controlPoints/ControlPointGroup';

export function serializeControlPointGroup(group: ControlPointGroup) {
  return group.asPatch();
}
