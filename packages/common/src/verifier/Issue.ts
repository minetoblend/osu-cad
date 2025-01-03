import type { HitObject } from '../hitObjects/HitObject';
import type { CheckMetadata } from './BeatmapCheck';

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
  constructor(readonly metadata: CheckMetadata, options: IssueOptions) {
    const { level, message, cause } = options;

    this.level = level;
    this.message = message;
    this.cause = cause;
  }

  readonly level: IssueLevel;
  readonly message: string;
  readonly cause?: string;
}
