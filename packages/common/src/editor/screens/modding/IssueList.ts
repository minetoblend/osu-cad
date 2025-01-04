import type { ClickEvent, Drawable, HoverEvent, MouseDownEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import type { Beatmap } from '../../../beatmap/Beatmap';
import type { IBeatmap } from '../../../beatmap/IBeatmap';
import type { BeatmapVerifier } from '../../../verifier/BeatmapVerifier';
import type { IssueSectionContent } from './IssueSectionContent';
import { Anchor, Axes, Bindable, Box, Container, Direction, FillFlowContainer, resolved, Vec2 } from 'osucad-framework';
import { OsucadScrollContainer } from '../../../drawables/OsucadScrollContainer';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { IResourcesProvider } from '../../../io/IResourcesProvider';
import { OsucadColors } from '../../../OsucadColors';
import { Ruleset } from '../../../rulesets/Ruleset';
import { BeatmapSkin } from '../../../skinning/BeatmapSkin';
import { EditorBeatmap } from '../../EditorBeatmap';
import { IssueSection } from './IssueSection';

export class IssueList extends Container {
  @resolved(Ruleset)
  ruleset!: Ruleset;

  @resolved(EditorBeatmap)
  beatmap!: EditorBeatmap;

  #content!: Container;

  override get content(): Container<Drawable> {
    return this.#content;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.Both;

    this.addAllInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x17171B,
      }),
      new OsucadScrollContainer(Direction.Vertical).with({
        relativeSizeAxes: Axes.Both,
        child: this.#content = new FillFlowContainer({
          relativeSizeAxes: Axes.X,
          autoSizeAxes: Axes.Y,
          padding: 20,
          spacing: new Vec2(10),
          children: [
            this.#headers = new FillFlowContainer({
              relativeSizeAxes: Axes.X,
              autoSizeAxes: Axes.Y,
              spacing: new Vec2(4),
            }),
          ],
        }),
      }),
    );
  }

  #headers!: Container;

  #currentSectionContent!: IssueSectionContent;

  protected override loadComplete() {
    super.loadComplete();

    const verifier = this.ruleset.createBeatmapVerifier();

    if (verifier)
      this.createIssues(verifier).then();

    this.activeBeatmap.addOnChangeListener((beatmap) => {
      this.#currentSectionContent.expire();
      this.add(this.#currentSectionContent = this.#beatmapIssues.get(beatmap.value)!.createContent());
    });
  }

  #beatmapIssues = new Map<IBeatmap | null, IssueSection>();

  @resolved(IResourcesProvider)
  resoucesProvider!: IResourcesProvider;

  async createIssues(verifier: BeatmapVerifier) {
    const beatmaps = this.beatmap.beatmapSet?.beatmaps ?? [this.beatmap.beatmap];

    this.setupSections(beatmaps);

    const issues = verifier.getIssues(beatmaps, this.beatmap.fileStore, new BeatmapSkin(this.resoucesProvider, this.beatmap), this.resoucesProvider);

    for await (const issue of issues) {
      const section = this.#beatmapIssues.get(issue.beatmap?.beatmap ?? null)!;

      section.addIssue(issue);
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

  readonly activeBeatmap = new Bindable<Beatmap | null>(null);

  private setupSections(beatmaps: ReadonlyArray<Beatmap>) {
    const general = new IssueSection(null, this.activeBeatmap.getBoundCopy());
    this.#headers.add(general);
    this.#beatmapIssues.set(null, general);

    this.#currentSectionContent = general.createContent();

    for (const beatmap of beatmaps) {
      const section = new IssueSection(beatmap, this.activeBeatmap.getBoundCopy());
      this.#headers.add(section);
      this.#beatmapIssues.set(beatmap, section);
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
