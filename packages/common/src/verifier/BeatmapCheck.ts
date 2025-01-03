import type { HitObject } from '../hitObjects/HitObject';
import type { IssueOptions } from './Issue';
import type { VerifierBeatmap } from './VerifierBeatmap';
import { Issue } from './Issue';

export interface CheckMetadata {
  readonly category: string;
  readonly message: string;
  readonly author: string;
  readonly documentation?: { title: string; description: string }[];
}

export abstract class BeatmapCheck<T extends HitObject = HitObject> {
  abstract get metadata(): CheckMetadata;

  abstract getIssues(beatmap: VerifierBeatmap<T>): AsyncGenerator<Issue, void, undefined>;

  protected createIssue(options: IssueOptions): Issue {
    return new Issue(this, options);
  }
}
