import type { Bindable } from 'osucad-framework';
import { SharedProperty } from './SharedProperty';
import { SharedStructure } from './SharedStructure';

interface ObjectMutation {
  [key: string]: any;
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

  handle(command: ObjectMutation): ObjectMutation | null {
    const undoMutation: ObjectMutation = {};
    for (const key in command) {
      const property = this.#properties.get(key);
      if (!property)
        continue;

      undoMutation[key] = property.value;

      property.parse(command[key]);
    }

    if (Object.keys(undoMutation).length === 0)
      return null;

    return undoMutation;
  }

  onPropertyChanged(property: SharedProperty<any>, oldValue: any, submitEvents: boolean) {
    if (submitEvents && this.isAttached) {
      const existing = this.currentTransaction?.getEntry(this.id);

      let undoMutation = {
        [property.name]: oldValue,
      };

      if (existing) {
        undoMutation = {
          ...undoMutation,
          ...existing.undoMutation,
        };
      }

      this.submitMutation({
        [property.name]: property.value,
      }, undoMutation, this.id);
    }
  }
}
