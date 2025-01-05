import type { DependencyContainer, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, MenuItem, ReadonlyDependencyContainer, ScreenExitEvent, ScreenTransitionEvent } from 'osucad-framework';
import type { BackgroundScreen } from '../screens/BackgroundScreen';
import { asyncDependencyLoader, EasingFunction, PlatformAction, provide } from 'osucad-framework';
import { HitObjectList } from '../beatmap/HitObjectList';
import { IBeatmap } from '../beatmap/IBeatmap';
import { BeatmapComboProcessor } from '../beatmap/processors/BeatmapComboProcessor';
import { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import { UpdateHandler } from '../crdt/UpdateHandler';
import { PlayfieldClock } from '../gameplay/PlayfieldClock';
import { IResourcesProvider } from '../io/IResourcesProvider';
import { Ruleset } from '../rulesets/Ruleset';
import { OsucadScreen } from '../screens/OsucadScreen';
import { BeatmapSkin } from '../skinning/BeatmapSkin';
import { RulesetSkinProvidingContainer } from '../skinning/RulesetSkinProvidingContainer';
import { CommandManager } from './CommandManager';
import { EditorBackground } from './EditorBackground';
import { EditorBeatmap } from './EditorBeatmap';
import { EditorClock } from './EditorClock';
import { EditorLayout } from './EditorLayout';
import { EditorNavigation } from './EditorNavigation';
import { ComposeScreen } from './screens/compose/ComposeScreen';
import { EditorScreenManager } from './screens/EditorScreenManager';
import { SetupScreen } from './screens/setup/SetupScreen';
import { TimingScreen } from './screens/timing/TimingScreen';

@provide(Editor)
export class Editor extends OsucadScreen implements IKeyBindingHandler<PlatformAction> {
  constructor(readonly editorBeatmap: EditorBeatmap) {
    super();

    this.beatmap = editorBeatmap.beatmap;
  }

  readonly beatmap: IBeatmap;

  #screenManager = new EditorScreenManager();

  @asyncDependencyLoader()
  async [Symbol('loadAsync')](dependencies: ReadonlyDependencyContainer) {
    await this.loadComponentAsync(this.editorBeatmap);

    const ruleset = this.editorBeatmap.ruleset;
    if (!ruleset) {
      // TODO: display message
      this.exit();
      return;
    }

    this.#dependencies.provide(Ruleset, ruleset);

    this.addInternal(this.editorBeatmap);

    this.#dependencies.provide(EditorBeatmap, this.editorBeatmap);
    this.#dependencies.provide(IBeatmap, this.beatmap);
    this.#dependencies.provide(CommandManager, this.editorBeatmap.commandManager);
    this.#dependencies.provide(ControlPointInfo, this.editorBeatmap.controlPoints);
    this.#dependencies.provide(HitObjectList, this.beatmap.hitObjects);
    this.#dependencies.provide(UpdateHandler, this.editorBeatmap.updateHandler);

    this.addInternal(this.#editorClock = new EditorClock(this.editorBeatmap.track.value));
    this.#dependencies.provide(EditorClock, this.#editorClock);
    this.#dependencies.provide(PlayfieldClock, this.#editorClock);

    this.registerScreens(this.#screenManager);
    this.#dependencies.provide(EditorScreenManager, this.#screenManager);

    const resources = dependencies.resolve(IResourcesProvider);

    ruleset.postProcessBeatmap(this.beatmap);

    const beatmapSkin = new BeatmapSkin(resources, this.editorBeatmap, this.editorBeatmap.fileStore);

    await beatmapSkin.load();

    this.addAllInternal(
      new EditorNavigation(),
      new RulesetSkinProvidingContainer(
        ruleset,
        this.beatmap,
        beatmapSkin,
      ).with({
        child: this.#layout = new EditorLayout(),
      }),
    );
    this.addInternal(new BeatmapComboProcessor());

    if (this.beatmap.hitObjects.first)
      this.#editorClock.seek(this.beatmap.hitObjects.first.startTime, false);
  }

  protected registerScreens(screenManager: EditorScreenManager) {
    screenManager.register(SetupScreen);
    screenManager.register(ComposeScreen);
    screenManager.register(TimingScreen);

    screenManager.setCurrentScreen(ComposeScreen);
  }

  #dependencies!: DependencyContainer;

  #editorClock!: EditorClock;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    return this.#dependencies = super.createChildDependencies(parentDependencies);
  }

  override onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.fadeInFromZero(300);

    this.#layout.show();
  }

  override onExiting(e: ScreenExitEvent): boolean {
    this.#layout.hide();
    this.fadeOut(200, EasingFunction.OutQuad).expire();

    return super.onExiting(e);
  }

  readonly isKeyBindingHandler = true;

  #layout!: EditorLayout;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof PlatformAction;
  }

  onKeyBindingPressed?(e: KeyBindingPressEvent<PlatformAction>): boolean {
    switch (e.pressed) {
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

  createMenuItems(): MenuItem[] {
    return [];
  }

  override createBackground(): BackgroundScreen | null {
    return new EditorBackground(this.editorBeatmap);
  }

  override update() {
    super.update();

    this.beatmap.hitObjects.applyDefaultsWhereNeeded(
      this.#editorClock.currentTime - 3000,
      this.#editorClock.currentTime + 3000,
      10,
    );
  }
}
