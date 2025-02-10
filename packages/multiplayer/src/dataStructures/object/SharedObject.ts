import type { Bindable } from '@osucad/framework';
import type { ISequencedDocumentMessage } from '../../interfaces/messages';
import type { ISerializer } from '../ISerializer';
import type { ISummary } from '../ISummary';
import type { SharedObjectChangeEvent } from './SharedObjectChangeEvent';
import { Action } from '@osucad/framework';
import { SharedStructure } from '../SharedStructure';
import { SharedProperty } from './SharedProperty';

interface IObjectSetMessage {
  [key: string]: any;
}

export interface ObjectSummary extends ISummary {
  data: {
    [key: string]: any;
  };
}

export abstract class SharedObject extends SharedStructure<IObjectSetMessage, ObjectSummary> {
  readonly changed = new Action<SharedObjectChangeEvent>();

  #properties = new Map<string, SharedProperty<any>>();

  protected constructor() {
    super();
  }

  protected property<T>(name: string, initialValue: T | Bindable<T>, serializer?: ISerializer<T, any>) {
    const property = new SharedProperty(this, name, initialValue, serializer);
    this.#properties.set(name, property);
    return property;
  }

  override process(message: ISequencedDocumentMessage, local: boolean) {
    const op = message.contents as IObjectSetMessage;
    for (const key in op) {
      const property = this.#properties.get(key);
      if (!property)
        continue;

      let pendingVersion = property.pendingVersion;
      if (pendingVersion !== undefined) {
        if (local) {
          pendingVersion--;

          if (pendingVersion === 0)
            property.pendingVersion = undefined;
          else
            property.pendingVersion = pendingVersion;
        }

        return;
      }

      property.parse(op[key], false);
    }
  }

  override replayOp(contents: unknown) {
    const op = contents as IObjectSetMessage;

    for (const key in op) {
      const property = this.#properties.get(key);
      if (!property)
        continue;

      property.parse(contents);
    }
  }

  submitPropertyChanged(property: SharedProperty<any>, oldValue: any) {
    if (!this.isAttached)
      return;

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
