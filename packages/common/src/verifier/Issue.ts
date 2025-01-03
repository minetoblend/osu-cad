import type { HitObject } from '../hitObjects/HitObject';

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

export interface IssueMetadata {
  readonly category: string;
  readonly message: string;
  readonly author: string;
  readonly documentation?: { title: string; description: string }[];
}

export abstract class Issue {
  protected constructor(options: IssueOptions) {
    const { level, message, cause } = options;

    this.level = level;
    this.message = message;
    this.cause = cause;
  }

  abstract get metadata(): IssueMetadata;
  readonly level: IssueLevel;
  readonly message: string;
  readonly cause?: string;
}
