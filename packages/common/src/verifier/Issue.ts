import type { Drawable, MenuItem } from 'osucad-framework';
import type { DrawableTimestamp } from '../editor/screens/modding/DrawableTimestamp';
import type { HitObject } from '../hitObjects/HitObject';
import type { Check } from './Check';
import type { VerifierBeatmap } from './VerifierBeatmap';
import { Comparer } from 'osucad-framework';

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
  beatmap?: VerifierBeatmap<any>;
  cause?: string;
  timestamp?: number | HitObject | HitObject[] | DrawableTimestamp;
  actions?: MenuItem[];
}

export class Issue {
  constructor(readonly check: Check, options: IssueOptions) {
    const { level, message, cause, timestamp, beatmap, actions } = options;

    this.level = level;
    this.message = message;
    this.cause = cause;
    this.timestamp = timestamp;
    this.beatmap = beatmap;
    this.actions = actions ?? [];
  }

  readonly level: IssueLevel;
  readonly message: string | IssueMessagePart[];
  readonly cause?: string;
  readonly timestamp?: number | HitObject | HitObject[] | DrawableTimestamp;
  readonly beatmap?: VerifierBeatmap;
  readonly actions: MenuItem[];
}

export const IssueLevelComparer = new class extends Comparer<IssueLevel> {
  override compare(a: IssueLevel, b: IssueLevel): number {
    return this.getScore(a) - this.getScore(b);
  }

  getScore(level: IssueLevel) {
    switch (level) {
      case 'check':
        return 0;
      case 'minor':
        return 1;
      case 'warning':
        return 2;
      case 'problem':
        return 3;
      case 'error':
        return 4;
      default:
        return -1;
    }
  }
}();
