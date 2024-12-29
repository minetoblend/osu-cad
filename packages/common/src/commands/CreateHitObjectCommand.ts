import type { OsuHitObject } from '../rulesets/osu/hitObjects/OsuHitObject';
import type { SerializedOsuHitObject } from '../serialization';
import type { CommandContext } from './CommandContext';
import { deserializeHitObject, serializeHitObject } from '../serialization';
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
