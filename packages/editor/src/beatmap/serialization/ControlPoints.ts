import type { ControlPointGroup } from '../timing/ControlPointGroup.ts';

export function serializeControlPointGroup(group: ControlPointGroup) {
  return group.asPatch();
}
