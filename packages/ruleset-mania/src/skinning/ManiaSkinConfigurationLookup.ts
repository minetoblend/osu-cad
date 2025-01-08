import type { LegacyManiaSkinConfigurationLookups } from './LegacyManiaSkinConfigurationLookups';
import { SkinConfigurationLookup } from '@osucad/common';

export class ManiaSkinConfigurationLookup<T> extends SkinConfigurationLookup<T> {
  constructor(readonly lookup: LegacyManiaSkinConfigurationLookups, readonly columnIndex?: number) {
    super();
  }
}
