import type { Bindable } from '@osucad/framework';
import type { ISerializer } from '../ISerializer';
import type { ISummary } from '../ISummary';
import type { MutationContext } from '../MutationContext';
import { MutationSource } from '../MutationSource';
import { SharedStructure } from '../SharedStructure';
import { SharedProperty } from './SharedProperty';

interface ObjectMutation {
  [key: string]: any;
}

export interface ObjectSummary extends ISummary {
  data: {
    [key: string]: any;
  };
}

export abstract class SharedObject extends SharedStructure<ObjectMutation, ObjectSummary> {
  #properties = new Map<string, SharedProperty<any>>();

  protected constructor() {
    super();
  }

  protected property<T>(name: string, initialValue: T | Bindable<T>, serializer?: ISerializer<T, any>) {
    const property = new SharedProperty(this, name, initialValue, serializer);
    this.#properties.set(name, property);
    return property;
  }

  handle(command: ObjectMutation, ctx: MutationContext): ObjectMutation | null {
    const undoMutation: ObjectMutation = {};

    for (const key in command) {
      const property = this.#properties.get(key);
      if (!property)
        continue;

      undoMutation[key] = property.createSummary();

      if (this.#handleProperty(property, ctx))
        property.parse(command[key]);
    }

    if (Object.keys(undoMutation).length === 0)
      return null;

    return undoMutation;
  }

  #handleProperty(property: SharedProperty<any>, ctx: MutationContext): boolean {
    // If we have a change mode locally the property gets marked as pending. It will remain
    // in this state until the server has acknowledged the latest mutation
    // If a property is pending, all remote changes are discarded, since they reached the server
    // before the last mutation originating from this client.

    switch (ctx.source) {
      case MutationSource.Local:
        property.pendingVersion = ctx.version;
        return true;

      case MutationSource.Ack:
        if (property.pendingVersion === ctx.version)
          property.pendingVersion = undefined;
        return false;

      case MutationSource.Remote:
        return !property.hasPendingChanges;
    }
  }

  onPropertyChanged(property: SharedProperty<any>, oldValue: any, submitEvents: boolean) {
    if (submitEvents && this.isAttached) {
      const existing = this.currentTransaction?.getEntry(this.id);

      let undoMutation = { [property.name]: oldValue };

      if (existing) {
        undoMutation = {
          ...undoMutation,
          ...existing.undoMutation,
        };
      }

      this.submitMutation({
        [property.name]: property.createSummary(),
      }, undoMutation, this.id);
    }
  }

  override createSummary(): ObjectSummary {
    const summary: ObjectSummary = {
      id: this.id,
      data: {},
    };

    for (const property of this.#properties.values()) {
      if (!property.bindable.isDefault)
        summary.data[property.name] = property.createSummary();
    }

    return summary;
  }

  override initializeFromSummary(summary: ObjectSummary) {
    this.id = summary.id;

    for (const property of this.#properties.values()) {
      if (!(property.name in summary.data))
        continue;

      const value = summary.data[property.name];

      property.parse(value);
    }
  }
}
