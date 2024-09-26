import type { ControlPointGroup } from '../../../../beatmap/timing/ControlPointGroup.ts';
import type { EffectPoint } from '../../../../beatmap/timing/EffectPoint.ts';
import { ControlPointPropertiesSection } from './ControlPointPropertiesSection';

export class EffectProperties extends ControlPointPropertiesSection<EffectPoint> {
  constructor() {
    super('Effects');
  }

  createContent(): void {}

  protected getControlPointFromGroup(group: ControlPointGroup): EffectPoint | null {
    return group.effect;
  }

  createControlPoint(): EffectPoint {
    return this.controlPointInfo.effectPointAt(this.groupTime).deepClone();
  }
}
