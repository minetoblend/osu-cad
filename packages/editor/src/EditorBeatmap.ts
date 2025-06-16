import type { Beatmap, HitObject } from "@osucad/core";
import { Action } from "@osucad/framework";

export class EditorBeatmap
{
  public readonly added = new Action<HitObject>();
  public readonly removed = new Action<HitObject>();

  constructor(readonly beatmap: Beatmap)
  {
  }

  public add(hitObject: HitObject)
  {
    this.beatmap.hitObjects.push(hitObject);
    this.added.emit(hitObject);
  }

  public remove(hitObject: HitObject)
  {
    const index = this.beatmap.hitObjects.indexOf(hitObject);
    if (index < 0)
      return false;

    this.beatmap.hitObjects.splice(index, 1);
    this.removed.emit(hitObject);
    return true;
  }

  public get hitObjects(): readonly HitObject[]
  {
    return this.beatmap.hitObjects;

  }
}
