import type { CheckMetadata } from './BeatmapCheck';
import type { IssueOptions } from './Issue';
import { Component } from 'osucad-framework';
import { Issue } from './Issue';

export abstract class Check extends Component {
  abstract get metadata(): CheckMetadata;

  protected createIssue(options: IssueOptions): Issue {
    return new Issue(this, options);
  }
}
