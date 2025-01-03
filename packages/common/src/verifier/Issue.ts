import type { HitObject } from '../hitObjects/HitObject';
import type { BeatmapCheck } from './BeatmapCheck';

export type IssueLevel =
  | 'info'
  | 'check'
  | 'error'
  | 'minor'
  | 'warning'
  | 'problem';

export interface IssueOptions {
  level: IssueLevel;
  message: string;
  cause?: string;
  timestamp?: number | HitObject | HitObject[];
}

export class Issue {
  constructor(readonly check: BeatmapCheck<any>, options: IssueOptions) {
    const { level, message, cause, timestamp } = options;

    this.level = level;
    this.message = message;
    this.cause = cause;
    this.timestamp = timestamp;
  }

  readonly level: IssueLevel;
  readonly message: string;
  readonly cause?: string;
  readonly timestamp?: number | HitObject | HitObject[];
}
