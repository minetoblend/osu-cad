import type { HitObject } from '../../beatmap/hitObjects/HitObject';
import type { CommandContext } from './CommandContext';
import { CreateHitObjectCommand } from './CreateHitObjectCommand';
import { EditorCommand } from './EditorCommand';

export class DeleteHitObjectCommand extends EditorCommand {
  constructor(hitObject: HitObject | string) {
    super();

    this.hitObject = typeof hitObject === 'string' ? hitObject : hitObject.id;
  }

  readonly hitObject: string;

  apply(ctx: CommandContext): void {
    const hitObject = ctx.hitObjects.getById(this.hitObject);
    if (hitObject) {
      ctx.hitObjects.remove(hitObject);
    }
  }

  createUndo(ctx: CommandContext): EditorCommand | null {
    const hitObject = ctx.hitObjects.getById(this.hitObject);
    if (hitObject) {
      return new CreateHitObjectCommand(hitObject);
    }

    return null;
  }
}
