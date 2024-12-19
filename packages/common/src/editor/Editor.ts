import type { DependencyContainer, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, ReadonlyDependencyContainer, ScreenTransitionEvent, ScrollEvent } from 'osucad-framework';
import { almostEquals, asyncDependencyLoader, clamp, PlatformAction } from 'osucad-framework';
import { OsucadScreen } from '../../../common/src/screens/OsucadScreen';
import { EditorAction } from '../../../editor/src/editor/EditorAction';
import { HitObjectList } from '../beatmap/HitObjectList';
import { IBeatmap } from '../beatmap/IBeatmap';
import { BeatmapComboProcessor } from '../beatmap/processors/BeatmapComboProcessor';
import { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import { UpdateHandler } from '../crdt/UpdateHandler';
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

export class Editor extends OsucadScreen implements IKeyBindingHandler<EditorAction | PlatformAction> {
  constructor(readonly editorBeatmap: EditorBeatmap) {
    super();

    this.beatmap = editorBeatmap.beatmap;
  }

  readonly beatmap: IBeatmap;

  #screenManager = new EditorScreenManager();

  @asyncDependencyLoader()
  async load() {
    await this.loadComponentAsync(this.editorBeatmap);
    this.addInternal(this.editorBeatmap);

    this.#dependencies.provide(EditorBeatmap, this.editorBeatmap);
    this.#dependencies.provide(IBeatmap, this.beatmap);
    this.#dependencies.provide(CommandManager, this.editorBeatmap.commandManager);
    this.#dependencies.provide(ControlPointInfo, this.editorBeatmap.controlPoints);
    this.#dependencies.provide(HitObjectList, this.beatmap.hitObjects);
    this.#dependencies.provide(UpdateHandler, this.editorBeatmap.updateHandler);

    this.#dependencies.provide(Ruleset, new OsuRuleset());

    this.addInternal(this.#editorClock = new EditorClock(this.editorBeatmap.track.value));
    this.#dependencies.provide(EditorClock, this.#editorClock);
    this.#dependencies.provide(PlayfieldClock, this.#editorClock);

    this.registerScreens(this.#screenManager);
    this.#dependencies.provide(EditorScreenManager, this.#screenManager);

    this.addInternal(new EditorLayout());
    this.addInternal(new BeatmapComboProcessor());
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

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof EditorAction || binding instanceof PlatformAction;
  }

  onKeyBindingPressed?(e: KeyBindingPressEvent<EditorAction | PlatformAction>): boolean {
    switch (e.pressed) {
      case EditorAction.Play:
        this.togglePlayback();
        break;
      case EditorAction.SeekToStart:
        this.seekToStart();
        break;
      case EditorAction.SeekToEnd:
        this.seekToEnd();
        break;
      case EditorAction.PlayFromStart:
        this.playFromStart();
        break;
      case PlatformAction.Undo:
        this.undo();
        break;
      case PlatformAction.Redo:
        this.redo();
        break;
      default:
        return false;
    }

    return true;
  }

  undo() {
    this.editorBeatmap.updateHandler.undo();
  }

  redo() {
    this.editorBeatmap.updateHandler.redo();
  }

  togglePlayback() {
    if (this.#editorClock.isRunning)
      this.#editorClock.stop();
    else
      this.#editorClock.start();
  }

  seekToStart() {
    const firstObjectTime = this.beatmap.hitObjects.first?.startTime;

    if (firstObjectTime === undefined || almostEquals(this.#editorClock.currentTimeAccurate, firstObjectTime))
      this.#editorClock.seek(0);
    else
      this.#editorClock.seek(firstObjectTime);
  }

  seekToEnd() {
    const lastObjectTime = this.beatmap.hitObjects.last?.endTime;

    if (lastObjectTime === undefined || almostEquals(this.#editorClock.currentTimeAccurate, lastObjectTime))
      this.#editorClock.seek(this.#editorClock.trackLength);
    else
      this.#editorClock.seek(lastObjectTime);
  }

  playFromStart() {
    this.#editorClock.seek(0);
    this.#editorClock.start();
  }
}
