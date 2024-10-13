import type { ControlPointGroup } from '../timing/ControlPointGroup';

export function serializeControlPointGroup(group: ControlPointGroup) {
  return group.asPatch();
}
