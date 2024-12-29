import type { ScreenTransitionEvent } from 'osucad-framework';
import type { BeatmapItemInfo } from './beatmapSelect/BeatmapItemInfo';
import type { BeatmapSelect } from './beatmapSelect/BeatmapSelect';
import {
  Anchor,
  Axes,
  BindableBoolean,
  Container,
  dependencyLoader,
  EasingFunction,
  FillDirection,
  FillFlowContainer,
  resolved,
  Vec2,
} from 'osucad-framework';
import { OsucadScreen } from '../../common/src/screens/OsucadScreen';
import { LoadingSpinner } from './drawables/LoadingSpinner';
import { ThemeColors } from './editor/ThemeColors';
import { BeatmapStore } from './environment';
import { OsucadSpriteText } from './OsucadSpriteText';

export class BeatmapImportScreen extends OsucadScreen {
  constructor(readonly beatmapSelect: BeatmapSelect) {
    super();
  }

  @resolved(BeatmapStore)
  beatmaps!: BeatmapStore;

  isImporting = new BindableBoolean(false);

  #content = new FillFlowContainer({
    relativeSizeAxes: Axes.Both,
    layoutDuration: 400,
    layoutEasing: EasingFunction.OutExpo,
    direction: FillDirection.Vertical,
  });

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.padding = 50;

    this.addAllInternal(
      new FillFlowContainer({
        autoSizeAxes: Axes.Both,
        anchor: Anchor.TopCenter,
        origin: Anchor.TopCenter,
        spacing: new Vec2(10),
        children: [
          new OsucadSpriteText({
            text: 'Importing beatmaps',
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
            color: this.colors.text,
            y: 10,
            fontSize: 28,
          }),
          new LoadingSpinner({
            width: 30,
            height: 30,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
        ],
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { top: 50 },
        children: [
          this.#content,
        ],
      }),
    );

    this.isImporting.bindTo(this.beatmaps.isImporting);

    this.beatmaps.added.addListener(this.#onAdded, this);
  }

  #counter = 0;

  #addedBeatmaps: BeatmapItemInfo[] = [];

  #onAdded(beatmap: BeatmapItemInfo) {
    this.#addedBeatmaps.push(beatmap);
  }

  update() {
    super.update();

    if (this.#addedBeatmaps.length === 0)
      return;

    const beatmaps = [...this.#addedBeatmaps].reverse();

    this.#addedBeatmaps.length = 0;

    for (const beatmap of beatmaps) {
      const text = new OsucadSpriteText({
        text: `${beatmap.artist} - ${beatmap.title} [${beatmap.difficultyName}]`,
        fontSize: 20,
        anchor: Anchor.TopCenter,
        origin: Anchor.TopCenter,
        color: this.colors.text,
        alpha: 0,
      });

      text.alwaysPresent = true;

      this.#content.insert(--this.#counter, text);

      text.onLoadComplete.addListener(() => text.fadeInFromZero(150));
    }
  }

  updateAfterChildren() {
    super.updateAfterChildren();

    const drawHeight = this.drawHeight;

    for (let i = 0; i < this.#content.children.length; i++) {
      const child = this.#content.children[i];
      if (child.y > drawHeight) {
        this.#content.remove(child);
        i--;
      }
    }
  }

  #exited = false;

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.isImporting.addOnChangeListener((e) => {
      if (!e.value)
        this.schedule(() => this.showBeatmapSelect());
    }, { immediate: true });
  }

  showBeatmapSelect() {
    if (this.#exited)
      return;

    const screenStack = this.screenStack;

    this.exit();
    screenStack.push(this.beatmapSelect);

    this.#exited = true;
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.beatmaps.added.removeListener(this.#onAdded, this);
  }
}
