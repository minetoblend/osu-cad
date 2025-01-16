import type { Bindable, ClickEvent, Drawable, HoverEvent, MouseDownEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import type { Beatmap } from '../../../beatmap/Beatmap';
import type { IBeatmap } from '../../../beatmap/IBeatmap';
import type { BeatmapVerifier } from '../../../verifier/BeatmapVerifier';
import type { IssueSectionContent } from './IssueSectionContent';
import { Anchor, Axes, BindableBoolean, Container, Direction, EasingFunction, FillFlowContainer, resolved, Vec2 } from '@osucad/framework';
import { ModdingConfigManager } from '../../../config/ModdingConfigManager';
import { ModdingSettings } from '../../../config/ModdingSettings';
import { LoadingSpinner } from '../../../drawables/LoadingSpinner';
import { OsucadScrollContainer } from '../../../drawables/OsucadScrollContainer';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { IResourcesProvider } from '../../../io/IResourcesProvider';
import { OsucadColors } from '../../../OsucadColors';
import { Ruleset } from '../../../rulesets/Ruleset';
import { BeatmapSkin } from '../../../skinning/BeatmapSkin';
import { VerifierBeatmap } from '../../../verifier/VerifierBeatmap';
import { EditorBeatmap } from '../../EditorBeatmap';
import { IssueSection } from './IssueSection';

export class IssueList extends Container {
  @resolved(Ruleset)
  ruleset!: Ruleset;

  @resolved(EditorBeatmap)
  beatmap!: EditorBeatmap;

  #content!: Container;

  constructor(readonly activeBeatmap: Bindable<Beatmap | null>) {
    super();
  }

  override get content(): Container<Drawable> {
    return this.#content;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const config = dependencies.resolve(ModdingConfigManager);

    config.bindWith(ModdingSettings.ShowMinorIssues, this.showMinorIssues);

    this.relativeSizeAxes = Axes.Both;

    this.addAllInternal(
      new OsucadScrollContainer(Direction.Vertical).with({
        relativeSizeAxes: Axes.Both,
        masking: false,
        children: [
          this.#content = new FillFlowContainer({
            relativeSizeAxes: Axes.X,
            autoSizeAxes: Axes.Y,
            padding: { horizontal: 30, vertical: 20 },
            spacing: new Vec2(10),
            children: [
              this.#headers = new FillFlowContainer({
                relativeSizeAxes: Axes.X,
                autoSizeAxes: Axes.Y,
                spacing: new Vec2(4),
              }),
            ],
          }),
        ],
      }),
    );
  }

  readonly showMinorIssues = new BindableBoolean();

  #headers!: Container;

  #currentSectionContent!: IssueSectionContent;

  protected override loadComplete() {
    super.loadComplete();

    const verifier = this.ruleset.createBeatmapVerifier();

    if (verifier) {
      this.loadComponent(verifier);

      const spinner = new LoadingSpinner({
        size: 30,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        depth: -1,
      });
      this.addInternal(spinner);

      spinner.scaleTo(0.5)
        .scaleTo(1, 300, EasingFunction.OutExpo)
        .fadeInFromZero(200);

      this.createIssues(verifier).finally(() => spinner.scaleTo(0.5, 300, EasingFunction.OutExpo).fadeOut(200).expire());
    }

    this.activeBeatmap.addOnChangeListener((beatmap) => {
      this.remove(this.#currentSectionContent, false);
      this.add(this.#currentSectionContent = this.#beatmapIssues.get(beatmap.value)!.createContent());
    });
  }

  #beatmapIssues = new Map<IBeatmap | null, IssueSection>();

  @resolved(IResourcesProvider)
  resoucesProvider!: IResourcesProvider;

  async createIssues(verifier: BeatmapVerifier) {
    const beatmaps = [...this.beatmap.beatmapSet?.beatmaps ?? [this.beatmap.beatmap]]
      .map(beatmap => new VerifierBeatmap(beatmap, this.beatmap.fileStore));

    let startTime = performance.now();
    for (const beatmap of beatmaps) {
      beatmap.calculateStarRating();

      const now = performance.now();
      const timePassed = now - startTime;

      if (timePassed > 5) {
        startTime = now;
        await new Promise<void>(resolve => this.schedule(resolve));
      }
    }

    beatmaps.sort((a, b) =>
      ((a.starRating ?? Number.MAX_VALUE) - (b.starRating ?? Number.MAX_VALUE)),
    );

    this.setupSections(beatmaps);

    const skin = new BeatmapSkin(this.resoucesProvider, this.beatmap.beatmap, this.beatmap.fileStore);
    const issues = verifier.getIssues(beatmaps, this.beatmap.fileStore, skin, this.resoucesProvider);

    startTime = performance.now();

    for await (const issue of issues) {
      const section = this.#beatmapIssues.get(issue.beatmap?.beatmap ?? null)!;
      section.addIssue(issue);

      const now = performance.now();
      const timePassed = now - startTime;

      if (timePassed > 5) {
        startTime = now;
        await new Promise<void>(resolve => this.schedule(resolve));
      }
    }

    if (this.#beatmapIssues.size === 0) {
      this.add(new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        padding: { vertical: 25 },
        child: new OsucadSpriteText({
          text: 'No issues found.',
          anchor: Anchor.TopCenter,
          origin: Anchor.TopCenter,
          color: OsucadColors.text,
        }),
      }));
    }
  }

  private setupSections(beatmaps: ReadonlyArray<VerifierBeatmap>) {
    const general = new IssueSection(null, this.activeBeatmap.getBoundCopy());
    this.#headers.add(general);
    this.#beatmapIssues.set(null, general);

    this.add(this.#currentSectionContent = general.createContent());

    for (const beatmap of beatmaps) {
      const section = new IssueSection(beatmap, this.activeBeatmap.getBoundCopy());
      this.#headers.add(section);
      this.#beatmapIssues.set(beatmap.beatmap, section);
    }
  }

  override onHover(e: HoverEvent): boolean {
    return true;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    return true;
  }

  override onClick(e: ClickEvent): boolean {
    return true;
  }
}
