import { CommandHandler } from '../command';
import { SerializedHitObject } from '../../types';
import { HitObject } from '../../osu';
import { EditorCommand } from './index';

export interface UpdateHitObjectCommand {
  hitObject: string;
  update: Partial<SerializedHitObject>;
}

const key = '_pendingInfo';

interface PendingInfo {
  [key: string]: number;
}

export const UpdateHitObjectHandler: CommandHandler<UpdateHitObjectCommand> = {
  apply(command, context): void {
    const hitObject = context.hitObjects.getById(command.hitObject);
    if (!hitObject) return;

    if (context.local) {
      for (const key in command.update) {
        setPendingInfo(hitObject, key, context.version);
      }
      hitObject.patch(command.update);
    } else if (context.own) {
      const pending = getPendingInfo(hitObject);
      for (const key in command.update) {
        if (pending[key] === context.version) {
          delete pending[key];
        }
      }
    } else {
      const pending = getPendingInfo(hitObject);
      const update = {} as any;
      for (const key in command.update) {
        if (pending[key] === undefined) {
          update[key] = command.update[key];
        }
      }
      hitObject.patch(update);
    }
  },
  createUndo(command, context) {
    const hitObject = context.hitObjects.getById(command.hitObject);
    if (!hitObject) return;

    const update = {} as any;
    const serialized = hitObject.serialize();
    for (const key in command.update) {
      update[key] = serialized[key];
    }
    return {
      type: 'updateHitObject',
      hitObject: command.hitObject,
      update: update,
    };
  },
  merge(
    a: UpdateHitObjectCommand,
    b: UpdateHitObjectCommand,
  ): EditorCommand | undefined {
    if (a.hitObject === b.hitObject) {
      return {
        type: 'updateHitObject',
        hitObject: a.hitObject,
        update: {
          ...a.update,
          ...b.update,
        },
      };
    }
  },
};

function getPendingInfo(hitObject: HitObject) {
  if (!hitObject[key]) {
    (hitObject[key] as PendingInfo) = {};
  }
  return hitObject[key] as PendingInfo;
}

function setPendingInfo(hitObject: HitObject, key: string, version: number) {
  getPendingInfo(hitObject)[key] = version;
}
