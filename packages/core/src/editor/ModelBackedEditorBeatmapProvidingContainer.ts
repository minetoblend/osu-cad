import type { Bindable, Drawable, ReadonlyDependencyContainer } from '@osucad/framework';
import type { EditorBeatmap } from './EditorBeatmap';
import { Anchor, Axes, CompositeDrawable, Container, EasingFunction } from '@osucad/framework';
import { LoadingSpinner } from '../drawables/LoadingSpinner';
import { OsucadColors } from '../OsucadColors';
import { arrayify } from '../utils/arrayUtils';
import { EditorBeatmapProvidingContainer } from './EditorBeatmapProvidingContainer';

export class ModelBackedEditorBeatmapProvidingContainer extends CompositeDrawable {
  constructor(beatmap: Bindable<EditorBeatmap>, readonly createContent: (beatmap: EditorBeatmap) => Drawable | Drawable[]) {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.beatmap = beatmap.getBoundCopy();
  }

  readonly beatmap: Bindable<EditorBeatmap>;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(new Container({
      relativeSizeAxes: Axes.Both,
      depth: -1,
      child: this.#spinner = new LoadingSpinner({
        size: 40,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        color: OsucadColors.text,
      }),
    }));

    this.beatmap.addOnChangeListener(beatmap => this.#presentNewBeatmap(beatmap.value), { immediate: true });
  }

  #updateId = 0;

  #current?: Drawable;

  #spinner!: LoadingSpinner;

  #isLoading = false;

  async #presentNewBeatmap(beatmap: EditorBeatmap) {
    const container = new EditorBeatmapProvidingContainer(beatmap, {
      children: [...arrayify(this.createContent(beatmap))],
      anchor: Anchor.Center,
      origin: Anchor.Center,
    });

    if (!this.#isLoading) {
      this.#spinner
        .scaleTo(0.5)
        .scaleTo(1, 300, EasingFunction.OutExpo)
        .fadeIn(200);
    }

    this.#isLoading = true;

    this.#current?.fadeOut(200).expire();
    this.#current = undefined;

    const id = ++this.#updateId;

    await Promise.all([
      await this.loadComponentAsync(container),
    ]);

    if (id !== this.#updateId)
      return;

    this.addInternal(this.#current = container);
    this.updateSubTree();

    this.#spinner.fadeOut(200);

    this.#isLoading = false;
  }
}
