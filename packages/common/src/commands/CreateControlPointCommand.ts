import type { DifficultyPointPatch } from '../controlPoints/DifficultyPoint';
import type { EffectPointPatch } from '../controlPoints/EffectPoint';
import type { SamplePointPatch } from '../controlPoints/SamplePoint';
import type { TimingPointPatch } from '../controlPoints/TimingPoint';
import type { CommandContext } from './CommandContext';
import type { CommandSource } from './CommandSource';
import { ControlPointGroup } from '../controlPoints/ControlPointGroup';
import { DifficultyPoint } from '../controlPoints/DifficultyPoint';
import { EffectPoint } from '../controlPoints/EffectPoint';
import { SamplePoint } from '../controlPoints/SamplePoint';
import { TimingPoint } from '../controlPoints/TimingPoint';
import { objectId } from '../utils/objectId';
import { DeleteControlPointCommand } from './DeleteControlPointCommand';
import { EditorCommand } from './EditorCommand';

export interface CreateControlPointOptions {
  id?: string;
  time: number;
  timing?: TimingPointPatch;
  sample?: SamplePointPatch;
  effect?: EffectPointPatch;
  difficulty?: DifficultyPointPatch;
}

export class CreateControlPointCommand extends EditorCommand {
  constructor(readonly options: CreateControlPointOptions) {
    super();

    this.id = options.id ?? objectId();
  }

  readonly id: string;

  apply(ctx: CommandContext, source: CommandSource) {
    const { time, timing, sample, difficulty, effect } = this.options;

    const controlPoint = new ControlPointGroup(time);

    if (timing) {
      controlPoint.add(
        new TimingPoint(
          timing.beatLength,
          timing.beatLength,
        ),
      );
    }

    if (sample) {
      controlPoint.add(
        new SamplePoint(
          sample.volume,
          sample.sampleSet,
          sample.volume,
        ),
      );
    }

    if (effect) {
      controlPoint.add(
        new EffectPoint(
          effect.kiaiMode,
        ),
      );
    }

    if (difficulty) {
      controlPoint.add(
        new DifficultyPoint(
          difficulty.sliderVelocity,
        ),
      );
    }

    controlPoint.id = this.id;

    ctx.controlPoints.add(controlPoint);
  }

  createUndo(ctx: CommandContext): EditorCommand | null {
    return new DeleteControlPointCommand(this.id);
  }
}
