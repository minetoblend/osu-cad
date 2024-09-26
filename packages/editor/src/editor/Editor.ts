import type {
  IKeyBindingHandler,
  KeyBindingPressEvent,
  KeyDownEvent,
  ScreenExitEvent,
  ScreenTransitionEvent,
  ScrollEvent,
  UIEvent,
} from 'osucad-framework';
import type { BackgroundScreen } from '../BackgroundScreen.ts';
import type { EditorContext } from './context/EditorContext';
import {
  Action,
  Anchor,
  asyncDependencyLoader,
  AudioManager,
  Axes,
  Bindable,
  clamp,
  Container,
  EasingFunction,
  Key,
  PlatformAction,
  resolved,
} from 'osucad-framework';
import { BeatmapComboProcessor } from '../beatmap/beatmapProcessors/BeatmapComboProcessor';
import { BeatmapStackingProcessor } from '../beatmap/beatmapProcessors/BeatmapStackingProcessor';
import { Additions } from '../beatmap/hitSounds/Additions';
import { AdditionsBindable } from '../beatmap/hitSounds/AdditionsBindable';
import { HitSoundState } from '../beatmap/hitSounds/BindableHitSound';
import { Notification } from '../notifications/Notification';
import { NotificationOverlay } from '../notifications/NotificationOverlay';
import { OsucadScreen } from '../OsucadScreen';
import { BeatmapSampleStore } from './BeatmapSampleStore';
import { EditorAction } from './EditorAction';
import { EditorBackground } from './EditorBackground.ts';
import { EditorBottomBar } from './EditorBottomBar';
import { EditorClock } from './EditorClock';
import { EditorMixer } from './EditorMixer';
import { EditorScreenContainer } from './EditorScreenContainer';
import { EditorTopBar } from './EditorTopBar';
import { ADDITIONS, CURRENT_SCREEN, HITSOUND, NEW_COMBO, NEW_COMBO_APPLIED } from './InjectionTokens';
import { ComposeScreen } from './screens/compose/ComposeScreen';
import { ToggleBindable } from './screens/compose/ToggleBindable';
import { EditorScreenType } from './screens/EditorScreenType';
import { SetupScreen } from './screens/setup/SetupScreen';
import { TimingScreen } from './screens/timing/TimingScreen';

export class Editor
  extends OsucadScreen
  implements IKeyBindingHandler<PlatformAction | EditorAction> {
  constructor(readonly context: EditorContext) {
    super();

    this.alpha = 0;
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.drawNode.enableRenderGroup();
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: PlatformAction | EditorAction): boolean {
    return binding instanceof PlatformAction || binding instanceof EditorAction;
  }

  readonly sampleStore = new BeatmapSampleStore();

  readonly requestSelectTool = new Action();

  #screenContainer!: EditorScreenContainer;

  #topBar!: EditorTopBar;

  #bottomBar!: EditorBottomBar;

  #clock!: EditorClock;

  @resolved(AudioManager)
  audioManager!: AudioManager;

  @resolved(EditorMixer)
  mixer!: EditorMixer;

  #newCombo = new ToggleBindable(false);

  #newComboApplied = new Action<boolean>();

  #hitSound = new HitSoundState();

  #additions = new AdditionsBindable(Additions.None);

  @asyncDependencyLoader()
  async init() {
    await this.context.load();

    this.context.beatmap.hitObjects.applyDefaultsImmediately = false;

    this.context.provideDependencies(this.dependencies);

    await this.loadComponentAsync(this.sampleStore);

    this.dependencies.provide(BeatmapSampleStore, this.sampleStore);

    this.dependencies.provide(NEW_COMBO, this.#newCombo);
    this.dependencies.provide(NEW_COMBO_APPLIED, this.#newComboApplied);
    this.dependencies.provide(ADDITIONS, this.#additions);
    this.dependencies.provide(HITSOUND, this.#hitSound);
    this.dependencies.provide(CURRENT_SCREEN, this.currentScreen);

    this.#clock = new EditorClock(this.context.song);
    this.addInternal(this.#clock);

    this.dependencies.provide(this.#clock);

    this.addAllInternal(
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { top: 28, bottom: 48 },
        child: (this.#screenContainer = new EditorScreenContainer()),
      }),
      (this.#topBar = new EditorTopBar()),
      (this.#bottomBar = new EditorBottomBar()),
    );

    this.addAllInternal(
      new BeatmapStackingProcessor(),
      new BeatmapComboProcessor(),
    );
  }

  protected loadComplete() {
    super.loadComplete();

    this.currentScreen.addOnChangeListener(
      ({ value: screen }) => {
        this.#updateScreen(screen);
      },
      { immediate: true },
    );
  }

  readonly currentScreen = new Bindable(EditorScreenType.Compose);

  #updateScreen(screen: EditorScreenType) {
    switch (screen) {
      case EditorScreenType.Setup:
        this.#screenContainer.screen = new SetupScreen();
        break;
      case EditorScreenType.Compose:
        this.#screenContainer.screen = new ComposeScreen();
        break;
      case EditorScreenType.Timing:
        this.#screenContainer.screen = new TimingScreen();
        break;
    }
  }

  onScroll(e: ScrollEvent): boolean {
    const y = e.scrollDelta.y;

    if (e.controlPressed) {
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
    if (e.controlPressed || e.altPressed || e.metaPressed)
      return false;

    switch (e.key) {
      case Key.Escape:
        this.exit();
        return true;
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

      case Key.F1:
        this.currentScreen.value = EditorScreenType.Compose;
        return true;
      case Key.F3:
        this.currentScreen.value = EditorScreenType.Timing;
        return true;
      case Key.F4:
        this.currentScreen.value = EditorScreenType.Setup;
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

    const controlPoint
      = direction < 1
        ? [...controlPointInfo.groups].reverse().find(cp => cp.time < this.#clock.currentTimeAccurate)
        : controlPointInfo.groups.find(
          cp => cp.time > this.#clock.currentTimeAccurate,
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
      case EditorAction.SeekToStart: {
        const firstObjectTime
          = this.context.beatmap.hitObjects.first?.startTime;

        if (
          firstObjectTime === undefined
          || this.#clock.currentTimeAccurate === firstObjectTime
        ) {
          this.#clock.seek(0);
        }
        else {
          this.#clock.seek(firstObjectTime);
        }
        return true;
      }
      case EditorAction.Play:
        if (this.#clock.isRunning) {
          this.#clock.stop();
        }
        else {
          this.#clock.start();
        }
        return true;
      case EditorAction.PlayFromStart:
        this.#clock.seek(0);
        this.#clock.start();
        return true;
      case EditorAction.SeekToEnd: {
        if (this.context.beatmap.hitObjects.length === 0) {
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
      it => it >= this.#clock.beatSnapDivisor.value,
    );

    if (index === -1) {
      index = 0;
    }

    this.#clock.beatSnapDivisor.value
      = possibleSnapValues[
        clamp(index + change, 0, possibleSnapValues.length - 1)
      ];
  }

  onEntering(e: ScreenTransitionEvent): boolean {
    super.onEntering(e);

    this.fadeIn(500);

    this.#topBar.y = -100;
    this.#topBar.moveToY(0, 500, EasingFunction.OutExpo);

    this.#bottomBar.y = 100;
    this.#bottomBar.moveToY(0, 500, EasingFunction.OutExpo);

    this.#screenContainer.scale = 0.9;
    this.#screenContainer.scaleTo(1, 500, EasingFunction.OutExpo);

    const hitObject = this.context.beatmap.hitObjects.first;
    if (hitObject) {
      this.#clock.seek(hitObject.startTime, false);
    }

    return false;
  }

  onExiting(e: ScreenExitEvent): boolean {
    if (super.onExiting(e))
      return true;
    if (this.#exitFromError) {
      this.#exited = true;
      return false;
    }

    this.fadeOut(100);
    this.expire();

    return false;
  }

  dispose(disposing: boolean = true) {
    this.context.dispose();

    super.dispose(disposing);
  }

  performExit() {
    this.exit();
  }

  #exitFromError = false;

  #exited = false;

  updateSubTree(): boolean {
    try {
      return super.updateSubTree();
    }
    catch (e) {
      console.error(e);

      if (!this.#exited) {
        this.#exitFromError = true;
        this.screenStack.exit(this);

        this.dependencies.resolve(NotificationOverlay)
          .add(new Notification(
            'Error',
            'An unexpected error happened.',
            0xEB345E,
          ));
      }

      return true;
    }
  }

  update() {
    super.update();

    this.context.beatmap.hitObjects.applyDefaultsWhereNeeded();
  }

  createBackground(): BackgroundScreen | null {
    return new EditorBackground(this.context.backgroundBindable);
  }
}
