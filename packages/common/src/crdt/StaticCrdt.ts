import { AbstractCrdt } from './AbstractCrdt';

export class StaticCrdt extends AbstractCrdt {
  override handle(mutation: never): void {
    throw new Error('Object cannot be mutated.');
  }
}
