import type { ReadonlyDependencyContainer } from 'osucad-framework';
import type { HitObject } from '../../../../hitObjects/HitObject';
import type { OperatorContext } from './OperatorContext';
import { Action, Component } from 'osucad-framework';
import { OperatorProperty } from './properties/OperatorProperty';

export interface OperatorOptions {
  readonly title: string;
}

export abstract class Operator<TObject extends HitObject = any> extends Component {
  protected constructor(options: OperatorOptions) {
    super();
    const { title } = options;
    this.title = title;
  }

  readonly propertyChanged = new Action<Operator>();

  readonly ended = new Action();

  prominent = false;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    for (const property of this.properties)
      property.bindable.bindValueChanged(() => this.propertyChanged.emit(this));
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
