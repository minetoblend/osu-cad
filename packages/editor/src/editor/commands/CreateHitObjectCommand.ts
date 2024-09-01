import type { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import type { SerializedOsuHitObject } from '../../beatmap/serialization/HitObjects';
import { deserializeHitObject, serializeHitObject } from '../../beatmap/serialization/HitObjects';

import { EditorCommand } from './EditorCommand';
import type { CommandContext } from './CommandContext';
import { DeleteHitObjectCommand } from './DeleteHitObjectCommand';

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
