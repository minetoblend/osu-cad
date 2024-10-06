import { CommandContext } from '../../editor/commands/CommandContext.ts';
import { Beatmap } from '../Beatmap.ts';
import { ControlPointGroup } from '../timing/ControlPointGroup.ts';
import { serializeControlPointGroup } from './ControlPoints.ts';
import { deserializeHitObject, serializeHitObject } from './HitObjects.ts';

export function serializeBeatmap(beatmap: Beatmap) {
  return {
    hitObjects: beatmap.hitObjects.items.map(serializeHitObject),
    controlPoints: beatmap.controlPoints.groups.items.map(serializeControlPointGroup),
    difficulty: beatmap.difficulty.asPatch(),
    settings: structuredClone(beatmap.settings), // TODO
  };
}

export function deserializeBeatmap(data: ReturnType<typeof serializeBeatmap>): Beatmap {
  const beatmap = new Beatmap();

  const ctx = new CommandContext(beatmap, true);

  Object.assign(beatmap.settings, data.settings);
  beatmap.difficulty.applyPatch(data.difficulty, ctx);

  for (const t of data.controlPoints) {
    const group = new ControlPointGroup();
    group.applyPatch(t, ctx);

    beatmap.controlPoints.add(group);
  }

  for (const h of data.hitObjects) {
    beatmap.hitObjects.add(deserializeHitObject(h));
  }

  return beatmap;
}
