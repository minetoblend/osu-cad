import {
  HitObject,
  UpdateHitObjectCommand,
  deserializeHitObject,
} from '@osucad/common';
import { CommandManager } from '../context/CommandManager';

declare module '@osucad/common' {
  export interface HitObject extends HitObjectMixins {}
}

export interface HitObjectMixins {
  update(
    commandManager: CommandManager,
    updateFn: (hitObject: this) => void,
    commit?: boolean,
  ): void;
}

const hitObjectMixins: HitObjectMixins = {
  update(this: HitObject, commandManager, updateFn, commit = true) {
    const cloned = deserializeHitObject(this.serialize());

    updateFn(cloned);

    const patch = {} as Partial<HitObject> & any;

    const fullPatch = cloned.serialize();

    for (const key in fullPatch) {
      if ((fullPatch as any)[key] !== (this as any)[key]) {
        patch[key] = (fullPatch as any)[key];
      }
    }

    commandManager.submit(new UpdateHitObjectCommand(this, patch), commit);
  },
};

Object.assign(HitObject.prototype, hitObjectMixins);
