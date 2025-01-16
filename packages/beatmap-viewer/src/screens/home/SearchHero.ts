import type { TextBox, WorkingBeatmapSet } from '@osucad/core';
import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { BeatmapSetResponse } from '../../mirrors/BeatmapSetResponse';
import { OsucadButton } from '@osucad/core';
import { Action, Anchor, Axes, Container, DrawSizePreservingFillContainer, EasingFunction, FillDirection, FillFlowContainer, Vec2 } from '@osucad/framework';
import { CatboyMirror } from '../../mirrors/CatboyMirror';
import { HomeScreenIntroSequence } from './HomeScreenIntroSequence';
import { HomeScreenTextBox } from './HomeScreenTextBox';

export class SearchHero extends FillFlowContainer {
  constructor() {
    super({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      direction: FillDirection.Vertical,
      spacing: new Vec2(30),
    });
  }

  protected load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;

    this.addAll(
      this.#logoContainer = new Container({
        relativeSizeAxes: Axes.X,
        height: 400,
        child: new DrawSizePreservingFillContainer({
          targetDrawSize: new Vec2(573, 192),
          relativeSizeAxes: Axes.Both,
          child: this.#logo = new HomeScreenIntroSequence().with({
            anchor: Anchor.Center,
            origin: Anchor.Center,
            scale: 0.75,
          }),
        }),
      }),
      this.#textBoxContainer = new Container({
        relativeSizeAxes: Axes.X,
        height: 60,
        children: [
          new Container({
            relativeSizeAxes: Axes.X,
            autoSizeAxes: Axes.Y,
            padding: { right: 100 },
            child: this.#searchBox = new HomeScreenTextBox().adjust(it =>
              it.onCommit.addListener(text => this.search(text)),
            ),
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
          new OsucadButton({
            anchor: Anchor.CenterRight,
            origin: Anchor.CenterRight,
            autoSizeAxes: Axes.None,
            width: 94,
            height: 40,
          }).withText('Search').withAction(() => this.search(this.#searchBox.text)),
        ],
      }),
    );
  }

  #logo!: HomeScreenIntroSequence;

  #logoContainer!: Container;

  #minimized = false;

  #textBoxContainer !: Container;

  #searchBox!: TextBox;

  minimize() {
    if (this.#minimized)
      return;

    this.#minimized = true;

    this.layoutDuration = 100;

    this.direction = FillDirection.Horizontal;
    this.#logoContainer.resizeHeightTo(60, 500, EasingFunction.OutExpo);
    this.#logoContainer.resizeWidthTo(0.2, 200, EasingFunction.OutExpo);
    this.#textBoxContainer.resizeWidthTo(0.8);
    this.#logo.scaleTo(1, 500, EasingFunction.OutExpo);
  }

  protected loadComplete() {
    super.loadComplete();

    this.#textBoxContainer
      .fadeOut()
      .delay(500)
      .fadeIn(500);
  }

  #searching = false;

  get searching() {
    return this.#searching;
  }

  set searching(value) {
    this.#searching = value;
  }

  async search(term: string) {
    if (this.searching)
      return;

    try {
      this.searching = true;

      term = term.trim();

      if (!term.length)
        return;

      if (/^\d+$/.test(term)) {
        const id = Number.parseInt(term);

        const { beatmapset_id } = await new CatboyMirror().lookupBeatmap(id);

        const beatmapSet = await new CatboyMirror().loadBeatmapSet(beatmapset_id);

        this.openBeatmap.emit({ beatmapSet, id });
        return;
      }

      const match = term.match(/^https:\/\/osu\.ppy\.sh\/beatmapsets\/(\d+)#osu\/(\d+$)/);

      if (match) {
        const [_, mapsetId, beatmapId] = match;

        const beatmapSet = await new CatboyMirror().loadBeatmapSet(Number.parseInt(mapsetId));

        this.openBeatmap.emit({ beatmapSet, id: Number.parseInt(beatmapId) });
        return;
      }

      if (!term.includes('"'))
        term = `"${term}"`;

      this.searchResults.emit(await new CatboyMirror().search(term));
    }
    finally {
      this.searching = false;
    }
  }

  searchResults = new Action<BeatmapSetResponse[]>();

  openBeatmap = new Action<{ beatmapSet: WorkingBeatmapSet; id: number }>();
}
