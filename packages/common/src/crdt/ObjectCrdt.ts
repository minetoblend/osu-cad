import { AbstractCrdt } from './AbstractCrdt';
import { Property } from './Property';

interface ObjectMutation {
  [key: string]: any;
}

export abstract class ObjectCrdt extends AbstractCrdt<ObjectMutation> {
  #properties = new Map<string, Property<any>>();

  protected constructor() {
    super();
  }

  protected property<T>(name: string, initialValue: T) {
    const property = new Property(this, name, initialValue);
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

  onPropertyChanged(property: Property<any>, oldValue: any) {
    this.submitMutation({
      [property.name]: property.value,
    }, {
      [property.name]: oldValue,
    });
  }
}
