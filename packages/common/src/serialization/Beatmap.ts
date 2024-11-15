import { Beatmap } from '../beatmap/Beatmap';
import { CommandContext } from '../commands/CommandContext';
import { ControlPointGroup } from '../controlPoints/ControlPointGroup';
import { serializeControlPointGroup } from './ControlPoints';
import { deserializeHitObject, serializeHitObject } from './HitObjects';

export function serializeBeatmap(beatmap: Beatmap) {
  return {
    hitObjects: beatmap.hitObjects.items.filter(it => !it.synthetic).map(serializeHitObject),
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
