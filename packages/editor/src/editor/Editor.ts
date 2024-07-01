import {
  AudioManager,
  Axes,
  Bindable,
  Container,
  IKeyBindingHandler,
  Key,
  KeyBindingPressEvent,
  PlatformAction,
  ScrollEvent,
  UIEvent,
  dependencyLoader,
  resolved,
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
import { KeyDownEvent } from 'osucad-framework';

export class Editor
  extends Container
  implements IKeyBindingHandler<PlatformAction>
{
  constructor(readonly context: EditorContext) {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: PlatformAction): boolean {
    return binding instanceof PlatformAction;
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
    this.add(this.#clock);

    this.dependencies.provide(this.#clock);

    this.addAll(
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { top: 84, bottom: 48 },
        child: (this.#screenContainer = new EditorScreenContainer()),
      }),
      (this.#topBar = new EditorTopBar()),
      (this.#bottomBar = new EditorBottomBar()),
    );

    addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        if (track.isRunning) {
          track.stop();
        } else {
          track.start();
        }
      }
    });

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

    const amount = e.controlPressed ? 4 : 1;

    this.#clock.seekBeats(
      Math.sign(y),
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
      case Key.KeyZ:
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
      case Key.KeyX:
        this.#clock.seek(0);
        this.#clock.start();
        return true;
      case Key.KeyV:
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

  onKeyBindingPressed(e: KeyBindingPressEvent<PlatformAction>): boolean {
    console.log(e.pressed.name);

    switch (e.pressed) {
      case PlatformAction.Undo:
        this.context.commandHandler.undo();
        return true;
      case PlatformAction.Redo:
        this.context.commandHandler.redo();
        return true;
    }

    return false;
  }
}
