import type { CheckMetadata } from './BeatmapCheck';
import type { IssueOptions } from './Issue';
import { Issue } from './Issue';

export abstract class Check {
  abstract get metadata(): CheckMetadata;

  protected createIssue(options: IssueOptions): Issue {
    return new Issue(this, options);
  }
}
