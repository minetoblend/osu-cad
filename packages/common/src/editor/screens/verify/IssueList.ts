import type { ReadonlyDependencyContainer } from 'osucad-framework';
import type { BeatmapCheck } from '../../../verifier/BeatmapCheck';
import type { BeatmapVerifier } from '../../../verifier/BeatmapVerifier';
import { Axes, FillFlowContainer, resolved, Vec2 } from 'osucad-framework';
import { Ruleset } from '../../../rulesets/Ruleset';
import { EditorBeatmap } from '../../EditorBeatmap';
import { DrawableIssue } from './DrawableIssue';
import { DrawableIssueGroup } from './DrawableIssueGroup';

export class IssueList extends FillFlowContainer {
  @resolved(Ruleset)
  ruleset!: Ruleset;

  @resolved(EditorBeatmap)
  beatmap!: EditorBeatmap;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;
    this.padding = 20;
    this.spacing = new Vec2(10);

    const verifier = this.ruleset.createBeatmapVerifier();

    if (verifier)
      this.createIssues(verifier);
  }

  #issueGroups = new Map<BeatmapCheck<any>, DrawableIssueGroup>();

  createIssues(verifier: BeatmapVerifier) {
    for (const issue of verifier.getIssues(this.beatmap)) {
      let group = this.#issueGroups.get(issue.check);
      if (!group) {
        this.add(group = new DrawableIssueGroup(issue.check));
        this.#issueGroups.set(issue.check, group);
      }

      group.add(new DrawableIssue(issue));
    }
  }
}
