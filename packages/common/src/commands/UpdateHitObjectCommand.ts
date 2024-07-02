import { CommandContext } from './CommandContext';
import { CommandHandler } from './CommandHandler';
import { IEditorCommand } from './IEditorCommand';
import { BaseCommand } from './BaseEditorCommand';
import { SerializedHitObject } from '../types';
import { HitObject } from '../osu';

export type HitObjectPatch = Partial<
  Omit<SerializedHitObject, 'id' | 'attribution'>
>;

export interface IUpdateHitObjectCommand extends IEditorCommand {
  id: HitObject['id'];
  patch: HitObjectPatch;
}

export class UpdateHitObjectCommand extends BaseCommand {
  id: HitObject['id'];
  patch: HitObjectPatch;

  constructor(id: HitObject['id'] | HitObject, patch: HitObjectPatch) {
    super(UpdateHitObjectHandler);
    if (id instanceof HitObject) {
      id = id.id;
    }

    this.id = id;

    this.patch = patch;
  }
}

export class UpdateHitObjectHandler extends CommandHandler<IUpdateHitObjectCommand> {
  get command(): string {
    return 'updateHitObject';
  }

  apply(
    { isLocal, hitObjects }: CommandContext,
    command: IUpdateHitObjectCommand,
    source: 'local' | 'remote',
  ): void {
    const hitObject = hitObjects.getById(command.id);

    if (!hitObject) return;

    if (isLocal) {
      hitObject.patch(command.patch);
      return;
    }

    if (source === 'remote') {
      const pending = this.#getPendingInfo(hitObject);
      const patch = {} as any;

      for (const key in command.patch) {
        if (key in pending) {
          patch[key] = Reflect.get(hitObject, key);
        }
      }

      hitObject.patch(patch);
    }

    for (const key in command.patch) {
      this.#setPendingInfo(hitObject, key, command.version);
    }

    hitObject.patch(command.patch);
  }

  acknowledge(ctx: CommandContext, command: IUpdateHitObjectCommand): void {
    const hitObject = ctx.hitObjects.getById(command.id);

    if (!hitObject) return;

    const pending = this.#getPendingInfo(hitObject);
    for (const key in command.patch) {
      if (pending[key] === command.version) {
        delete pending[key];
      }
    }
  }

  createUndoCommand(
    { hitObjects }: CommandContext,
    command: IUpdateHitObjectCommand,
  ): IEditorCommand | null {
    if (Object.keys(command.patch).length === 0) return null;

    const hitObject = hitObjects.getById(command.id);
    if (!hitObject) return null;

    const patch = {} as any;
    const serialized = hitObject.serialize() as any;
    for (const key in command.patch) {
      patch[key] = serialized[key];
    }
    return new UpdateHitObjectCommand(command.id, patch);
  }

  merge(
    ctx: CommandContext,
    current: IUpdateHitObjectCommand,
    other: IUpdateHitObjectCommand,
  ): IEditorCommand | null {
    if (current.id !== other.id) return null;

    return new UpdateHitObjectCommand(current.id, {
      ...current.patch,
      ...other.patch,
    });
  }

  #getPendingInfo(hitObject: HitObject & any) {
    if (!hitObject[key]) {
      (hitObject[key] as PendingInfo) = {};
    }
    return hitObject[key] as PendingInfo;
  }

  #setPendingInfo(hitObject: HitObject, key: string, version: number): void {
    this.#getPendingInfo(hitObject)[key] = version;
  }
}

const key = Symbol('pendingInfo');

interface PendingInfo {
  [key: string]: number;
}
