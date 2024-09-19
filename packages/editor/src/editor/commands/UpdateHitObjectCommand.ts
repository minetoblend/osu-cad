import type { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import type { HitObjectPatch } from '../../beatmap/serialization/HitObjects';
import { serializeHitObject } from '../../beatmap/serialization/HitObjects';
import { EditorCommand } from './EditorCommand';
import type { CommandContext } from './CommandContext';

export class UpdateHitObjectCommand<T extends OsuHitObject> extends EditorCommand {
  constructor(hitObject: T | string, readonly patch: HitObjectPatch<T>) {
    super();
    this.hitObject = typeof hitObject === 'string' ? hitObject : hitObject.id;
  }

  readonly hitObject: string;

  apply(ctx: CommandContext) {
    const hitObject = ctx.hitObjects.getById(this.hitObject);
    if (hitObject) {
      hitObject.applyPatch(this.patch);
    }
  }

  createUndo(ctx: CommandContext): EditorCommand | null {
    const hitObject = ctx.hitObjects.getById(this.hitObject);
    if (hitObject) {
      const patch = {} as Partial<HitObjectPatch<T>>;
      const serialized = serializeHitObject(hitObject) as any;

      for (const key in this.patch) {
        patch[key] = serialized[key];
      }
      return new UpdateHitObjectCommand(hitObject, patch as any);
    }
    return null;
  }

  get mergeKey(): string | null {
    return `update:hitobject:${this.hitObject}`;
  }

  mergeWith(ctx: CommandContext, other: EditorCommand): EditorCommand | null {
    if (other instanceof UpdateHitObjectCommand && other.hitObject === this.hitObject) {
      return new UpdateHitObjectCommand(this.hitObject, {
        ...this.patch,
        ...other.patch,
      } as any);
    }

    return null;
  }
}