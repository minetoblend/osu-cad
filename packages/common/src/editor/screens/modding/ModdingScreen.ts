import type { ReadonlyDependencyContainer } from 'osucad-framework';
import type { Beatmap } from '../../../beatmap/Beatmap';
import type { BackgroundAdjustment } from '../../BackgroundAdjustment';
import { Anchor, Axes, Bindable, Container, resolved } from 'osucad-framework';
import { IBeatmap } from '../../../beatmap/IBeatmap';
import { Ruleset } from '../../../rulesets/Ruleset';
import { EditorBeatmap } from '../../EditorBeatmap';
import { ModelBackedEditorBeatmapProvidingContainer } from '../../ModelBackedEditorBeatmapProvidingContainer';
import { EditorScreen } from '../EditorScreen';
import { editorScreen } from '../metadata';
import { IssueList } from './IssueList';
import { ModdingComposer } from './ModdingComposer';

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

  protected override get applySafeAreaPadding(): boolean {
    return false;
  }

  activeBeatmap = new Bindable<Beatmap | null>(null);

  activeEditorBeatmap!: Bindable<EditorBeatmap>;

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

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.activeEditorBeatmap = new Bindable<EditorBeatmap>(this.editorBeatmap);

    this.addAllInternal(
      new Container({
        relativeSizeAxes: Axes.Both,
        width: 0.7,
        child: new ModelBackedEditorBeatmapProvidingContainer(
          this.activeEditorBeatmap,
          () => new ModdingComposer(),
        ),
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        width: 0.3,
        child: new IssueList(this.activeBeatmap.getBoundCopy()),
      }),
    );
  }

  protected override adjustBackground(background: BackgroundAdjustment) {
    super.adjustBackground(background);

    background.x = -0.15;
    background.width = 0.7;
    background.moveDuration = 300;
    background.resizeDuration = 300;
  }
}
