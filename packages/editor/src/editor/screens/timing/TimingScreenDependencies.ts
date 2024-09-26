import type { Bindable } from 'osucad-framework';
import type { ControlPointGroup } from '../../../beatmap/timing/ControlPointGroup.ts';

export class TimingScreenDependencies {
  constructor(
    readonly activeControlPoint: Bindable<ControlPointGroup | null>,
  ) {}
}
