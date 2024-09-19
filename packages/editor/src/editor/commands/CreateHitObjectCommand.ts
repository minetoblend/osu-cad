import type { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import type { SerializedOsuHitObject } from '../../beatmap/serialization/HitObjects';
import type { CommandContext } from './CommandContext';

import { deserializeHitObject, serializeHitObject } from '../../beatmap/serialization/HitObjects';
import { DeleteHitObjectCommand } from './DeleteHitObjectCommand';
import { EditorCommand } from './EditorCommand';

export class CreateHitObjectCommand extends EditorCommand {
  constructor(hitObject: OsuHitObject) {
    super();

    this.hitObject = serializeHitObject(hitObject);
  }

  readonly hitObject: SerializedOsuHitObject;

  apply(ctx: CommandContext) {
    ctx.hitObjects.add(deserializeHitObject(this.hitObject));
  }

  createUndo(): EditorCommand | null {
    return new DeleteHitObjectCommand(this.hitObject.id);
  }
}
