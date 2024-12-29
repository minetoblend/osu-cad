import type { ControlPointGroup } from '@osucad/common';
import type { Bindable } from 'osucad-framework';

export class TimingScreenDependencies {
  constructor(
    readonly activeControlPoint: Bindable<ControlPointGroup | null>,
  ) {}
}
