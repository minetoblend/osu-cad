import { ITypeFactory, UnisonBaseRuntime } from "@osucad/unison";
import { track, trigger, TrackOpTypes, TriggerOpTypes } from "@vue/reactivity";

export class UnisonClientRuntime extends UnisonBaseRuntime {
  constructor(types?: ITypeFactory[]) {
    super();
    if (types) {
      for (const factory of types) {
        this.typeMap.set(factory.type, factory);
      }
    }
  }

  track(object: any, key: string, type?: string): void {
    track(this, type as TrackOpTypes, key);
  }

  trigger(object: any, key: string, value: any, type?: string): void {
    trigger(this, type as TriggerOpTypes, key, value);
  }
}
