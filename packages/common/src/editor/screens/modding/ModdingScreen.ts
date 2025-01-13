import type { Drawable, ReadonlyDependencyContainer } from 'osucad-framework';
import type { Beatmap } from '../../../beatmap/Beatmap';
import type { BackgroundAdjustment } from '../../BackgroundAdjustment';
import type { EditorSafeArea } from '../../EditorSafeArea';
import type { EditorCornerContent } from '../../ui/EditorCornerContent';
import { Anchor, Axes, BetterBackdropBlurFilter, Bindable, Box, Container, EasingFunction, provide, resolved, Vec2 } from 'osucad-framework';
import { IBeatmap } from '../../../beatmap/IBeatmap';
import { ModdingConfigManager } from '../../../config/ModdingConfigManager';
import { OsucadColors } from '../../../OsucadColors';
import { Ruleset } from '../../../rulesets/Ruleset';
import { EditorBeatmap } from '../../EditorBeatmap';
import { ModelBackedEditorBeatmapProvidingContainer } from '../../ModelBackedEditorBeatmapProvidingContainer';
import { HitObjectSelectionManager } from '../compose/HitObjectSelectionManager';
import { EditorScreen } from '../EditorScreen';
import { editorScreen } from '../metadata';
import { IssueList } from './IssueList';
import { ModdingComposer } from './ModdingComposer';
import { ModdingScreenSettings } from './ModdingScreenSettings';

@editorScreen({
  id: 'modding',
  name: 'Modding',
})
export class ModdingScreen extends EditorScreen {
  @resolved(Ruleset)
  ruleset!: Ruleset;

  @resolved(IBeatmap)
  beatmap!: IBeatmap;

  @resolved(EditorBeatmap)
  editorBeatmap!: EditorBeatmap;

  protected override applySafeAreaPadding(safeArea: EditorSafeArea) {
    this.#issueListContainer.padding = { top: safeArea.topRight.y, bottom: safeArea.bottom + 4 };
    this.#mainContent.padding = { top: safeArea.topLeft.y, bottom: safeArea.bottomLeft.y };
  }

  @provide(ModdingConfigManager)
  readonly config = new ModdingConfigManager();

  readonly activeBeatmap = new Bindable<Beatmap | null>(null);

  activeEditorBeatmap!: Bindable<EditorBeatmap>;

  @provide(HitObjectSelectionManager)
  readonly selection = new HitObjectSelectionManager();

  protected override loadComplete() {
    super.loadComplete();

    this.#editorBeatmapCache.set(this.editorBeatmap.beatmap, this.editorBeatmap);

    this.activeBeatmap.addOnChangeListener(beatmap => this.beatmapChanged(beatmap.value));
  }

  beatmapChanged(beatmap: Beatmap | null) {
    if (!beatmap)
      return;

    let editorBeatmap = this.#editorBeatmapCache.get(beatmap);
    if (!editorBeatmap) {
      editorBeatmap = new EditorBeatmap(beatmap, this.editorBeatmap.fileStore, this.editorBeatmap.beatmapSet);
      this.#editorBeatmapCache.set(beatmap, editorBeatmap);
    }

    this.activeEditorBeatmap.value = editorBeatmap;
  }

  #editorBeatmapCache = new Map<Beatmap, EditorBeatmap>();

  #mainContent!: Container;

  #playfieldContainer!: Drawable;

  #timelineContainer!: Container;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.activeEditorBeatmap = new Bindable<EditorBeatmap>(this.editorBeatmap);

    this.addAllInternal(
      this.#mainContent = new Container({
        relativeSizeAxes: Axes.Both,
        width: 0.7,
        child: this.#playfieldContainer = new ModelBackedEditorBeatmapProvidingContainer(
          this.activeEditorBeatmap,
          () => new ModdingComposer()
            .with({
              anchor: Anchor.Center,
              origin: Anchor.Center,
            })
            .doWhenLoaded((it) => {
              it.fadeInFromZero(200);
              it.playfieldContainer.scaleTo(1.05).scaleTo(1, 300, EasingFunction.OutExpo);
              this.#timelineContainer.child = it.topBar;
              it.topBar.fadeInFromZero(100);
            }),
        ).with({
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
      }),
      this.#rightContainer = new Container({
        relativeSizeAxes: Axes.Both,
        relativePositionAxes: Axes.Both,
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        skew: new Vec2(-0.075, 0),
        width: 0.25,
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            width: 2,
            color: 0x17171B,
            alpha: 0.8,
            filters: [
              new BetterBackdropBlurFilter({
                strength: 20,
                quality: 3,
              }),
            ],
          }),
          new Box({
            relativeSizeAxes: Axes.Y,
            width: 1,
            color: 0xB9C6DD,
            alpha: 0.2,
          }),
          this.#issueListContainer = new Container({
            relativeSizeAxes: Axes.Both,
            relativePositionAxes: Axes.Y,
            child: new IssueList(this.activeBeatmap.getBoundCopy()),
          }),
        ],
      }),
    );
  }

  override createTopBarContent(): Drawable {
    return new Container({
      relativeSizeAxes: Axes.X,
      width: 0.9,
      height: 80,
      children: [
        new Box({
          relativeSizeAxes: Axes.Both,
          color: OsucadColors.translucent,
          alpha: 0.8,
        }),
        this.#timelineContainer = new Container({
          relativeSizeAxes: Axes.Both,
        }),
      ],
    });
  }

  #rightContainer!: Container;

  #issueListContainer!: Container;

  protected override enterTransition() {
    this.#rightContainer.moveToX(0.3).moveToX(0, 300, EasingFunction.OutExpo);
    this.#issueListContainer.moveToY(0.5).moveToY(0, 400, EasingFunction.OutExpo);
  }

  protected override exitTransition() {
    super.exitTransition();

    this.#playfieldContainer.fadeOut(100);
    this.#rightContainer.moveToX(0.3, 300, EasingFunction.OutExpo);
    this.#issueListContainer.moveToY(0.5, 400, EasingFunction.OutExpo);
  }

  override createTopRightCornerContent(): EditorCornerContent {
    return new ModdingScreenSettings();
  }

  protected override adjustBackground(background: BackgroundAdjustment) {
    super.adjustBackground(background);

    background.scale = 1.1;
    background.moveDuration = 300;
    background.resizeDuration = 300;
  }
}
