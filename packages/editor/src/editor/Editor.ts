import {
  AudioManager,
  Axes,
  Bindable,
  clamp,
  Container,
  dependencyLoader,
  IKeyBindingHandler,
  Key,
  KeyBindingPressEvent,
  KeyDownEvent,
  PlatformAction,
  resolved,
  ScrollEvent,
  UIEvent,
} from 'osucad-framework';
import { EditorBottomBar } from './EditorBottomBar';
import { EditorClock } from './EditorClock';
import { EditorMixer } from './EditorMixer';
import { EditorScreenContainer } from './EditorScreenContainer';
import { EditorTopBar } from './EditorTopBar';
import { EditorContext } from './context/EditorContext';
import { EditorScreenType } from './screens/EditorScreenType';
import { ComposeScreen } from './screens/compose/ComposeScreen';
import { SetupScreen } from './screens/setup/SetupScreen';
import { EditorSelection } from './screens/compose/EditorSelection';
import { EditorAction } from './EditorAction';
import { EditorActionContainer } from './EditorActionContainer';
import { DifficultyCalculator } from './DifficultyCalculator';

export class Editor
  extends Container
  implements IKeyBindingHandler<PlatformAction | EditorAction>
{
  constructor(readonly context: EditorContext) {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: PlatformAction | EditorAction): boolean {
    return binding instanceof PlatformAction || binding instanceof EditorAction;
  }

  #screenContainer!: EditorScreenContainer;

  #topBar!: EditorTopBar;

  #bottomBar!: EditorBottomBar;

  #clock!: EditorClock;

  @resolved(AudioManager)
  audioManager!: AudioManager;

  @resolved(EditorMixer)
  mixer!: EditorMixer;

  @dependencyLoader()
  init() {
    const track = this.audioManager.createTrack(
      this.mixer.music,
      this.context.song,
    );

    this.#clock = new EditorClock(track);
    this.addInternal(this.#clock);

    this.dependencies.provide(this.#clock);

    const selection = new EditorSelection();
    this.dependencies.provide(EditorSelection, selection);

    this.addInternal(selection);

    const difficultyCalculator = new DifficultyCalculator();
    this.addInternal(difficultyCalculator);

    this.addAll(
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { top: 84, bottom: 48 },
        child: (this.#screenContainer = new EditorScreenContainer()),
      }),
      (this.#topBar = new EditorTopBar()),
      (this.#bottomBar = new EditorBottomBar()),
    );

    this.currentScren.addOnChangeListener(
      (screen) => {
        this.#updateScreen(screen);
      },
      { immediate: true },
    );
  }

  readonly currentScren = new Bindable(EditorScreenType.Compose);

  #updateScreen(screen: EditorScreenType) {
    switch (screen) {
      case EditorScreenType.Setup:
        this.#screenContainer.screen = new SetupScreen();
        break;
      case EditorScreenType.Compose:
        this.#screenContainer.screen = new ComposeScreen();
        break;
    }
  }

  onScroll(e: ScrollEvent): boolean {
    const y = e.scrollDelta.y;

    if (e.shiftPressed) {
      this.changeBeatSnapDivisor(Math.sign(e.scrollDelta.y));
      return true;
    }

    const amount = e.shiftPressed ? 4 : 1;

    this.#clock.seekBeats(
      -Math.sign(y),
      !this.#clock.isRunning,
      amount * (this.#clock.isRunning ? 2.5 : 1),
    );

    return false;
  }

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.controlPressed || e.altPressed || e.metaPressed) return false;

    switch (e.key) {
      case Key.ArrowLeft:
        this.#seek(e, -1);
        return true;
      case Key.ArrowRight:
        this.#seek(e, 1);
        return true;
      case Key.ArrowUp:
        this.#seekControlPoint(e, 1);
        return true;
      case Key.ArrowDown:
        this.#seekControlPoint(e, -1);
        return true;
    }

    return false;
  }

  #seek(e: UIEvent, direction: number) {
    const amount = e.controlPressed ? 4 : 1;

    this.#clock.seekBeats(
      direction,
      !this.#clock.isRunning,
      amount * (this.#clock.isRunning ? 2.5 : 1),
    );
  }

  #seekControlPoint(e: UIEvent, direction: number) {
    const controlPointInfo = this.context.beatmap.controlPoints;

    const controlPoint =
      direction < 1
        ? [...controlPointInfo.controlPoints]
            .reverse()
            .find((cp) => cp.time < this.#clock.currentTimeAccurate)
        : controlPointInfo.controlPoints.find(
            (cp) => cp.time > this.#clock.currentTimeAccurate,
          );

    if (controlPoint) {
      this.#clock.seek(controlPoint.time);
    }
  }

  onKeyBindingPressed(
    e: KeyBindingPressEvent<PlatformAction | EditorAction>,
  ): boolean {
    switch (e.pressed) {
      case PlatformAction.Undo:
        this.undo();
        return true;
      case PlatformAction.Redo:
        this.redo();
        return true;
      case PlatformAction.Cut:
        this.cut();
        return true;
      case PlatformAction.Copy:
        this.copy();
        return true;
      case PlatformAction.Paste:
        this.paste();
        return true;
      case EditorAction.SeekToStart:
        const firstObjectTime =
          this.context.beatmap.hitObjects.first?.startTime;

        if (
          firstObjectTime === undefined ||
          this.#clock.currentTimeAccurate === firstObjectTime
        ) {
          this.#clock.seek(0);
        } else {
          this.#clock.seek(firstObjectTime);
        }
        return true;
      case EditorAction.Play:
        if (this.#clock.isRunning) {
          this.#clock.stop();
        } else {
          this.#clock.start();
        }
        return true;
      case EditorAction.PlayFromStart:
        this.#clock.seek(0);
        this.#clock.start();
        return true;
      case EditorAction.SeekToEnd:
        if (this.context.beatmap.hitObjects.hitObjects.length === 0) {
          this.#clock.seek(this.#clock.trackLength);
          return true;
        }
        const lastObjectTime = this.context.beatmap.hitObjects.last!.endTime;
        this.#clock.seek(
          this.#clock.currentTimeAccurate === lastObjectTime
            ? this.#clock.trackLength
            : lastObjectTime,
        );
        return true;
    }

    return false;
  }

  get commandHandler() {
    return this.context.commandHandler;
  }

  undo() {
    this.commandHandler.undo();
  }

  redo() {
    this.commandHandler.redo();
  }

  cut() {
    console.log('cut');
  }

  copy() {
    console.log('copy');
  }

  paste() {
    console.log('paste');
  }

  changeBeatSnapDivisor(change: number) {
    let possibleSnapValues = [1, 2, 4, 8, 16];
    if (this.#clock.beatSnapDivisor.value % 3 === 0) {
      possibleSnapValues = [1, 2, 3, 6, 12, 16];
    }

    let index = possibleSnapValues.findIndex(
      (it) => it >= this.#clock.beatSnapDivisor.value,
    );

    if (index === -1) {
      index = 0;
    }

    this.#clock.beatSnapDivisor.value =
      possibleSnapValues[
        clamp(index + change, 0, possibleSnapValues.length - 1)
      ];
  }
}
