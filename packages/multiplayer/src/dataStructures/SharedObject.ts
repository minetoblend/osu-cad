import type { Bindable } from 'osucad-framework';
import { MutationSource } from './MutationSource';
import { SharedProperty } from './SharedProperty';
import { SharedStructure } from './SharedStructure';

interface ObjectMutation {
  version?: number;
  data: {
    [key: string]: any;
  };
}

export abstract class SharedObject extends SharedStructure<ObjectMutation> {
  #properties = new Map<string, SharedProperty<any>>();

  protected constructor() {
    super();
  }

  protected property<T>(name: string, initialValue: T | Bindable<T>) {
    const property = new SharedProperty(this, name, initialValue);
    this.#properties.set(name, property);
    return property;
  }

  #version = 0;

  handle(command: ObjectMutation, source: MutationSource): ObjectMutation | null {
    const undoMutation: ObjectMutation = {
      data: {},
    };

    if (source === MutationSource.Local)
      this.#version++;

    for (const key in command.data) {
      const property = this.#properties.get(key);
      if (!property)
        continue;

      undoMutation.data[key] = property.value;

      let shouldApply = true;

      if ((source === MutationSource.Remote || source === MutationSource.Ack) && property.hasPendingChanges)
        shouldApply = false;

      if (shouldApply)
        property.parse(command.data[key]);

      if (source === MutationSource.Local)
        property.pendingVersion = this.#version;
    }

    if (Object.keys(undoMutation).length === 0)
      return null;

    return undoMutation;
  }

  onPropertyChanged(property: SharedProperty<any>, oldValue: any, submitEvents: boolean) {
    if (submitEvents && this.isAttached) {
      const existing = this.currentTransaction?.getEntry(this.id);

      let undoMutation = {
        data: {
          [property.name]: oldValue,
        },
      };

      property.pendingVersion = ++this.#version;

      if (existing) {
        undoMutation = {
          ...undoMutation,
          ...existing.undoMutation,
        };
      }

      this.submitMutation({
        version: this.#version,
        data: {
          [property.name]: property.value,
        },
      }, undoMutation, this.id);
    }
  }
}
