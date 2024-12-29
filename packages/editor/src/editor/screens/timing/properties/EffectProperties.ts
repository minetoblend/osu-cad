import type { ControlPointGroup, EffectPoint } from '@osucad/common';
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
