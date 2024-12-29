import { Invalidation, InvalidationSource } from './Drawable';

export class InvalidationState {
  constructor(initialState: Invalidation) {
    this.#selfInvalidation = initialState;
    this.#parentInvalidation = initialState;
    this.#childInvalidation = initialState;
  }

  #selfInvalidation: Invalidation;
  #parentInvalidation: Invalidation;
  #childInvalidation: Invalidation;

  invalidate(flags: Invalidation, source: InvalidationSource): boolean {
    switch (source) {
      case InvalidationSource.Self:
        return this.#invalidateSelf(flags);
        break;
      case InvalidationSource.Parent:
        return this.#invalidateParent(flags);
        break;
      case InvalidationSource.Child:
        return this.#invalidateChild(flags);
        break;
      default:
        throw new Error(`Invalid InvalidationSource: ${source}`);
    }
  }

  #invalidateSelf(flags: Invalidation): boolean {
    const combined = this.#selfInvalidation | (flags & Invalidation.Layout);
    const result = (this.#selfInvalidation & flags) !== flags;
    this.#selfInvalidation = combined;
    return result;
  }

  #invalidateParent(flags: Invalidation): boolean {
    const combined = this.#parentInvalidation | (flags & Invalidation.Layout);
    const result = (this.#parentInvalidation & flags) !== flags;
    this.#parentInvalidation = combined;
    return result;
  }

  #invalidateChild(flags: Invalidation): boolean {
    const result = (this.#childInvalidation & flags) !== flags;
    this.#childInvalidation |= flags & Invalidation.Layout;
    return result;
  }

  validate(flags: Invalidation): boolean {
    // if (this.#validateSelf(flags)) {
    //   anyValidated = true;
    // }
    // if (this.#validateParent(flags)) {
    //   anyValidated = true;
    // }
    // if (this.#validateChild(flags)) {
    //   anyValidated = true;
    // }

    const anyValidated = ((this.#selfInvalidation | this.#parentInvalidation | this.#childInvalidation) & flags) !== flags;

    flags = ~flags;

    this.#selfInvalidation &= flags;

    this.#parentInvalidation &= flags;

    this.#childInvalidation &= flags;

    return anyValidated;
  }

  #validateSelf(flags: Invalidation): boolean {
    const result = (this.#selfInvalidation & flags) !== flags;
    this.#selfInvalidation &= ~flags;
    return result;
  }

  #validateParent(flags: Invalidation): boolean {
    const result = (this.#parentInvalidation & flags) !== flags;
    this.#parentInvalidation &= ~flags;
    return result;
  }

  #validateChild(flags: Invalidation): boolean {
    const result = (this.#childInvalidation & flags) !== flags;
    this.#childInvalidation &= ~flags;
    return result;
  }
}
