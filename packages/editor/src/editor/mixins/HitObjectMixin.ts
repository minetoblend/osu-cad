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
    const setKeys = new Set<string>();

    const proxy = new Proxy(cloned, {
      set: (target, prop, value) => {
        setKeys.add(prop as string);

        return Reflect.set(target, prop, value);
      },
    });

    updateFn(proxy);

    const patch = {} as Partial<HitObject> & any;

    const fullPatch = cloned.serialize();

    for (const key of setKeys) {
      patch[key] = (fullPatch as any)[key];
    }

    commandManager.submit(new UpdateHitObjectCommand(this, patch), commit);
  },
};

Object.assign(HitObject.prototype, hitObjectMixins);
