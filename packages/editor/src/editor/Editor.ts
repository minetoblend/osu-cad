import type {
  IKeyBindingHandler,
  KeyBindingPressEvent,
  KeyDownEvent,
  ScreenExitEvent,
  ScreenTransitionEvent,
  ScrollEvent,
  UIEvent,
  ValueChangedEvent,
} from 'osucad-framework';
import type { BackgroundScreen } from '../BackgroundScreen.ts';
import type { BeatmapItemInfo } from '../beatmapSelect/BeatmapItemInfo.ts';
import type { DrawableHitObject } from './hitobjects/DrawableHitObject.ts';
import type { HitObjectJudge, IHitObjectJudgeProvider } from './hitobjects/HitObjectJudge.ts';
import type { EditorScreen } from './screens/EditorScreen.ts';
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
import { Beatmap } from '../beatmap/Beatmap.ts';
import { BeatmapComboProcessor } from '../beatmap/beatmapProcessors/BeatmapComboProcessor';
import { BeatmapStackingProcessor } from '../beatmap/beatmapProcessors/BeatmapStackingProcessor';
import { HitObjectList } from '../beatmap/hitObjects/HitObjectList.ts';
import { IBeatmap } from '../beatmap/IBeatmap.ts';
import { ControlPointInfo } from '../beatmap/timing/ControlPointInfo.ts';
import { GameplayScreen } from '../gameplay/GameplayScreen.ts';
import { IResourcesProvider } from '../io/IResourcesProvider.ts';
import { DialogContainer } from '../modals/DialogContainer.ts';
import { Notification } from '../notifications/Notification';
import { NotificationOverlay } from '../notifications/NotificationOverlay';
import { OsucadScreen } from '../OsucadScreen';
import { ISkinSource } from '../skinning/ISkinSource.ts';
import { BeatmapSkin } from './BeatmapSkin.ts';
import { CommandManager } from './context/CommandManager.ts';
import { EditorDifficultyManager } from './difficulty/EditorDifficultyManager.ts';
import { EditorAction } from './EditorAction';
import { EditorBackground } from './EditorBackground.ts';
import { EditorBeatmap } from './EditorBeatmap.ts';
import { EditorBottomBar } from './EditorBottomBar';
import { EditorClock } from './EditorClock';
import { EditorDependencies } from './EditorDependencies.ts';
import { EditorExitDialog } from './EditorExitDialog.ts';
import { EditorMixer } from './EditorMixer';
import { EditorScreenContainer } from './EditorScreenContainer';
import { EditorTopBar } from './EditorTopBar';
import { EditorJudge, EditorJudgeProvider } from './hitobjects/EditorJudge.ts';
import { OsuPlayfield } from './hitobjects/OsuPlayfield.ts';
import { PlayfieldClock } from './hitobjects/PlayfieldClock.ts';
import { HitsoundPlayer } from './HitsoundPlayer.ts';
import { CompareScreen } from './screens/compare/CompareScreen.ts';
import { ComposeScreen } from './screens/compose/ComposeScreen';
import { EditorScreenType } from './screens/EditorScreenType';
import { HitSoundsScreen } from './screens/hitsounds/HitSoundsScreen.ts';
import { SetupScreen } from './screens/setup/SetupScreen';
import { TimingScreen } from './screens/timing/TimingScreen';

export class Editor
  extends OsucadScreen
  implements IKeyBindingHandler<PlatformAction | EditorAction>,
    IHitObjectJudgeProvider {
  constructor(readonly beatmapInfo: BeatmapItemInfo) {
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

  readonly requestSelectTool = new Action();

  #screenContainer!: EditorScreenContainer;

  #topBar!: EditorTopBar;

  #bottomBar!: EditorBottomBar;

  #clock!: EditorClock;

  @resolved(AudioManager)
  audioManager!: AudioManager;

  @resolved(EditorMixer)
  mixer!: EditorMixer;

  editorBeatmap!: EditorBeatmap;

  get beatmap() {
    return this.editorBeatmap.beatmap;
  }

  @asyncDependencyLoader()
  async init() {
    this.editorBeatmap = new EditorBeatmap(this.beatmapInfo);

    await this.editorBeatmap.load(this.dependencies.resolve(IResourcesProvider));

    const editorDependencies = new EditorDependencies(
      new OsuPlayfield()
        .withCustomJudgeProvider(new EditorJudgeProvider())
        .adjust((it) => {
          it.showJudgements = false;
          it.suppressHitSounds = true;
          it.hitObjectsAlwaysHit = true;
        }),
      await this.editorBeatmap.getOtherDifficulties(),
    );

    this.onDispose(() => editorDependencies.reusablePlayfield.dispose());

    this.dependencies.provide(EditorDependencies, editorDependencies);

    this.currentScreen.bindTo(editorDependencies.currentScreen);

    this.beatmap.hitObjects.applyDefaultsImmediately = false;

    this.dependencies.provide(EditorBeatmap, this.editorBeatmap);
    this.dependencies.provide(Beatmap, this.beatmap);
    this.dependencies.provide(IBeatmap, this.beatmap);
    this.dependencies.provide(HitObjectList, this.beatmap.hitObjects);
    this.dependencies.provide(ControlPointInfo, this.beatmap.controlPoints);
    this.dependencies.provide(CommandManager, this.editorBeatmap.commandManager);

    const skin = new BeatmapSkin(this.dependencies.resolve(ISkinSource), this.beatmap);

    await this.loadComponentAsync(skin);

    this.addInternal(skin);

    this.dependencies.provide(ISkinSource, skin);

    this.#clock = new EditorClock(this.beatmap.track.value);
    this.addInternal(this.#clock);

    this.dependencies.provide(this.#clock);
    this.dependencies.provide(PlayfieldClock, this.#clock);

    this.loadComponent(editorDependencies.reusablePlayfield);

    const hitSoundPlayer = new HitsoundPlayer();
    this.dependencies.provide(HitsoundPlayer, hitSoundPlayer);
    this.addInternal(hitSoundPlayer);

    const difficultyManager = new EditorDifficultyManager();

    this.addInternal(difficultyManager);

    this.dependencies.provide(EditorDifficultyManager, difficultyManager);

    this.addAllInternal(
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { top: 28 },
        child: (this.#screenContainer = new EditorScreenContainer()),
      }),
      (this.#topBar = new EditorTopBar()),
      (this.#bottomBar = new EditorBottomBar()),
    );

    const stackingProcessor = new BeatmapStackingProcessor();
    const comboProcessor = new BeatmapComboProcessor();

    this.dependencies.provide(BeatmapStackingProcessor, stackingProcessor);
    this.dependencies.provide(BeatmapComboProcessor, comboProcessor);

    this.addAllInternal(stackingProcessor, comboProcessor);
  }

  protected loadComplete() {
    super.loadComplete();

    this.currentScreen.addOnChangeListener(e => this.#updateScreen(e), { immediate: true });
  }

  readonly currentScreen = new Bindable(EditorScreenType.Compose);

  #updateScreen(screen: ValueChangedEvent<EditorScreenType>) {
    let screenToShow: EditorScreen;

    switch (screen.value) {
      case EditorScreenType.Setup:
        screenToShow = new SetupScreen();
        break;
      case EditorScreenType.Compose:
        screenToShow = new ComposeScreen();
        break;
      case EditorScreenType.Timing:
        screenToShow = new TimingScreen();
        break;
      case EditorScreenType.Hitsounds:
        screenToShow = new HitSoundsScreen();
        break;
      case EditorScreenType.Compare:
        screenToShow = new CompareScreen();
        break;
    }

    if (!this.#screenContainer.showScreen(screenToShow) && screen.previousValue !== undefined) {
      this.currentScreen.value = screen.previousValue;
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
        if (this.currentScreen.value !== EditorScreenType.Compose)
          this.currentScreen.value = EditorScreenType.Compose;
        else
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
        this.currentScreen.value = EditorScreenType.Setup;
        return true;
      case Key.F2:
        this.currentScreen.value = EditorScreenType.Compose;
        return true;
      case Key.F3:
      case Key.F6:
        this.currentScreen.value = EditorScreenType.Timing;
        return true;
      case Key.F4:
        this.currentScreen.value = EditorScreenType.Hitsounds;
        return true;

      case Key.F5:
        this.screenStack.push(new GameplayScreen(this.beatmapInfo));

        return true;
    }

    return false;
  }

  onSuspending(e: ScreenTransitionEvent) {
    super.onSuspending(e);

    this.#clock.stop();

    this.fadeOut(200, EasingFunction.OutQuad)
      .scaleTo(0.8, 200, EasingFunction.OutExpo);

    this.applyToBackground(it => it.fadeOut(200));
  }

  onResuming(e: ScreenTransitionEvent) {
    super.onResuming(e);

    this.fadeIn(300, EasingFunction.OutQuad).scaleTo(1, 300, EasingFunction.OutExpo);

    this.applyToBackground(it => it.fadeIn(300));
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
    const controlPointInfo = this.beatmap.controlPoints;

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
          = this.beatmap.hitObjects.first?.startTime;

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
        if (this.beatmap.hitObjects.length === 0) {
          this.#clock.seek(this.#clock.trackLength);
          return true;
        }
        const lastObjectTime = this.beatmap.hitObjects.last!.endTime;
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

  get commandManager() {
    return this.editorBeatmap.commandManager;
  }

  undo() {
    this.commandManager.undo();
  }

  redo() {
    this.commandManager.redo();
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

    const hitObject = this.beatmap.hitObjects.first;
    if (hitObject) {
      this.#clock.seek(hitObject.startTime, false);
    }

    return false;
  }

  #confirmedExit = false;

  onExiting(e: ScreenExitEvent): boolean {
    if (super.onExiting(e))
      return true;
    if (this.#exitFromError) {
      this.#exited = true;

      return false;
    }

    if (this.commandManager.hasUnsavedChanges && !this.#confirmedExit) {
      const dialogContainer = this.findClosestParentOfType(DialogContainer)!;
      if (dialogContainer.currentDialog)
        return true;

      const dialog = new EditorExitDialog();

      dialogContainer.showDialog(dialog);

      dialog.exitRequested.addListener(async (e) => {
        if (e.shouldSave)
          await this.beatmap.save?.();

        this.#confirmedExit = true;
        this.exit();
      });

      return true;
    }

    this.fadeOut(100);
    this.expire();

    return false;
  }

  dispose(disposing: boolean = true) {
    this.editorBeatmap.dispose();

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

    this.beatmap.hitObjects.applyDefaultsWhereNeeded(
      this.#clock.currentTime - 3000,
      this.#clock.currentTime + 3000,
      10,
    );
  }

  createBackground(): BackgroundScreen | null {
    return new EditorBackground(this.beatmap.backgroundTexture);
  }

  getJudge(hitObject: DrawableHitObject): HitObjectJudge | null {
    return new EditorJudge(hitObject);
  }
}
