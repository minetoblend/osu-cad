import type { DifficultyPointPatch } from '../../beatmap/timing/DifficultyPoint.ts';
import type { EffectPointPatch } from '../../beatmap/timing/EffectPoint.ts';
import type { SamplePointPatch } from '../../beatmap/timing/SamplePoint.ts';
import type { TimingPointPatch } from '../../beatmap/timing/TimingPoint.ts';
import type { CommandContext } from './CommandContext.ts';
import type { CommandSource } from './CommandSource.ts';
import { hitObjectId } from '../../../../common/src';
import { ControlPointGroup } from '../../beatmap/timing/ControlPointGroup.ts';
import { DifficultyPoint } from '../../beatmap/timing/DifficultyPoint.ts';
import { EffectPoint } from '../../beatmap/timing/EffectPoint.ts';
import { SamplePoint } from '../../beatmap/timing/SamplePoint.ts';
import { TimingPoint } from '../../beatmap/timing/TimingPoint.ts';
import { DeleteControlPointCommand } from './DeleteControlPointCommand.ts';
import { EditorCommand } from './EditorCommand.ts';

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

    this.id = options.id ?? hitObjectId();
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
