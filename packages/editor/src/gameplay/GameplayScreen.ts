import type {
  DependencyContainer,
  KeyDownEvent,
  ScreenExitEvent,
  ScreenTransitionEvent,
} from 'osucad-framework';
import type { LoadedBeatmap } from '../beatmap/LoadedBeatmap.ts';
import type { BeatmapItemInfo } from '../beatmapSelect/BeatmapItemInfo.ts';
import {
  Anchor,
  asyncDependencyLoader,
  Axes,
  Container,
  DrawSizePreservingFillContainer,
  Key,
  resolved,
} from 'osucad-framework';
import { BackgroundScreen } from '../BackgroundScreen.ts';
import { Beatmap } from '../beatmap/Beatmap.ts';
import { BeatmapComboProcessor } from '../beatmap/beatmapProcessors/BeatmapComboProcessor.ts';
import { BeatmapStackingProcessor } from '../beatmap/beatmapProcessors/BeatmapStackingProcessor.ts';
import { OsuPlayfield } from '../editor/hitobjects/OsuPlayfield.ts';
import { PlayfieldClock } from '../editor/hitobjects/PlayfieldClock.ts';
import { IResourcesProvider } from '../io/IResourcesProvider.ts';
import { MainCursorContainer } from '../MainCursorContainer.ts';
import { OsucadScreen } from '../OsucadScreen.ts';
import { AccuracyOverlay } from './AccuracyOverlay.ts';
import { ComboOverlay } from './ComboOverlay.ts';
import { GameplayClock } from './GameplayClock.ts';
import { GameplayCursorContainer } from './GameplayCursorContainer.ts';
import { GameplayProcessor } from './GameplayProcessor.ts';
import { HitErrorBar } from './HitErrorBar.ts';
import { OsuActionInputManager } from './OsuActionInputManager.ts';

export class GameplayScreen extends OsucadScreen {
  constructor(
    readonly beatmapInfo: BeatmapItemInfo,
    readonly startTime: number = 0,
  ) {
    super();
  }

  @resolved(IResourcesProvider)
  resources!: IResourcesProvider;

  beatmap!: LoadedBeatmap;

  playfield: OsuPlayfield = new OsuPlayfield();

  gameplayClock!: GameplayClock;

  @asyncDependencyLoader()
  async load(dependencies: DependencyContainer) {
    this.beatmap = await this.beatmapInfo.load(this.resources);

    this.gameplayClock = new GameplayClock(this.beatmap.track.value);

    this.dependencies.provide(PlayfieldClock, this.gameplayClock);

    this.dependencies.provide(Beatmap, this.beatmap);

    this.dependencies.provide(OsuPlayfield, this.playfield);

    this.addAllInternal(
      new BeatmapComboProcessor(),
      new BeatmapStackingProcessor(),
    );

    const gameplayProcessor = new GameplayProcessor();

    this.dependencies.provide(GameplayProcessor, gameplayProcessor);

    this.addAllInternal(
      this.gameplayClock,
      gameplayProcessor,
      new Container({
        relativeSizeAxes: Axes.Both,
        child: new DrawSizePreservingFillContainer({
          targetDrawSize: { x: 640, y: 480 },
          children: [
            new Container({
              width: 512,
              height: 384,
              anchor: Anchor.Center,
              origin: Anchor.Center,
              child: new OsuActionInputManager().with({
                child: this.playfield,
              }),
            }),
          ],
        }),
      }),
      new HitErrorBar(),
      new ComboOverlay(),
      new AccuracyOverlay(),
      new GameplayCursorContainer(),
    );
  }

  onKeyDown(e: KeyDownEvent): boolean {
    switch (e.key) {
      case Key.Escape:
        this.exit();
        return true;
      case Key.Space: {
        if (this.beatmap.hitObjects.length === 0)
          return false;

        const timeRemaining = this.beatmap.hitObjects.first!.startTime - this.gameplayClock.currentTime;

        if (timeRemaining > 2000) {
          this.gameplayClock.seek(this.beatmap.hitObjects.first!.startTime - 2000);
          this.start();
        }
      }
    }

    return false;
  }

  @resolved(MainCursorContainer, true)
  cursorContainer?: MainCursorContainer;

  createBackground(): BackgroundScreen | null {
    return new BackgroundScreen();
  }

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    if (this.cursorContainer)
      this.cursorContainer.isVisible.value = false;

    this.fadeIn(200);

    this.start();
  }

  start() {
    let time = this.startTime;

    if (this.beatmap.hitObjects.length === 0) {
      this.exit();
      return;
    }

    if (Math.abs(time - this.beatmap.hitObjects.first!.startTime) < 2000) {
      time = this.beatmap.hitObjects.first!.startTime - 2000;
    }

    this.gameplayClock.seek(time);
    // this.gameplayClock.rate = 1.5;
    this.gameplayClock.start();
  }

  onExiting(e: ScreenExitEvent) {
    if (super.onExiting(e))
      return true;

    if (this.cursorContainer)
      this.cursorContainer.isVisible.value = true;

    return false;
  }

  #exited = false;

  exit() {
    if (this.#exited)
      return;

    this.#exited = true;
    super.exit();
  }

  update() {
    super.update();

    if (this.beatmap.hitObjects.length > 0) {
      const last = this.beatmap.hitObjects.last!;

      if (this.gameplayClock.currentTime > last.endTime + 1000) {
        this.exit();
      }
    }
  }
}