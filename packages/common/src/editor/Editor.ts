import type { DependencyContainer, ReadonlyDependencyContainer, ScreenTransitionEvent, ScrollEvent } from 'osucad-framework';
import { asyncDependencyLoader, clamp } from 'osucad-framework';
import { OsucadScreen } from '../../../common/src/screens/OsucadScreen';
import { HitObjectList } from '../beatmap/HitObjectList';
import { IBeatmap } from '../beatmap/IBeatmap';
import { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import { PlayfieldClock } from '../gameplay/PlayfieldClock';
import { OsuRuleset } from '../rulesets';
import { Ruleset } from '../rulesets/Ruleset';
import { CommandManager } from './CommandManager';
import { EditorBeatmap } from './EditorBeatmap';
import { EditorClock } from './EditorClock';
import { EditorLayout } from './EditorLayout';
import { ComposeScreen } from './screens/compose/ComposeScreen';
import { EditorScreenManager } from './screens/EditorScreenManager';
import { SetupScreen } from './screens/setup/SetupScreen';
import { TimingScreen } from './screens/timing/TimingScreen';

export class Editor extends OsucadScreen {
  constructor(readonly editorBeatmap: EditorBeatmap) {
    super();

    this.beatmap = editorBeatmap.beatmap;
  }

  readonly beatmap: IBeatmap;

  #screenManager = new EditorScreenManager();

  @asyncDependencyLoader()
  async load() {
    await this.loadComponentAsync(this.editorBeatmap);

    this.#dependencies.provide(EditorBeatmap, this.editorBeatmap);
    this.#dependencies.provide(IBeatmap, this.beatmap);
    this.#dependencies.provide(CommandManager, this.editorBeatmap.commandManager);
    this.#dependencies.provide(ControlPointInfo, this.editorBeatmap.controlPoints);
    this.#dependencies.provide(HitObjectList, this.beatmap.hitObjects);

    this.#dependencies.provide(Ruleset, new OsuRuleset());

    this.addInternal(this.#editorClock = new EditorClock(this.editorBeatmap.track.value));
    this.#dependencies.provide(EditorClock, this.#editorClock);
    this.#dependencies.provide(PlayfieldClock, this.#editorClock);

    this.registerScreens(this.#screenManager);
    this.#dependencies.provide(EditorScreenManager, this.#screenManager);

    this.addInternal(new EditorLayout());
  }

  protected registerScreens(screenManager: EditorScreenManager) {
    screenManager.register(SetupScreen);
    screenManager.register(ComposeScreen);
    screenManager.register(TimingScreen);

    screenManager.setCurrentScreen(TimingScreen);
  }

  #dependencies!: DependencyContainer;

  #editorClock!: EditorClock;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    return this.#dependencies = super.createChildDependencies(parentDependencies);
  }

  override onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.fadeInFromZero(300);
  }

  override onScroll(e: ScrollEvent): boolean {
    const y = e.scrollDelta.y;

    if (e.controlPressed) {
      this.changeBeatSnapDivisor(Math.sign(e.scrollDelta.y));
      return true;
    }

    const amount = e.shiftPressed ? 4 : 1;

    this.#editorClock.seekBeats(
      -Math.sign(y),
      !this.#editorClock.isRunning,
      amount * (this.#editorClock.isRunning ? 2.5 : 1),
    );

    return false;
  }

  protected changeBeatSnapDivisor(change: number) {
    let possibleSnapValues = [1, 2, 4, 8, 16];
    if (this.#editorClock.beatSnapDivisor.value % 3 === 0) {
      possibleSnapValues = [1, 2, 3, 6, 12, 16];
    }

    let index = possibleSnapValues.findIndex(
      it => it >= this.#editorClock.beatSnapDivisor.value,
    );

    if (index === -1) {
      index = 0;
    }

    this.#editorClock.beatSnapDivisor.value
      = possibleSnapValues[
        clamp(index + change, 0, possibleSnapValues.length - 1)
      ];
  }
}
