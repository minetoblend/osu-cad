import { Action } from 'osucad-framework';
import type { CommandManager } from '../context/CommandManager';
import type { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { UpdateHitObjectCommand } from './UpdateHitObjectCommand';

export type CommandProxyable = OsuHitObject;

export type CommandProxy<T extends CommandProxyable> = T & {
  flush: () => void;
  dispose: () => void;
  onDispose: Action;
};

export function createCommandProxy<T extends CommandProxyable>(
  commandManager: CommandManager,
  object: T,
): CommandProxy<T> {
  let pendingChanges: Partial<T> = {};

  const encoder = object.createPatchEncoder();

  const onDispose = new Action();

  const flush = () => {
    if (encoder.hasChanges)
      commandManager.submit(new UpdateHitObjectCommand(object, encoder.getPatch(true) as any), false);
    pendingChanges = {};
  };

  const dispose = () => {
    flush();
    onDispose.emit();
  };

  const proxy = new Proxy(object, {
    get(target: T, p: string | symbol, receiver: any): any {
      const pending = Reflect.get(pendingChanges, p);
      if (pending !== undefined) {
        return pending;
      }

      switch (p) {
        case 'onDispose':
          return onDispose;
        case 'flush':
          return flush;
        case 'dispose':
          return dispose;
      }

      return Reflect.get(target, p);
    },
    set(target: T, p: string | symbol, newValue: any, receiver: any): boolean {
      if (typeof p === 'string') {
        if (encoder.add(p as any, newValue)) {
          Reflect.set(pendingChanges, p, newValue);
          return true;
        }
      }
      Reflect.set(target, p, newValue, receiver);

      return true;
    },
    getPrototypeOf(target: T): object | null {
      return Object.getPrototypeOf(target);
    },
  });

  return proxy as CommandProxy<T>;
}
