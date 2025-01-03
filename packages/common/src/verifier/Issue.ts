import type { Drawable } from 'osucad-framework';
import type { IBeatmap } from '../beatmap/IBeatmap';
import type { DrawableTimestamp } from '../editor/screens/modding/DrawableTimestamp';
import type { HitObject } from '../hitObjects/HitObject';
import type { BeatmapCheck } from './BeatmapCheck';

export type IssueLevel =
  | 'info'
  | 'check'
  | 'error'
  | 'minor'
  | 'warning'
  | 'problem';

export type IssueMessagePart = string | Drawable;

export interface IssueOptions {
  level: IssueLevel;
  message: string | IssueMessagePart[];
  beatmap: IBeatmap<any>;
  cause?: string;
  timestamp?: number | HitObject | HitObject[] | DrawableTimestamp;
}

export class Issue {
  constructor(readonly check: BeatmapCheck<any>, options: IssueOptions) {
    const { level, message, cause, timestamp, beatmap } = options;

    this.level = level;
    this.message = message;
    this.cause = cause;
    this.timestamp = timestamp;
    this.beatmap = beatmap;
  }

  readonly level: IssueLevel;
  readonly message: string | IssueMessagePart[];
  readonly cause?: string;
  readonly timestamp?: number | HitObject | HitObject[] | DrawableTimestamp;
  readonly beatmap?: IBeatmap;
}
