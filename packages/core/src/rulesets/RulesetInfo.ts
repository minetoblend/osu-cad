import type { NoArgsConstructor } from '../utils/Constructor';
import type { Ruleset } from './Ruleset';

export class RulesetInfo {
  constructor(
    readonly shortName: string = '',
    readonly name: string = '',
    type?: NoArgsConstructor<Ruleset>,
  ) {
    this.#type = type;
  }

  readonly #type?: NoArgsConstructor<Ruleset>;

  get available() {
    return !!this.#type;
  }

  createInstance(): Ruleset {
    if (!this.#type)
      throw new Error('Ruleset is not available');

    return new this.#type();
  }

  equals(other: RulesetInfo) {
    return other === this || other.shortName === this.shortName;
  }
}
