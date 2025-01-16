import type { Bindable, ClickEvent, HoverEvent, HoverLostEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import type { Beatmap } from '../../../beatmap/Beatmap';
import type { Issue } from '../../../verifier/Issue';
import type { VerifierBeatmap } from '../../../verifier/VerifierBeatmap';
import { Action, Anchor, Axes, BindableBoolean, CompositeDrawable, DrawableSprite, FastRoundedBox, FillDirection, FillFlowContainer } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { ModdingConfigManager } from '../../../config/ModdingConfigManager';
import { ModdingSettings } from '../../../config/ModdingSettings';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../OsucadColors';
import { maxBy } from '../../../utils/arrayUtils';
import { IssueLevelComparer } from '../../../verifier/Issue';
import { IssueSectionContent } from './IssueSectionContent';

export class IssueSection extends CompositeDrawable {
  constructor(
    readonly beatmap: VerifierBeatmap | null,
    readonly activeBeatmap: Bindable<Beatmap | null>,
  ) {
    super();
  }

  #issues: Issue[] = [];

  get issues(): readonly Issue[] {
    return this.#issues;
  }

  issueAdded = new Action<Issue>();

  addIssue(issue: Issue) {
    this.#issues.push(issue);
    this.issueAdded.emit(issue);
    this.#updateIcon();
  }

  showMinorIssues = new BindableBoolean();

  #updateIcon() {
    this.#icon.texture = this.#getIcon();
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const config = dependencies.resolve(ModdingConfigManager);
    config.bindWith(ModdingSettings.ShowMinorIssues, this.showMinorIssues);

    let sectionName = 'General';

    if (this.beatmap)
      sectionName = this.beatmap.beatmapInfo.difficultyName;

    this.autoSizeAxes = Axes.Both;
    this.addAllInternal(
      this.#background = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        alpha: 0,
        cornerRadius: 4,
      }),
      new FillFlowContainer({
        autoSizeAxes: Axes.Both,
        padding: { left: 4, right: 8, vertical: 2 },
        direction: FillDirection.Horizontal,
        children: [
          this.#icon = new DrawableSprite({
            size: 24,
            texture: getIcon('issue-check'),
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
          new OsucadSpriteText({
            text: sectionName,
            fontSize: 14,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
            color: OsucadColors.text,
          }),
        ],
      }),
    );

    this.active.valueChanged.addListener(this.#updateBackground, this);
    this.activeBeatmap.addOnChangeListener(
      beatmap => this.active.value = beatmap.value === this.beatmap,
      { immediate: true },
    );

    this.showMinorIssues.addOnChangeListener(() => this.#updateIcon());
  }

  #background!: FastRoundedBox;

  #icon!: DrawableSprite;

  active = new BindableBoolean();

  #updateBackground() {
    let alpha = 0;
    if (this.isHovered)
      alpha += 0.1;
    if (this.active.value)
      alpha += 0.1;
    this.#background.fadeTo(alpha, 100);
  }

  override onHover(e: HoverEvent): boolean {
    this.#updateBackground();
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#updateBackground();
  }

  override onClick(e: ClickEvent): boolean {
    this.activeBeatmap.value = this.beatmap?.beatmap ?? null;
    return true;
  }

  #getIcon() {
    let issues = this.#issues;

    if (!this.showMinorIssues.value)
      issues = issues.filter(it => it.level !== 'minor');

    if (issues.length === 0)
      return getIcon('issue-check');

    const maxLevel = maxBy(issues.map(it => it.level), IssueLevelComparer.getScore);
    switch (maxLevel) {
      case 'check':
        return getIcon('issue-check');
      case 'minor':
        return getIcon('issue-minor');
      case 'warning':
        return getIcon('issue-warning');
      case 'problem':
        return getIcon('issue-problem');
      default:
        return getIcon('issue-info');
    }
  }

  #content?: IssueSectionContent;

  createContent() {
    this.#content ??= new IssueSectionContent(this);
    return this.#content!;
  }
}
