import type { HitObject } from '../../../../hitObjects/HitObject';
import type { OperatorContext } from './OperatorContext';
import { Action } from 'osucad-framework';
import { OperatorProperty } from './properties/OperatorProperty';

export interface OperatorOptions {
  readonly title: string;
}

export abstract class Operator<TObject extends HitObject = any> {
  protected constructor(options: OperatorOptions) {
    const { title } = options;
    this.title = title;
  }

  readonly invalidated = new Action<Operator>();

  readonly ended = new Action();

  expandByDefault = false;

  init() {
    for (const property of this.properties)
      property.bindable.bindValueChanged(() => this.invalidated.emit(this));
  }

  readonly title: string;

  abstract apply(context: OperatorContext<TObject>): void;

  get properties(): OperatorProperty<any>[] {
    const properties: OperatorProperty<any>[] = [];

    for (const key in this) {
      const value = this[key];
      if (value instanceof OperatorProperty)
        properties.push(value);
    }

    return properties;
  }
}
