import type { SerialDescriptor } from '../descriptor/SerialDescriptor';
import { TaggedEncoder } from './TaggedEncoder';

export abstract class NamedValueEncoder extends TaggedEncoder<string> {
  getTag(descriptor: SerialDescriptor, index: number): string {
    return this.nested(this.elementName(descriptor, index));
  }

  protected nested(nestedName: string) {
    return this.composeName(this.currentTagOrNull ?? '', nestedName);
  }

  protected elementName(descriptor: SerialDescriptor, index: number): string {
    return descriptor.getElementName(index);
  }

  protected composeName(parentName: string, childName: string): string {
    if (parentName.length === 0)
      return childName;

    return `${parentName}.${childName}`;
  }
}
