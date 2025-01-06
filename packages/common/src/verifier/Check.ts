import type { CheckMetadata } from './BeatmapCheck';
import type { IssueTemplate } from './template/IssueTemplate';
import type { VerifierBeatmap } from './VerifierBeatmap';
import { Component } from 'osucad-framework';
import { Issue } from './Issue';

export abstract class Check extends Component {
  abstract get metadata(): CheckMetadata;

  protected createIssue(
    template: IssueTemplate,
    beatmap: VerifierBeatmap<any> | null,
    ...args: any[]
  ): Issue {
    return new Issue(this, template, beatmap, args);
  }

  templates?: Record<string, IssueTemplate>;
}
