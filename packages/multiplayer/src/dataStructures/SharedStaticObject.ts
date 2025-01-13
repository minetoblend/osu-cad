import { SharedStructure } from './SharedStructure';

export class SharedStaticObject extends SharedStructure {
  override handle(mutation: never): void {
    throw new Error('Object cannot be mutated.');
  }
}
