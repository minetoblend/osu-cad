import type { Drawable, MenuItem } from '@osucad/framework';
import type { DrawableTimestamp } from '../editor/screens/modding/DrawableTimestamp';
import type { HitObject } from '../hitObjects/HitObject';
import type { Check } from './Check';
import type { IssueTemplate } from './template/IssueTemplate';
import type { VerifierBeatmap } from './VerifierBeatmap';
import { Comparer } from '@osucad/framework';

export type IssueLevel =
  | 'info'
  | 'check'
  | 'error'
  | 'minor'
  | 'warning'
  | 'problem';

export type IssueMessagePart = string | Drawable;

export class Issue {
  constructor(
    readonly check: Check,
    readonly template: IssueTemplate,
    readonly beatmap: VerifierBeatmap | null,
    readonly args: any[] = [],
  ) {
  }

  get level(): IssueLevel {
    return this.template.level;
  }

  get message() {
    return this.template.format(this.args);
  }

  readonly cause?: string;
  readonly timestamp?: number | HitObject | HitObject[] | DrawableTimestamp;
  actions: MenuItem[] = [];

  withActions(...actions: MenuItem[]): this {
    this.actions.push(...actions);
    return this;
  }
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
