import type { ControlPointFlags } from './ControlPointFlags';

export interface IControlPoint {
  id: string;
  startTime: number;
  flags: ControlPointFlags;
}
