import type { HitObject } from '../../../../hitObjects/HitObject';
import { OperatorProperty } from './properties/OperatorProperty';

export interface OperatorOptions {
  readonly title: string;
}

export abstract class Operator<TObject extends HitObject = any> {
  protected constructor(options: OperatorOptions) {
    const { title } = options;
    this.title = title;
  }

  readonly title: string;

  abstract apply(): void;

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
